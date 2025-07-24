import React from "react";
import { FlightsComponent } from "../../components/flightsResult/flightsComponent";

class Flights extends React.Component<any, any> {
  render() {
    return (
      <div>
        <FlightsComponent />
      </div>
    );
  }
}

export { Flights };
