"use client";

import { useMemo, useState } from "react";
import { locationService } from "@/services/locationService";
import type { LocationSelection, State, District, City, Ward } from "@/types/location";

export function LocationSelector({ value, onChange, error }: { value: LocationSelection; onChange: (value: LocationSelection) => void; error?: string }) {
  const [search, setSearch] = useState({ state: "", district: "", city: "", ward: "" });
  const [open, setOpen] = useState<string | null>(null);
  const states = locationService.states();
  const districts = useMemo(() => locationService.districtsForState(value.stateId).filter((item) => item.name.toLowerCase().includes(search.district.toLowerCase())), [value.stateId, search.district]);
  const cities = useMemo(() => locationService.citiesForDistrict(value.districtId).filter((item) => item.name.toLowerCase().includes(search.city.toLowerCase())), [value.districtId, search.city]);
  const wards = useMemo(() => locationService.wardsForCity(value.cityId).filter((item) => item.name.toLowerCase().includes(search.ward.toLowerCase())), [value.cityId, search.ward]);
  const choose = (key: "stateId" | "districtId" | "cityId" | "wardId", next: string) => onChange({ ...value, [key]: next, ...(key === "stateId" ? { districtId: "", cityId: "", wardId: "" } : {}), ...(key === "districtId" ? { cityId: "", wardId: "" } : {}), ...(key === "cityId" ? { wardId: "" } : {}) });
  const select = (key: "stateId" | "districtId" | "cityId" | "wardId", next: string, searchKey: keyof typeof search) => { choose(key, next); setSearch((current) => ({ ...current, [searchKey]: "", ...(key === "stateId" ? { district: "", city: "", ward: "" } : {}), ...(key === "districtId" ? { city: "", ward: "" } : {}), ...(key === "cityId" ? { ward: "" } : {}) })); setOpen(null); };
  return <div className="location-selector"><SearchSelect label="State" value={states.find((item) => item.id === value.stateId)?.name ?? ""} placeholder="Select State" search={search.state} setSearch={(next) => setSearch({ ...search, state: next })} open={open === "state"} setOpen={(next) => setOpen(next ? "state" : null)} options={states.filter((item) => item.name.toLowerCase().includes(search.state.toLowerCase()))} onSelect={(id) => select("stateId", id, "state")} /><SearchSelect label="District" value={districts.find((item) => item.id === value.districtId)?.name ?? ""} placeholder={value.stateId ? "Select District" : "Select State First"} disabled={!value.stateId} search={search.district} setSearch={(next) => setSearch({ ...search, district: next })} open={open === "district"} setOpen={(next) => setOpen(next ? "district" : null)} options={districts} onSelect={(id) => select("districtId", id, "district")} /><SearchSelect label="Town / City" value={cities.find((item) => item.id === value.cityId)?.name ?? ""} placeholder={value.districtId ? "Select Town / City" : "Select District First"} disabled={!value.districtId} search={search.city} setSearch={(next) => setSearch({ ...search, city: next })} open={open === "city"} setOpen={(next) => setOpen(next ? "city" : null)} options={cities} onSelect={(id) => select("cityId", id, "city")} /><SearchSelect label="Ward" value={wards.find((item) => item.id === value.wardId)?.name ?? ""} placeholder={value.cityId ? "Select Ward" : "Select Town / City First"} disabled={!value.cityId} search={search.ward} setSearch={(next) => setSearch({ ...search, ward: next })} open={open === "ward"} setOpen={(next) => setOpen(next ? "ward" : null)} options={wards} onSelect={(id) => select("wardId", id, "ward")} />{error && <div className="auth-error">{error}</div>}</div>;
}

function SearchSelect({ label, value, placeholder, search, setSearch, open, setOpen, options, onSelect, disabled }: { label: string; value: string; placeholder: string; search: string; setSearch: (value: string) => void; open: boolean; setOpen: (value: boolean) => void; options: (State | District | City | Ward)[]; onSelect: (id: string) => void; disabled?: boolean }) {
  const filteredOptions = options.filter((option) => option.name.toLowerCase().includes(search.toLowerCase()));
  const [activeIndex, setActiveIndex] = useState(0);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, filteredOptions.length - 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
    if (event.key === "Enter" && filteredOptions[activeIndex]) { event.preventDefault(); onSelect(filteredOptions[activeIndex].id); }
    if (event.key === "Escape") setOpen(false);
  };
  return <div className="location-field"><label>{label} <small>Required</small></label><button type="button" className={disabled ? "location-trigger disabled" : "location-trigger"} disabled={disabled} onClick={() => { setActiveIndex(0); setOpen(!open); }}><span>{value || placeholder}</span><b>{disabled ? "🔒" : "⌄"}</b></button>{open && !disabled && <div className="location-menu"><input autoFocus value={search} onChange={(event) => { setSearch(event.target.value); setActiveIndex(0); }} onKeyDown={handleKeyDown} placeholder={`Search ${label.toLowerCase()}...`} aria-label={`Search ${label.toLowerCase()}`} /><div className="location-options">{filteredOptions.length ? filteredOptions.map((option, index) => <button className={index === activeIndex ? "active" : ""} type="button" key={option.id} onMouseDown={(event) => event.preventDefault()} onClick={() => onSelect(option.id)}>{option.name}</button>) : <span>No matching locations</span>}</div></div>}</div>;
}
