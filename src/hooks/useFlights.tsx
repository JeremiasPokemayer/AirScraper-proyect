import React, { useState } from "react";
import { useAtom } from "jotai";
import { dateAtom } from "../atoms";
import { SetStateAction } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL2;
const API_KEY = import.meta.env.VITE_API_KEY;

type Date = {
  date: any;
  returnDate: any;
};

export const useDate = (): [Date, React.Dispatch<SetStateAction<Date>>] => {
  return useAtom(dateAtom);
};

export const useFlights = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFlights = async (fligthsData) => {
    setLoading(true);
    setError(null);
    const {
      originSkyId,
      destinationSkyId,
      originEntityId,
      destinationEntityId,
      date,
      returnDate,
      cabinClass,
      adults,
      childrens,
      infants,
      sortedBy,
    } = fligthsData;

    try {
      const response = await fetch(
        `${API_BASE_URL}searchFlights?originSkyId=${originSkyId}&destinationSkyId=${destinationSkyId}&originEntityId=${originEntityId}&destinationEntityId=${destinationEntityId}&date=${date}&returnDate=${returnDate}&cabinClass=${cabinClass}&adults=${adults}&childrens=${childrens}&infants=${infants}&sortBy=${sortedBy}`,
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

  return { searchFlights, loading, error };
};

export const useFlightsIncomplete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFlightsIncomplete = async (sessionId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}searchIncomplete?sessionId=${sessionId}`,
        {
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
          },
        }
      );
      const result = await response.json();
      console.log(result);
      return result;
    } catch (err) {
      setError(err);
    }
  };

  return { searchFlightsIncomplete, loading, error };
};
