import React, { useRef } from "react";
import Map, { MapRef } from "react-map-gl/maplibre";
import { MAX_ZOOM } from "../map-view/constants";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
  SanFranciscoCenterLatLon,
} from "../../../constants/map-dimensions";

export const HeatmapView = (): React.JSX.Element => {
  const mapRef = useRef<MapRef | null>(null);
  console.log("this is the heatmap view");

  return (
    <>
      <Map
        ref={mapRef}
        // [sw, ne]
        maxBounds={[
          SanFranciscoSWPoint[1],
          SanFranciscoSWPoint[0],
          SanFranciscoNEPoint[1],
          SanFranciscoNEPoint[0],
        ]}
        reuseMaps
        maxZoom={MAX_ZOOM}
        centerLatLon={[...SanFranciscoCenterLatLon]}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        doubleClickZoom={false}
      ></Map>
    </>
  );
};
