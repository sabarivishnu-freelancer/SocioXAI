import type { State } from "@/types/location";
import { andhraPradeshCities, andhraPradeshDistricts, andhraPradeshWards } from "./andhraPradesh";
import { karnatakaCities, karnatakaDistricts, karnatakaWards } from "./karnataka";
import { keralaCities, keralaDistricts, keralaWards } from "./kerala";
import { tamilNaduCities, tamilNaduDistricts, tamilNaduWards } from "./tamilNadu";
import { telanganaCities, telanganaDistricts, telanganaWards } from "./telangana";

export const states: State[] = [
  { id: "KL", name: "Kerala" },
  { id: "TN", name: "Tamil Nadu" },
  { id: "KA", name: "Karnataka" },
  { id: "AP", name: "Andhra Pradesh" },
  { id: "TS", name: "Telangana" },
];

export const districts = [...keralaDistricts, ...tamilNaduDistricts, ...karnatakaDistricts, ...andhraPradeshDistricts, ...telanganaDistricts];
export const cities = [...keralaCities, ...tamilNaduCities, ...karnatakaCities, ...andhraPradeshCities, ...telanganaCities];
export const wards = [...keralaWards, ...tamilNaduWards, ...karnatakaWards, ...andhraPradeshWards, ...telanganaWards];
