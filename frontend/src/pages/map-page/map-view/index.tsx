import React, { useRef, useMemo } from "react";
import Map, { Layer, Source, MapRef } from "react-map-gl/maplibre";
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
import { useCnns, useActions } from "./store/street-map-data-form";
import type { FeatureCollection, LineString } from "geojson";
import { StreetSegment } from "../../../models/map-grid";
import { useMapControls } from "./hooks/use-map-controls";
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
  const {
    onMouseEnter,
    onMouseLeave,
    hoverInfo,
    onHover,
    cursor,
    key,
    setKey,
    viewState,
    setViewState,
  } = useMapControls({ centerLatLon });
  const { toggleStreet } = useActions();
  const selectedSegments = useCnns();

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
    features: selectedSegments.map(({ cnn, line }) => {
      return {
        type: "Feature" as const,
        geometry: line,
        properties: {
          //street: value.street,
          line: line,
          cnn: cnn,
        },
      };
    }),
  };
  const hoveredStreetSegment = (hoverInfo && hoverInfo.cnn) || "";
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
              toggleStreet({
                cnn: features[0].properties.cnn,
                line: JSON.parse(features[0].properties.line),
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
