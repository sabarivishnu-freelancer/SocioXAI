import type { City, District, Ward } from "@/types/location";
import { createCities, createDemoWards, createDistricts } from "./seed";

export const keralaDistricts: District[] = createDistricts("KL", [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad",
]);

const cityNamesByDistrict = {
  Alappuzha: ["Alappuzha", "Chengannur", "Cherthala", "Kayamkulam"],
  Ernakulam: ["Kochi", "Aluva", "Kalamassery", "Angamaly", "Perumbavoor", "North Paravur", "Muvattupuzha", "Kothamangalam"],
  Idukki: ["Thodupuzha", "Kattappana", "Munnar"],
  Kannur: ["Kannur", "Thalassery", "Payyanur", "Mattannur"],
  Kasaragod: ["Kasaragod", "Kanhangad", "Nileshwar"],
  Kollam: ["Kollam", "Karunagappally", "Kottarakkara", "Punalur"],
  Kottayam: ["Kottayam", "Changanassery", "Pala", "Ettumanoor"],
  Kozhikode: ["Kozhikode", "Vadakara", "Koyilandy", "Ramanattukara"],
  Malappuram: ["Malappuram", "Manjeri", "Tirur", "Ponnani", "Perinthalmanna"],
  Palakkad: ["Palakkad", "Ottapalam", "Shoranur", "Chittur-Thathamangalam"],
  Pathanamthitta: ["Pathanamthitta", "Thiruvalla", "Adoor", "Pandalam"],
  Thiruvananthapuram: ["Thiruvananthapuram", "Neyyattinkara", "Attingal", "Varkala"],
  Thrissur: ["Thrissur", "Chalakudy", "Kodungallur", "Kunnamkulam", "Irinjalakuda", "Guruvayur"],
  Wayanad: ["Kalpetta", "Sulthan Bathery", "Mananthavady"],
};

export const keralaCities: City[] = createCities("KL", cityNamesByDistrict);
export const keralaWards: Ward[] = createDemoWards(keralaCities);
