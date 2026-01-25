import React, { useRef, useMemo } from "react";
import Map, { Layer, Source, MapRef } from "react-map-gl/maplibre";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../../constants/map-dimensions";
import {
  streetLayerId,
  streetLayerStyle,
  MAX_ZOOM,
  DEFAULT_ZOOM,
  hoveredLayerStyle,
  hoveredLayerId,
} from "./constants";
import type { FeatureCollection, LineString } from "geojson";
import { StreetSegment } from "../../../models/map-grid";
import { useMapControls } from "./hooks/use-map-controls";
import { useSelectedStreets } from "./hooks/use-selected-streets";
import "maplibre-gl/dist/maplibre-gl.css";

export const MapView = ({
  centerLatLon,
  getStreetSegmentsForZoomLevel,
}: {
  centerLatLon: [number, number];
  getStreetSegmentsForZoomLevel: (zoomLevel: number) => StreetSegment[];
}): React.JSX.Element => {
  const mapRef = useRef<MapRef | null>(null);
  const { hoverInfo, onHover, onClick, viewState, setViewState } =
    useMapControls({ centerLatLon });
  const { configs } = useSelectedStreets();
  const layerIds = configs.map((config) => {
    return config.layerStyle.id;
  });

  const streetSegments = getStreetSegmentsForZoomLevel(
    mapRef.current?.getZoom() ?? DEFAULT_ZOOM,
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
    [hoveredStreetSegment],
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
          SanFranciscoSWPoint[1],
          SanFranciscoSWPoint[0],
          SanFranciscoNEPoint[1],
          SanFranciscoNEPoint[0],
        ]}
        reuseMaps
        onClick={onClick}
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
