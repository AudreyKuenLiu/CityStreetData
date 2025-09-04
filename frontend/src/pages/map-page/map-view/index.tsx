import React from "react";
import Map, { ViewState } from "react-map-gl/maplibre";
import { useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  SanFranciscoBoundsLatLon,
  SanFranciscoCenterLatLon,
} from "./constants.ts";
import { ControlPanel } from "../control-panel";
import { MapRef } from "react-map-gl/maplibre";

export const MapView: React.FC = () => {
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = React.useState<ViewState>({
    longitude: SanFranciscoCenterLatLon[0],
    latitude: SanFranciscoCenterLatLon[1],
    zoom: 5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  console.log(
    "this is the map bounds",
    mapRef.current?.getBounds().getNorthEast(),
    mapRef.current?.getBounds().getSouthWest()
  );

  return (
    <>
      <ControlPanel />
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        maxBounds={SanFranciscoBoundsLatLon}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
      />
    </>
  );
};
