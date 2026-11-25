import { Restaurant } from "@/types/restaurant";

export const toLatLng = (r: Restaurant): [number, number] => [
  r.location.coordinates[1],
  r.location.coordinates[0],
]