import { cities, districts, states, wards } from "@/data/locations";
import type { City, District, State, Ward } from "@/types/location";

export const locationService = {
  states: (): State[] => states,
  districtsForState: (stateId: string): District[] => districts.filter((district) => district.stateId === stateId),
  citiesForDistrict: (districtId: string): City[] => cities.filter((city) => city.districtId === districtId),
  wardsForCity: (cityId: string): Ward[] => wards.filter((ward) => ward.cityId === cityId),
  isValidSelection: (stateId: string, districtId: string, cityId: string, wardId: string): boolean => {
    const district = districts.find((item) => item.id === districtId);
    const city = cities.find((item) => item.id === cityId);
    const ward = wards.find((item) => item.id === wardId);
    return Boolean(district && district.stateId === stateId && city && city.districtId === districtId && ward && ward.cityId === cityId);
  },
};
