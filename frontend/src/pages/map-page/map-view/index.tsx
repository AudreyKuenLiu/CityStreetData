import React, { useRef, useMemo } from "react";
import Map, {
  Layer,
  Source,
  MapRef,
  StyleSpecification,
} from "react-map-gl/maplibre";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
  SanFranciscoCenterLatLon,
} from "../../../constants/map-dimensions";
import {
  streetLayerId,
  // streetLayerStyle,
  MAX_ZOOM,
  // DEFAULT_ZOOM,
  hoveredLayerStyle,
  hoveredLayerId,
  streetLayerStyles,
  maxZoomStreetLayerId,
  minZoomStreetLayerId,
  medZoomStreetLayerId,
} from "./constants";
import { useStreetsForMapView } from "../hooks/use-streets-for-map-view";
import { useSelectedStreets } from "./hooks/use-selected-streets";
import { ControlPanel } from "./control-panel";
import { Flex, Layout, Typography } from "antd";
import { SelectControlPanel } from "./select-control-panel";
import { useMapControlPanel } from "./hooks/use-map-control-panel";
import { useStreetFeatures } from "./hooks/use-street-features";
import { StreetFeatureLegend } from "./street-feature-legend";
import { Footer } from "antd/es/layout/layout";
import { StreetFeatureSelect } from "./control-panel/street-feature-select";
import MapStyle from "../../../map-style.json";

export const MapView = ({
  onRunQuery,
}: {
  onRunQuery: () => void;
}): React.JSX.Element => {
  const mapRef = useRef<MapRef | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const {
    geoJson,
    //getFilterForZoomLevel,
    streetSearchTrees,
  } = useStreetsForMapView();
  const {
    hoverInfo,
    onHover,
    onClick,
    viewState,
    setViewState,
    setMapControl,
    currentMapControl,
  } = useMapControlPanel({
    mapRef: mapRef.current,
    panelRef: panelRef.current,
    centerLatLon: SanFranciscoCenterLatLon,
    streetSearchTrees,
  });
  const { configs } = useSelectedStreets();
  const layerIds = configs.map((config) => {
    return config.layerStyle.id;
  });
  // const zoomLevelFilter = getFilterForZoomLevel(
  //   mapRef.current?.getZoom() ?? DEFAULT_ZOOM,
  // );
  const hoveredStreetSegment = (hoverInfo && hoverInfo.cnn) || "";
  const hoveredSegmentFilter: ["in", string, string] = useMemo(
    () => ["in", "cnn", hoveredStreetSegment],
    [hoveredStreetSegment],
  );
  const {
    streetFeatureProps,
    geoJson: streetFeatureGeoJson,
    geoJsonStyle: streetFeatureGeoJsonStyle,
    legend,
  } = useStreetFeatures();
  // console.log("current zoom level", mapRef.current?.getZoom());

  return (
    <Layout
      style={{
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <Flex
        ref={panelRef}
        tabIndex={0}
        style={{
          flex: 1,
          minWidth: "1000px",
          position: "relative",
        }}
      >
        <Flex
          style={{
            position: "absolute",
            zIndex: 2,
            justifyContent: "space-between",
            marginTop: "16px",
            marginLeft: "16px",
            marginRight: "16px",
            right: "0px",
            left: "0",
            pointerEvents: "none",
            gap: "4px",
          }}
        >
          <SelectControlPanel
            currentMapControl={currentMapControl}
            setMapControl={setMapControl}
          />
          <StreetFeatureSelect {...streetFeatureProps} />
        </Flex>
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
          pitchWithRotate={false}
          onClick={onClick}
          maxZoom={MAX_ZOOM}
          style={{ width: "100%", height: "100%" }}
          interactiveLayerIds={[
            minZoomStreetLayerId,
            medZoomStreetLayerId,
            maxZoomStreetLayerId,
            streetLayerId,
            hoveredLayerId,
            ...layerIds,
          ]}
          mapStyle={MapStyle as StyleSpecification}
          doubleClickZoom={false}
        >
          <Source id="streets" type="geojson" data={geoJson}>
            {streetLayerStyles.map((streetLayerStyle) => {
              return (
                <Layer {...streetLayerStyle} beforeId="waterway_line_label" />
              );
            })}
            {/* <Layer
              {...streetLayerStyle}
              filter={zoomLevelFilter}
              beforeId="waterway_line_label"
            /> */}
            <Layer
              {...hoveredLayerStyle}
              filter={hoveredSegmentFilter}
              beforeId="waterway_line_label"
            />
          </Source>
          {configs.map((config, idx) => {
            return (
              <Source
                id={config.sourceId}
                type="geojson"
                data={config.data}
                key={`${idx}_${config.sourceId}`}
              >
                <Layer {...config.layerStyle} beforeId="waterway_line_label" />
              </Source>
            );
          })}
          {streetFeatureGeoJson != null &&
            streetFeatureGeoJsonStyle != null && (
              <Source
                id="street-features"
                type="geojson"
                data={streetFeatureGeoJson}
              >
                {streetFeatureGeoJsonStyle.map((style, idx) => {
                  return (
                    <Layer
                      key={`${idx}_${style.id}`}
                      {...style}
                      beforeId="waterway_line_label"
                    />
                  );
                })}
              </Source>
            )}
        </Map>
        <StreetFeatureLegend legend={legend} />
      </Flex>
      <Footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px",
          gap: "12px",
          borderTop: "1px solid #d9d9d9",
        }}
      >
        <Typography.Title
          level={4}
          style={{ margin: 0, color: "#262626", whiteSpace: "nowrap" }}
        >
          San Francisco Traffic Crashes
        </Typography.Title>
        <ControlPanel onRunQuery={onRunQuery} />
      </Footer>
    </Layout>
  );
};
