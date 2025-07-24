import css from "./home.module.css";
import React, { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { addDays, format } from "date-fns";
import { useUser } from "../../hooks/useUser";
import { useDate } from "../../hooks/useFlights";
import {
  useAirports,
  useOriginAirport,
  useDestinationAirport,
  useSearchAirports,
} from "../../hooks/useAirport";
import { useNavigate } from "react-router-dom";

export function HomeComponent() {
  const [user, setUser] = useUser();
  const [airport, setAirport] = useOriginAirport();
  const { getAirports } = useAirports();

  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        console.error(
          "La geolocalización no es compatible con este navegador."
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newUser = { ...user, userLat: latitude, userLng: longitude };
          setUser(newUser);

          try {
            const dataAirport = await getAirports(newUser);
            const newData = {
              ...airport,
              name: dataAirport.data.current.presentation.title,
              id: dataAirport.data.current.entityId,
              skyId: dataAirport.data.current.skyId,
            };
            setAirport(newData);
          } catch (e) {
            console.error("Error obteniendo aeropuerto:", e);
          }
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
        }
      );
    };

    getUserLocation();
  }, []);

  return (
    <div className={css.root}>
      <div className={css.hero}>
        <img
          className={css.imgTravel}
          src="https://www.gstatic.com/travel-frontend/animation/hero/flights_nc_dark_theme_4.svg"
          alt="imgTravel"
        />
        <h1>Flights</h1>
      </div>
      <SearchComponent />
    </div>
  );
}

function PassengerSelector() {
  const [user, setUser] = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const updateCount = (type, delta) => {
    setUser((prevUser) => {
      const currentCount = prevUser[type] || 0;
      const newCount = Math.max(0, currentCount + delta);
      return { ...prevUser, [type]: newCount };
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPassengers =
    (user.Adults || 1) + (user.Childrens || 0) + (user.Infants || 0);

  return (
    <div className={css.passengerSelector} ref={dropdownRef}>
      <button onClick={toggleDropdown} className={css.btnPassenger}>
        <img
          src="https://i.ibb.co/DD1pCDK9/user.png"
          alt="user"
          className={css.userIcon}
        />
        <span>{totalPassengers}</span>
      </button>

      {showDropdown && (
        <div className={css.dropdown}>
          {[
            { label: "Adults", key: "Adults" },
            {
              label: "Children",
              desc: "between 2 and 12 years old",
              key: "Childrens",
            },
            {
              label: "Children between 3 and 12 months",
              desc: "with seat",
              key: "Infants",
            },
          ].map(({ label, key, desc }) => (
            <div key={key} className={css.row}>
              <div>
                <strong>{label}</strong>
                {desc && <div className={css.desc}>{desc}</div>}
              </div>
              <div className={css.controls}>
                <button onClick={() => updateCount(key, -1)}>-</button>
                <span>{user[key] || 0}</span>
                <button onClick={() => updateCount(key, +1)}>+</button>
              </div>
            </div>
          ))}
          <div className={css.footer}>
            <button onClick={() => setShowDropdown(false)}>Cancel</button>
            <button onClick={() => setShowDropdown(false)}>List</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchComponent() {
  const navigate = useNavigate();
  const [user, setUser] = useUser();
  const [date, setDate] = useDate();
  const [query, setQuery] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);
  const { searchAirports } = useSearchAirports();
  const [airport, setAirport] = useOriginAirport();
  const [airportDestination, setAirportDestination] = useDestinationAirport();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const originInput = e.target.elements.origin.value;
    const destinationInput = e.target.elements.destination.value;

    const airportOriginData = await searchAirports(originInput);
    const airportDestinationData = await searchAirports(destinationInput);

    const updatedOrigin = {
      ...airport,
      name: airportOriginData.data[0].presentation.title,
      id: airportOriginData.data[0].entityId,
      skyId: airportOriginData.data[0].skyId,
    };
    const updatedDestination = {
      ...airportDestination,
      name: airportDestinationData.data[0].presentation.title,
      id: airportDestinationData.data[0].entityId,
      skyId: airportDestinationData.data[0].skyId,
    };

    setAirport(updatedOrigin);
    setAirportDestination(updatedDestination);

    setQuery(originInput);
    navigate("/flights");
  };

  const handleDateChange = (item) => {
    setRange([item.selection]);
    setDate({
      date: item.selection.startDate,
      returnDate: item.selection.endDate,
    });
  };

  return (
    <div className={css.passengerSelector}>
      <div className={css.ctnSearch}>
        <div className={css.ctnSelect}>
          <select name="goAndBack" className={css.select}>
            <option>Round trip</option>
            <option>Only ida</option>
            <option>Several cities</option>
          </select>
          <PassengerSelector />
          <select
            value={user.cabinClass}
            name="cabinClass"
            className={css.select}
            onChange={(e) => setUser({ ...user, cabinClass: e.target.value })}
          >
            <option>economy</option>
            <option>premium_economy</option>
            <option>business</option>
            <option>first</option>
          </select>
        </div>
        <div className={css.search}>
          <form onSubmit={handleSubmit} className={css.searchInput}>
            <input
              type="text"
              name="origin"
              placeholder={airport.name || "location"}
            />
            <input
              type="text"
              name="destination"
              placeholder="¿ Where do you want to go ?"
            />
            <button onSubmit={handleSubmit} className={css.btnSearch}>
              Search
            </button>
          </form>
          <div className={css.ctnCalendar}>
            <button
              className={css.btnCalendar}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <span>{format(range[0].startDate, "eee, d MMM")}</span>
              <span>-</span>
              <span>{format(range[0].endDate, "eee, d MMM")}</span>
            </button>
            {showCalendar && (
              <div className={css.calendarWrapper}>
                <DateRange
                  editableDataInputs={true}
                  onChange={handleDateChange}
                  moveRangeOnFirstSelection={false}
                  ranges={range}
                  locale={undefined}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
