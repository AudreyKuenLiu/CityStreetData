import React from "react";
import Map, { Layer, Source, ViewState } from "react-map-gl/maplibre";
import { useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LineLayerSpecification } from "react-map-gl/maplibre";
import {
  SanFranciscoBoundsLatLon,
  SanFranciscoCenterLatLon,
} from "./constants";
import { ControlPanel } from "../control-panel";
import { MapRef } from "react-map-gl/maplibre";
import { useStreetSegmentsForViewport } from "./queries";
import type { FeatureCollection } from "geojson";

const layerStyle: LineLayerSpecification = {
  id: "streetSegmentLayer",
  type: "line",
  source: "sfData",
};

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

  const data = useStreetSegmentsForViewport({
    nePoint: mapRef.current?.getBounds().getNorthEast().toArray(),
    swPoint: mapRef.current?.getBounds().getSouthWest().toArray(),
    zoomLevel: mapRef.current?.getZoom(),
  });

  const geoJson: FeatureCollection = {
    type: "FeatureCollection",
    features: data.streetSegments.map((streetSegment) => {
      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: streetSegment.line.coordinates,
        },
        properties: {
          streetName: streetSegment.street,
          cnn: streetSegment.cnn,
        },
      };
    }),
  };

  console.log(
    "this is the map bounds",
    mapRef.current?.getBounds().getNorthEast(),
    mapRef.current?.getBounds().getSouthWest(),
    mapRef.current?.getZoom(),
    data
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
      >
        <Source id="streets" type="geojson" data={geoJson}>
          <Layer {...layerStyle} />
        </Source>
      </Map>
    </>
  );
};
