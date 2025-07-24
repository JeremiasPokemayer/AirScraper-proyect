import { atomWithStorage } from "jotai/utils";
import { format } from "date-fns";

export const userAtom = atomWithStorage("user", {
  userLat: null,
  userLng: null,
  Adults: 1,
  Childrens: 0,
  Infants: 0,
  cabinClass: "economy",
  sortedBy: "best",
});

export const airportOriginAtom = atomWithStorage("airport", {
  name: null,
  id: null,
  skyId: null,
});

export const airportDestinationAtom = atomWithStorage("airport", {
  name: null,
  id: null,
  skyId: null,
});

export const dateAtom = atomWithStorage("date", {
  date: format(new Date(), "yyyy-MM-dd"),
  returnDate: format(new Date(), "yyyy-MM-dd"),
});
