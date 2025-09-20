import React, { useRef } from "react";
import Map, { Layer, Source, ViewState, MapRef } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import {
  SanFranciscoBoundsLatLon,
  SanFranciscoCenterLatLon,
  streetLayerId,
  streetLayerStyle,
  highlightedStreetLayerStyle,
  highlightedStreetLayerId,
} from "./constants";
import { ControlPanel } from "../control-panel";
import { useStreetSegmentsForViewport } from "./queries";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

export const MapView: React.FC = () => {
  const mapRef = useRef<MapRef | null>(null);
  const [clickedStreet, setClickedStreet] = React.useState("");
  const [viewState, setViewState] = React.useState<ViewState>({
    longitude: SanFranciscoCenterLatLon[1],
    latitude: SanFranciscoCenterLatLon[0],
    zoom: 5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const { streetSegments, isLoading } = useStreetSegmentsForViewport({
    nePoint: mapRef.current?.getBounds().getNorthEast().toArray(),
    swPoint: mapRef.current?.getBounds().getSouthWest().toArray(),
    zoomLevel: mapRef.current?.getZoom(),
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

  console.log(
    "this is the map bounds",
    mapRef.current?.getBounds().getNorthEast(),
    mapRef.current?.getBounds().getSouthWest(),
    mapRef.current?.getZoom(),
    streetSegments,
    isLoading
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
