import React from "react";
import Map, { ViewState } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  SanFranciscoBoundsLatLon,
  SanFranciscoCenterLatLon,
} from "./constants.ts";
import { ControlPanel } from "../control-panel";

export const MapView: React.FC = () => {
  const [viewState, setViewState] = React.useState<ViewState>({
    longitude: SanFranciscoCenterLatLon[0],
    latitude: SanFranciscoCenterLatLon[1],
    zoom: 5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  return (
    <>
      <ControlPanel />
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        maxBounds={SanFranciscoBoundsLatLon}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
      />
    </>
  );
};
