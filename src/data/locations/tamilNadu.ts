import type { City, District, Ward } from "@/types/location";
import { createCities, createDemoWards, createDistricts } from "./seed";

export const tamilNaduDistricts: District[] = createDistricts("TN", [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvarur", "Tiruvannamalai", "Vellore", "Viluppuram", "Virudhunagar",
]);

const cityNamesByDistrict: Record<string, string[]> = {
  Ariyalur: ["Ariyalur", "Jayankondam"], Chengalpattu: ["Chengalpattu", "Tambaram", "Pallavaram"], Chennai: ["Chennai"], Coimbatore: ["Coimbatore", "Pollachi", "Mettupalayam"], Cuddalore: ["Cuddalore", "Chidambaram", "Panruti"], Dharmapuri: ["Dharmapuri", "Harur"], Dindigul: ["Dindigul", "Palani", "Kodaikanal"], Erode: ["Erode", "Bhavani", "Gobichettipalayam"], Kallakurichi: ["Kallakurichi", "Tirukoilur"], Kancheepuram: ["Kancheepuram", "Sriperumbudur"], Karur: ["Karur", "Kulithalai"], Krishnagiri: ["Krishnagiri", "Hosur"], Madurai: ["Madurai", "Melur", "Thirumangalam"], Mayiladuthurai: ["Mayiladuthurai", "Sirkazhi"], Nagapattinam: ["Nagapattinam", "Vedaranyam"], Namakkal: ["Namakkal", "Tiruchengode"], Nilgiris: ["Udhagamandalam", "Coonoor", "Gudalur"], Perambalur: ["Perambalur", "Arumbavur"], Pudukkottai: ["Pudukkottai", "Aranthangi"], Ramanathapuram: ["Ramanathapuram", "Paramakudi"], Ranipet: ["Ranipet", "Arakkonam"], Salem: ["Salem", "Mettur", "Attur"], Sivaganga: ["Sivaganga", "Karaikudi"], Tenkasi: ["Tenkasi", "Sankarankovil"], Thanjavur: ["Thanjavur", "Kumbakonam", "Pattukkottai"], Theni: ["Theni", "Bodinayakanur"], Thoothukudi: ["Thoothukudi", "Kovilpatti"], Tiruchirappalli: ["Tiruchirappalli", "Manapparai"], Tirunelveli: ["Tirunelveli", "Ambasamudram"], Tirupathur: ["Tirupathur", "Vaniyambadi"], Tiruppur: ["Tiruppur", "Dharapuram"], Tiruvallur: ["Tiruvallur", "Avadi", "Ponneri"], Tiruvarur: ["Tiruvarur", "Mannargudi"], Tiruvannamalai: ["Tiruvannamalai", "Arani"], Vellore: ["Vellore", "Gudiyatham"], Viluppuram: ["Viluppuram", "Tindivanam"], Virudhunagar: ["Virudhunagar", "Rajapalayam", "Sivakasi"],
};

export const tamilNaduCities: City[] = createCities("TN", cityNamesByDistrict);
export const tamilNaduWards: Ward[] = createDemoWards(tamilNaduCities);
