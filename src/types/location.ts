export interface State { id: string; name: string; }
export interface District { id: string; stateId: string; name: string; }
export interface City { id: string; districtId: string; name: string; type: "city" | "town" | "municipality" | "corporation"; }
export interface Ward { id: string; cityId: string; name: string; number: number; }
export interface LocationSelection { stateId: string; districtId: string; cityId: string; wardId: string; address: string; }
