"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Complaint } from "@/types/citizen";
import "leaflet/dist/leaflet.css";

function toRadians(value: number) { return (value * Math.PI) / 180; }
function distanceMeters(a: [number, number], b: [number, number]) {
  const earthRadius = 6371000;
  const dLat = toRadians(b[0] - a[0]);
  const dLng = toRadians(b[1] - a[1]);
  const lat1 = toRadians(a[0]);
  const lat2 = toRadians(b[0]);
  const haversine = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}
function isWithinWard(point: [number, number], center: [number, number] | undefined, radiusKm = 2.5) {
  if (!center) return true;
  return distanceMeters(point, center) <= radiusKm * 1000;
}

export function CitizenMap({ complaints, center, trackUser = true, wardCenter, wardRadiusKm = 2.5 }: { complaints: Complaint[]; center?: [number, number]; trackUser?: boolean; wardCenter?: [number, number]; wardRadiusKm?: number }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").LayerGroup | null>(null);
  const userMarkerRef = useRef<import("leaflet").CircleMarker | null>(null);
  const accuracyRef = useRef<import("leaflet").Circle | null>(null);
  const lastReverseGeocodeRef = useRef(0);
  const [mapReady, setMapReady] = useState(false);
  const [locationStatus, setLocationStatus] = useState(trackUser ? "Locating you..." : "Live location is off");
  const [locationAddress, setLocationAddress] = useState("");
  const visibleComplaints = useMemo(() => {
    if (!wardCenter) return complaints;
    return complaints.filter((complaint) => complaint.latitude !== null && complaint.longitude !== null && isWithinWard([complaint.latitude, complaint.longitude], wardCenter, wardRadiusKm));
  }, [complaints, wardCenter, wardRadiusKm]);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((leaflet) => {
      if (cancelled || !mapElement.current || mapRef.current) return;
      const map = leaflet.map(mapElement.current).setView(center ?? wardCenter ?? [20.5937, 78.9629], center ? 12 : (wardCenter ? 15 : 5));
      leaflet.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles © Esri", maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      markersRef.current = leaflet.layerGroup().addTo(map);
      setMapReady(true);
      window.setTimeout(() => map.invalidateSize(), 0);
    });
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; markersRef.current = null; userMarkerRef.current = null; accuracyRef.current = null; setMapReady(false); };
  }, [center, wardCenter]);

  useEffect(() => {
    if (!trackUser || !mapReady || !mapRef.current) return;
    if (!navigator.geolocation) { setLocationStatus("Live location is not supported"); return; }
    let firstLocation = true;
    const watchId = navigator.geolocation.watchPosition((position) => {
      void import("leaflet").then((leaflet) => {
        const map = mapRef.current;
        if (!map) return;
        const point: [number, number] = [position.coords.latitude, position.coords.longitude];
        if (!userMarkerRef.current) userMarkerRef.current = leaflet.circleMarker(point, { radius: 9, color: "#fff", weight: 3, fillColor: "#ef8469", fillOpacity: 1 }).bindTooltip("You are here", { direction: "top" }).addTo(map);
        else userMarkerRef.current.setLatLng(point);
        if (!accuracyRef.current) accuracyRef.current = leaflet.circle(point, { radius: position.coords.accuracy, color: "#ef8469", weight: 1, fillColor: "#ef8469", fillOpacity: 0.12 }).addTo(map);
        else accuracyRef.current.setLatLng(point).setRadius(position.coords.accuracy);
        if (firstLocation) { map.setView(point, 16); firstLocation = false; }
        const accuracy = Math.round(position.coords.accuracy);
        setLocationStatus(`${accuracy <= 20 ? "Precise" : accuracy <= 100 ? "Approximate" : "Low accuracy"} GPS · ±${accuracy}m`);
        if (Date.now() - lastReverseGeocodeRef.current > 30_000) {
          lastReverseGeocodeRef.current = Date.now();
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point[0]}&lon=${point[1]}&zoom=18&addressdetails=1`, { headers: { "Accept-Language": "en" } }).then((response) => response.ok ? response.json() as Promise<{ display_name?: string }> : null).then((result) => { if (result?.display_name) setLocationAddress(result.display_name); }).catch(() => undefined);
        }
      });
    }, () => setLocationStatus("Location permission is unavailable"), { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapReady, trackUser]);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((leaflet) => {
      if (cancelled || !mapRef.current || !markersRef.current) return;
      markersRef.current.clearLayers();
      const located = visibleComplaints.filter((complaint) => complaint.latitude !== null && complaint.longitude !== null);
      located.forEach((complaint) => leaflet.marker([complaint.latitude as number, complaint.longitude as number]).bindPopup(`<strong>${complaint.reference}</strong><br />${complaint.title}<br /><small>${complaint.status}</small>`).addTo(markersRef.current as import("leaflet").LayerGroup));
      if (located.length > 0) mapRef.current.fitBounds(leaflet.latLngBounds(located.map((complaint) => [complaint.latitude as number, complaint.longitude as number] as [number, number])).pad(0.25));
      else if (wardCenter) mapRef.current.setView(wardCenter, 15);
    });
    return () => { cancelled = true; };
  }, [visibleComplaints, wardCenter]);

  return <div className="citizen-map"><div ref={mapElement} className="citizen-map-canvas" /><div className="map-location-status"><b>{locationStatus}</b>{locationAddress && <span>{locationAddress}</span>}</div>{visibleComplaints.length === 0 && <span className="map-empty">No geotagged complaints within the active ward boundary yet.</span>}</div>;
}
