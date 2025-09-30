import React, { useState, useRef, useCallback, useMemo } from "react";
import Map, { Layer, Source, ViewState, MapRef } from "react-map-gl/maplibre";
//import { useStreetSegmentsForViewport } from "./hooks/use-street-segments-for-viewport";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import {
  streetLayerId,
  streetLayerStyle,
  MAX_ZOOM,
  DEFAULT_ZOOM,
  selectedStreetLayerStyle,
  selectedStreetLayerId,
  hoveredLayerStyle,
  hoveredLayerId,
} from "./constants";
import { ControlPanel } from "../control-panel";
import { useSelectedSegments } from "./hooks/use-selected-segments";
import type { FeatureCollection, LineString } from "geojson";
import { StreetSegment } from "../../../models/map-grid";
import "maplibre-gl/dist/maplibre-gl.css";

export const MapView = ({
  initalNESWBounds,
  centerLatLon,
  getStreetSegmentsForZoomLevel,
}: {
  initalNESWBounds: [number, number, number, number];
  centerLatLon: [number, number];
  getStreetSegmentsForZoomLevel: (zoomLevel: number) => StreetSegment[];
}): React.JSX.Element => {
  const mapRef = useRef<MapRef | null>(null);
  const [cursor, setCursor] = useState<string>("grab");
  const [hoverInfo, setHoverInfo] = useState<{ cnn: string } | null>(null);
  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const street = event.features && event.features[0];
    setHoverInfo({
      cnn: street && street.properties.cnn,
    });
  }, []);
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

  // const currentENPoint =
  //   mapRef.current?.getBounds().getNorthEast().toArray() != null
  //     ? mapRef.current?.getBounds().getNorthEast().toArray()
  //     : [initalNESWBounds[1], initalNESWBounds[0]];
  // const currentWSPoint =
  //   mapRef.current?.getBounds().getSouthWest().toArray() != null
  //     ? mapRef.current?.getBounds().getSouthWest().toArray()
  //     : [initalNESWBounds[3], initalNESWBounds[2]];
  // console.log("this is the viewport", currentENPoint, currentWSPoint);

  const streetSegments = getStreetSegmentsForZoomLevel(
    mapRef.current?.getZoom() ?? DEFAULT_ZOOM
  );

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
  const hoveredStreetSegment = (hoverInfo && hoverInfo.cnn) || "";
  console.log("this is the hovered segment", hoveredStreetSegment);
  const filter: ["in", string, string] = useMemo(
    () => ["in", "cnn", hoveredStreetSegment],
    [hoveredStreetSegment]
  );

  return (
    <>
      <ControlPanel />
      <>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onMouseMove={onHover}
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
          interactiveLayerIds={[
            selectedStreetLayerId,
            streetLayerId,
            hoveredLayerId,
          ]}
          mapStyle="https://tiles.openfreemap.org/styles/positron"
          doubleClickZoom={false}
        >
          <Source id="streets" type="geojson" data={geoJson}>
            <Layer {...streetLayerStyle} />
            <Layer {...hoveredLayerStyle} filter={filter} />
          </Source>
          <Source id="selected-streets" type="geojson" data={geoJsonSelected}>
            <Layer {...selectedStreetLayerStyle} />
          </Source>
        </Map>
      </>
    </>
  );
};
