// Google Places API (legacy Text Search + Place Details) — finds local
// businesses and their phone/website/address. This is the lead source.
// Docs: https://developers.google.com/maps/documentation/places/web-service/search-text

import { config } from "../config.mjs";

const TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

export async function searchPlaces(query) {
  if (!config.googlePlacesApiKey) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  const params = new URLSearchParams({ query, key: config.googlePlacesApiKey });
  const res = await fetch(`${TEXT_SEARCH_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Places text search HTTP error ${res.status}`);
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places text search error: ${data.status} ${data.error_message || ""}`);
  }
  return data.results || [];
}

export async function getPlaceDetails(placeId) {
  if (!config.googlePlacesApiKey) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,formatted_address,formatted_phone_number,international_phone_number,website,url",
    key: config.googlePlacesApiKey,
  });
  const res = await fetch(`${DETAILS_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Places details HTTP error ${res.status}`);
  const data = await res.json();
  if (data.status !== "OK") {
    throw new Error(`Places details error: ${data.status} ${data.error_message || ""}`);
  }
  return data.result;
}

export function pickRandom(list, n) {
  const copy = [...list];
  const out = [];
  while (copy.length && out.length < n) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}
