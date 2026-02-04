import React, { useRef, useMemo } from "react";
import Map, { Layer, Source, MapRef } from "react-map-gl/maplibre";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
  SanFranciscoCenterLatLon,
} from "../../../constants/map-dimensions";
import {
  streetLayerId,
  streetLayerStyle,
  MAX_ZOOM,
  DEFAULT_ZOOM,
  hoveredLayerStyle,
  hoveredLayerId,
} from "./constants";
import { useStreetsForMapView } from "../hooks/use-streets-for-map-view";
import { useMapControls } from "./hooks/use-map-controls";
import { useSelectedStreets } from "./hooks/use-selected-streets";
import "maplibre-gl/dist/maplibre-gl.css";

export const MapView = (): React.JSX.Element => {
  const mapRef = useRef<MapRef | null>(null);
  const { hoverInfo, onHover, onClick, viewState, setViewState } =
    useMapControls({ centerLatLon: SanFranciscoCenterLatLon });
  const { configs } = useSelectedStreets();
  const layerIds = configs.map((config) => {
    return config.layerStyle.id;
  });
  const { geoJson, getFilterForZoomLevel } = useStreetsForMapView();
  const zoomLevelFilter = getFilterForZoomLevel(
    mapRef.current?.getZoom() ?? DEFAULT_ZOOM,
  );
  const hoveredStreetSegment = (hoverInfo && hoverInfo.cnn) || "";
  const hoveredSegmentFilter: ["in", string, string] = useMemo(
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
          <Layer {...streetLayerStyle} filter={zoomLevelFilter} />
          <Layer {...hoveredLayerStyle} filter={hoveredSegmentFilter} />
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
