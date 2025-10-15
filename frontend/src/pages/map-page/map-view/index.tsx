import React, { useRef, useMemo } from "react";
import Map, { Layer, Source, MapRef } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import {
  streetLayerId,
  streetLayerStyle,
  MAX_ZOOM,
  DEFAULT_ZOOM,
  hoveredLayerStyle,
  hoveredLayerId,
} from "./constants";
import { useActions } from "../store/street-map-data-form";
import type { FeatureCollection, LineString } from "geojson";
import { StreetSegment } from "../../../models/map-grid";
import { useMapControls } from "./hooks/use-map-controls";
import { useSelectedSteets } from "./hooks/use-selected-streets";
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
  console.log("rerendering mapView");
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
  const { configs } = useSelectedSteets();
  const layerIds = configs.map((config) => {
    return config.layerStyle.id;
  });

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
            cnn: streetSegment.cnn,
            line: streetSegment.line,
          },
        };
      }),
    };
  }, [streetSegments]);

  const hoveredStreetSegment = (hoverInfo && hoverInfo.cnn) || "";
  const filter: ["in", string, string] = useMemo(
    () => ["in", "cnn", hoveredStreetSegment],
    [hoveredStreetSegment]
  );

  return (
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
        interactiveLayerIds={[streetLayerId, hoveredLayerId, ...layerIds]}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        doubleClickZoom={false}
      >
        <Source id="streets" type="geojson" data={geoJson}>
          <Layer {...streetLayerStyle} />
          <Layer {...hoveredLayerStyle} filter={filter} />
        </Source>
        {configs.map((config) => {
          return (
            <Source
              id={config.sourceId}
              type="geojson"
              data={config.data}
              key={config.sourceId}
            >
              <Layer {...config.layerStyle} />
            </Source>
          );
        })}
      </Map>
    </>
  );
};
