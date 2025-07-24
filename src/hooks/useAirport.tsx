import React, { useState } from "react";
import { useAtom } from "jotai";
import { airportOriginAtom, airportDestinationAtom } from "../atoms";
import { SetStateAction } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

type Airport = {
  name: any;
  id: any;
  skyId: any;
};

export const useOriginAirport = (): [
  Airport,
  React.Dispatch<SetStateAction<Airport>>
] => {
  return useAtom(airportOriginAtom);
};

export const useDestinationAirport = (): [
  Airport,
  React.Dispatch<SetStateAction<Airport>>
] => {
  return useAtom(airportDestinationAtom);
};

export const useAirports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAirports = async (locationData) => {
    setLoading(true);
    setError(null);
    const { userLat, userLng } = locationData;

    try {
      const response = await fetch(
        `${API_BASE_URL}getNearByAirports?lat=${userLat}&lng=${userLng}`,
        {
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
          },
        }
      );
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err);
    }
  };

  return { getAirports, loading, error };
};

export const useSearchAirports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchAirports = async (query) => {
    setLoading(true);
    setError(null);
    const encodedQuery = encodeURIComponent(query);
    try {
      const response = await fetch(
        `${API_BASE_URL}searchAirport?query=${encodedQuery}`,
        {
          headers: {
            "X-RapidAPI-Key": API_KEY,
          },
        }
      );
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err);
    }
  };
  return { searchAirports, loading, error };
};
