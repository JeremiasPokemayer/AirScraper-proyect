import css from "./flights.module.css";
import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../hooks/useUser";
import { useFlights } from "../../hooks/useFlights";
import { useDate } from "../../hooks/useFlights";
import {
  useOriginAirport,
  useDestinationAirport,
} from "../../hooks/useAirport";
import { format, parseISO } from "date-fns";
import { SearchComponent } from "../home/homeComponent";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export function FlightsComponent() {
  const [user, setUser] = useUser();
  const [date, setDate] = useDate();
  const [airport, setAirport] = useOriginAirport();
  const [airportDestination, setAirportDestination] = useDestinationAirport();
  const [allFlights, setAllFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [filters, setFilters] = useState({
    maxDuration: null,
    airlines: [],
    stops: "",
    maxPrice: [0, 100000],
    departureTimeRange: [0, 24],
    arrivalTimeRange: [0, 24],
  });

  const { searchFlights } = useFlights();

  useEffect(() => {
    const getFlights = async () => {
      const dataFlights = {
        originSkyId: airport.skyId,
        destinationSkyId: airportDestination.skyId,
        originEntityId: airport.id,
        destinationEntityId: airportDestination.id,
        date: format(date.date, "yyyy-MM-dd"),
        returnDate: format(date.returnDate, "yyyy-MM-dd"),
        cabinClass: user.cabinClass,
        adults: user.Adults,
        childrens: user.Childrens,
        infants: user.Infants,
        sortedBy: user.sortedBy,
      };
      const flights = await searchFlights(dataFlights);
      if (flights?.data?.itineraries) {
        setAllFlights(flights.data.itineraries);
        setFilteredFlights(flights.data.itineraries);
      }
    };
    getFlights();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let result = [...allFlights];

      if (
        filters.maxPrice &&
        Array.isArray(filters.maxPrice) &&
        filters.maxPrice.length === 2
      ) {
        result = result.filter(
          (f) =>
            f.price.raw >= filters.maxPrice[0] &&
            f.price.raw <= filters.maxPrice[1]
        );
      }

      if (filters.departureTimeRange) {
        result = result.filter((f) => {
          const depHour = parseISO(f.legs[0].departure).getHours();
          return (
            depHour >= filters.departureTimeRange[0] &&
            depHour <= filters.departureTimeRange[1]
          );
        });
      }

      if (filters.arrivalTimeRange) {
        result = result.filter((f) => {
          const arrHour = parseISO(f.legs[0].arrival).getHours();
          return (
            arrHour >= filters.arrivalTimeRange[0] &&
            arrHour <= filters.arrivalTimeRange[1]
          );
        });
      }

      if (filters.maxDuration !== null) {
        result = result.filter(
          (f) => f.legs[0].durationInMinutes <= filters.maxDuration
        );
      }

      if (filters.airlines.length > 0) {
        result = result.filter((f) =>
          filters.airlines.includes(f.legs[0].carriers.marketing[0].name)
        );
      }

      if (filters.stops !== "") {
        const numberOfStops = Number(filters.stops);
        result = result.filter(
          (f) => f.legs[0].segments.length - 1 === numberOfStops
        );
      }

      setFilteredFlights(result);
    };

    applyFilters();
  }, [filters, allFlights]);

  return (
    <div className={css.fligthsList}>
      <SearchComponent />
      <FiltersFlights
        filters={filters}
        setFilters={setFilters}
        allFlights={allFlights}
      />
      <div className={css.headerRow}>
        <div>Airline</div>
        <div>Itinerary</div>
        <div>Duration / Route</div>
        <div>Scales</div>
        <div>Price</div>
      </div>
      {filteredFlights.map((itinerary) => {
        const { id, price, legs } = itinerary;

        const arrivalTime = format(parseISO(legs[0].arrival), "HH:mm");
        const departureTime = format(parseISO(legs[0].departure), "HH:mm");
        const arrivalAirportName = legs[0].destination.name;
        const departureAirportName = legs[0].origin.name;
        const arrivalAirportId = legs[0].destination.id;
        const departureAirportId = legs[0].origin.id;
        const airlineImageUrl = legs[0].carriers.marketing[0].logoUrl;
        const airlineName = legs[0].carriers.marketing[0].name;
        const durationTime = formatDuration(legs[0].durationInMinutes);
        const priceFly = price.raw;
        const stopCount = legs[0].stopCount;

        return (
          <div className={css.cardFly} key={id}>
            <div>
              <img
                className={css.imgAirline}
                src={airlineImageUrl}
                alt="image_airline"
              />
            </div>
            <div className={css.timeFly}>
              <span>
                {departureTime} - {arrivalTime}
              </span>
              <span className={css.nameAirline}>{airlineName}</span>
            </div>
            <div className={css.durationFly}>
              <span>{durationTime}</span>
              <div className={css.airportsName}>
                <div title={arrivalAirportName}>{arrivalAirportId}</div>
                <span>-</span>
                <div title={departureAirportName}>{departureAirportId}</div>
              </div>
            </div>
            <div className={css.scaleText}>{stopCount} stop</div>
            <div>USD ${priceFly}</div>
          </div>
        );
      })}
    </div>
  );
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} h ${mins} min`;
}

function FiltersFlights({ filters, setFilters, allFlights }) {
  const uniqueAirlines = Array.from(
    new Set(allFlights.map((f) => f.legs[0].carriers.marketing[0].name))
  );
  const [showTime, setShowTime] = useState(false);
  const [showScalesFilter, setShowScalesFilter] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showAirlinesFIlter, setShowAirlinesFIlter] = useState(false);
  return (
    <div className={css.ctnFilters}>
      <div className={css.scalesFilter}>
        <label
          className={css.filterSpan}
          onClick={() => setShowScalesFilter(!showScalesFilter)}
        >
          Scales ▼
        </label>
        {showScalesFilter && (
          <div className={css.filterDropdown}>
            <select
              value={filters.stops}
              name="scales"
              className={css.scalesSelector}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  stops: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            >
              <option value="">Any number of scales</option>
              <option value="0">Only direct flights</option>
              <option value="1">1 scale</option>
              <option value="2">2 scales</option>
            </select>
          </div>
        )}
      </div>

      <div className={css.priceFilter}>
        <label
          className={css.filterSpan}
          onClick={() => setShowPriceFilter(!showPriceFilter)}
        >
          Price ▼
        </label>
        {showPriceFilter && (
          <div className={css.filterDropdown}>
            <Slider
              range
              min={0}
              max={100000}
              step={10}
              allowCross={false}
              value={filters.maxPrice}
              onChange={(value: number | number[]) => {
                if (Array.isArray(value)) {
                  setFilters({
                    ...filters,
                    maxPrice: [value[0], value[1]],
                  });
                }
              }}
            />
            <div className={css.rangeLabels}>${filters.maxPrice[0]}</div>
          </div>
        )}
      </div>
      <div className={css.airlinesFilter}>
        <label
          className={css.filterSpan}
          onClick={() => setShowAirlinesFIlter(!showAirlinesFIlter)}
        >
          Airlines ▼
        </label>
        {showAirlinesFIlter && (
          <div className={css.filterDropdown}>
            <select
              multiple
              value={filters.airlines}
              name="airlines"
              className={css.airlinesSelector}
              onChange={(e) => {
                const selectedOptions = Array.from(
                  (e.target as HTMLSelectElement).selectedOptions
                ).map((opt) => opt.value);
                if (selectedOptions.includes("")) {
                  setFilters({
                    ...filters,
                    airlines: [],
                  });
                } else {
                  setFilters({
                    ...filters,
                    airlines: selectedOptions,
                  });
                }
              }}
            >
              <option value="">All airlines</option>
              {uniqueAirlines.map((airline) => (
                <option key={airline} value={airline}>
                  {airline}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={css.timeFiltersContainer}>
        <label
          className={css.filterSpan}
          onClick={() => setShowTime(!showTime)}
        >
          Emissions ▼
        </label>
        {showTime && (
          <div className={css.filterDropdown}>
            <div className={css.timeFilter}>
              <label>Departure time</label>
              <div>
                <Slider
                  range
                  min={0}
                  max={24}
                  step={1}
                  allowCross={false}
                  value={filters.departureTimeRange}
                  onChange={(value: number | number[]) => {
                    if (Array.isArray(value)) {
                      setFilters({
                        ...filters,
                        departureTimeRange: [value[0], value[1]],
                      });
                    }
                  }}
                />
                <div className={css.rangeLabels}>
                  {filters.departureTimeRange[0]}:00 -{" "}
                  {filters.departureTimeRange[1]}
                  :00
                </div>
              </div>
            </div>
            <div className={css.timeFilter}>
              <label>Arrival time</label>
              <div>
                <Slider
                  range
                  min={0}
                  max={24}
                  step={1}
                  allowCross={false}
                  value={filters.arrivalTimeRange}
                  onChange={(value: number | number[]) => {
                    if (Array.isArray(value)) {
                      setFilters({
                        ...filters,
                        arrivalTimeRange: [value[0], value[1]],
                      });
                    }
                  }}
                />
                <div className={css.rangeLabels}>
                  {filters.arrivalTimeRange[0]}:00 -{" "}
                  {filters.arrivalTimeRange[1]}
                  :00
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
