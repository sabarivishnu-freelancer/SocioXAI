import type { City, District, Ward } from "@/types/location";

export const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function createDistricts(stateId: string, names: string[]): District[] {
  return names.map((name) => ({ id: `${stateId}-${slug(name)}`, stateId, name }));
}

export function createCities(stateId: string, cityNamesByDistrict: Record<string, string[]>): City[] {
  return Object.entries(cityNamesByDistrict).flatMap(([districtName, names]) => names.map((name, index) => ({
    id: `${stateId}-${slug(districtName)}-${slug(name)}-${index + 1}`,
    districtId: `${stateId}-${slug(districtName)}`,
    name,
    type: name === districtName ? "corporation" : "municipality",
  })));
}

// Demo seed wards are deterministic city-scoped records. Replace them with official ward/API data when available.
const demoWardNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export function createDemoWards(cities: City[]): Ward[] {
  return cities.flatMap((city) => demoWardNumbers.map((number) => ({
    id: `${city.id}-w${number}`,
    cityId: city.id,
    name: `${city.name} Ward ${number}`,
    number,
  })));
}
