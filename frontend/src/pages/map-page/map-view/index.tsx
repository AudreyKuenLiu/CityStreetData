import React, { useState, useRef, useCallback, useMemo } from "react";
import Map, { Layer, Source, ViewState, MapRef } from "react-map-gl/maplibre";
import { useStreetSegmentsForViewport } from "./hooks/use-street-segments-for-viewport";
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
import { useSelectedSegments } from "./hooks/use-selected-segments";
import type { FeatureCollection, LineString } from "geojson";
import type {
  CityGrid,
  StreetSegment,
  ZoomLevelInView,
} from "../../../models/map-grid";
import "maplibre-gl/dist/maplibre-gl.css";
import { useStreetSegmentsFromViewport } from "./hooks/use-streets-segments-from-viewport";

export const MapView = ({
  initalNESWBounds,
  centerLatLon,
  mapConfig,
}: {
  initalNESWBounds: [number, number, number, number];
  centerLatLon: [number, number];
  mapConfig: {
    zoomLevelInView: ZoomLevelInView;
    cityGrid: CityGrid;
  }[];
}): React.JSX.Element => {
  const mapRef = useRef<MapRef | null>(null);
  const [cursor, setCursor] = useState<string>("grab");
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

  const [selectedSegments, dispatch] = useSelectedSegments();
  const [key, setKey] = useState(0);

  const currentENPoint =
    mapRef.current?.getBounds().getNorthEast().toArray() != null
      ? mapRef.current?.getBounds().getNorthEast().toArray()
      : [initalNESWBounds[1], initalNESWBounds[0]];
  const currentWSPoint =
    mapRef.current?.getBounds().getSouthWest().toArray() != null
      ? mapRef.current?.getBounds().getSouthWest().toArray()
      : [initalNESWBounds[3], initalNESWBounds[2]];

  // const { streetSegments } = useStreetSegmentsForViewport({
  //   nePoint: [currentENPoint[1], currentENPoint[0]],
  //   swPoint: [currentWSPoint[1], currentWSPoint[0]],
  //   zoomLevel: mapRef.current?.getZoom() ?? DEFAULT_ZOOM,
  // });
  const { streetSegments } = useStreetSegmentsFromViewport({
    zoomLevel: mapRef.current?.getZoom() ?? DEFAULT_ZOOM,
    nePoint: [currentENPoint[1], currentENPoint[0]],
    swPoint: [currentWSPoint[1], currentWSPoint[0]],
    mapConfig,
  });

  const geoJson: FeatureCollection<LineString, StreetSegment> = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: streetSegments.map((streetSegment) => {
        return {
          type: "Feature" as const,
          geometry: streetSegment.line,
          properties: {
            //street: streetSegment.street,
            cnn: streetSegment.cnn,
            line: streetSegment.line,
          },
        };
      }),
    };
  }, [streetSegments]);
  //console.log("this is the geoJson", geoJson);
  const geoJsonSelected: FeatureCollection<LineString, StreetSegment> = {
    type: "FeatureCollection",
    features: Object.entries(selectedSegments).map(([cnn, value]) => {
      return {
        type: "Feature" as const,
        geometry: value.line,
        properties: {
          //street: value.street,
          line: value.line,
          cnn: parseInt(cnn),
        },
      };
    }),
  };

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
        onClick={(event: MapLayerMouseEvent) => {
          const features = event.features;
          if (
            features?.[0]?.properties?.cnn != null &&
            features?.[0].geometry.type === "LineString"
          ) {
            dispatch({
              type: "toggle",
              payload: {
                cnn: features?.[0].properties.cnn,
                line: JSON.parse(features?.[0].properties.line),
                street: features?.[0].properties.streetName,
              },
            });
            setKey(key + 1); //super-hack this line is responsibe for "rerendering" the map when clicked
          }
        }}
        cursor={cursor}
        maxZoom={MAX_ZOOM}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={[highlightedStreetLayerId, streetLayerId]}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        doubleClickZoom={false}
      >
        <Source id="streets" type="geojson" data={geoJson}>
          <Layer {...streetLayerStyle} />
        </Source>
        <Source id="selected-streets" type="geojson" data={geoJsonSelected}>
          <Layer {...highlightedStreetLayerStyle} />
        </Source>
      </Map>
    </>
  );
};
