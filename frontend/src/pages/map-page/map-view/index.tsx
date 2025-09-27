import React, { useState, useRef, useCallback } from "react";
import Map, { Layer, Source, ViewState, MapRef } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import {
  streetLayerId,
  streetLayerStyle,
  MAX_ZOOM,
  DEFAULT_ZOOM,
  highlightedStreetLayerStyle,
  highlightedStreetLayerId,
} from "./constants";
import { ControlPanel } from "../control-panel";
import { useStreetSegmentsForViewport } from "./queries";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

export const MapView = ({
  initalNESWBounds,
  centerLatLon,
}: {
  initalNESWBounds: [number, number, number, number];
  centerLatLon: [number, number];
}): React.JSX.Element => {
  const mapRef = useRef<MapRef | null>(null);
  const [cursor, setCursor] = useState<string>("grab");
  const [clickedStreet, setClickedStreet] = useState("");
  const [viewState, setViewState] = useState<ViewState>({
    longitude: centerLatLon[1],
    latitude: centerLatLon[0],
    zoom: DEFAULT_ZOOM,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("grab"), []);

  const currentENPoint =
    mapRef.current?.getBounds().getNorthEast().toArray() != null
      ? mapRef.current?.getBounds().getNorthEast().toArray()
      : [initalNESWBounds[1], initalNESWBounds[0]];
  const currentWSPoint =
    mapRef.current?.getBounds().getSouthWest().toArray() != null
      ? mapRef.current?.getBounds().getSouthWest().toArray()
      : [initalNESWBounds[3], initalNESWBounds[2]];

  const { streetSegments } = useStreetSegmentsForViewport({
    nePoint: [currentENPoint[1], currentENPoint[0]],
    swPoint: [currentWSPoint[1], currentWSPoint[0]],
    zoomLevel: mapRef.current?.getZoom() ?? DEFAULT_ZOOM,
  });

  const geoJson: FeatureCollection = {
    type: "FeatureCollection",
    features: streetSegments.map((streetSegment) => {
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
  const filter: ["in", string, string] = React.useMemo(
    () => ["in", "cnn", clickedStreet],
    [clickedStreet]
  );

  return (
    <>
      <ControlPanel />
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        // [sw, ne]
        maxBounds={[
          initalNESWBounds[3],
          initalNESWBounds[2],
          initalNESWBounds[1],
          initalNESWBounds[0],
        ]}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        cursor={cursor}
        maxZoom={MAX_ZOOM}
        style={{ width: "100%", height: "100%" }}
        onClick={(event: MapLayerMouseEvent) => {
          const features = event.features;
          if (features?.[0]?.properties?.cnn != null) {
            console.log("clickedStreet", features[0].properties.cnn);
            setClickedStreet(features[0].properties.cnn);
          }
        }}
        interactiveLayerIds={[highlightedStreetLayerId, streetLayerId]}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
      >
        <Source id="streets" type="geojson" data={geoJson}>
          <Layer {...streetLayerStyle} />
          <Layer {...highlightedStreetLayerStyle} filter={filter} />
        </Source>
      </Map>
    </>
  );
};
