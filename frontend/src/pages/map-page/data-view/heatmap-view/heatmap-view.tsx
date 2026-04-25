import React, { useRef } from "react";
import Map, { Layer, MapRef } from "react-map-gl/maplibre";
import { MAX_ZOOM } from "../../map-view/constants";
import { Flex } from "antd";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../../../constants/map-dimensions";
import {
  useHeatmapFeatureCollections,
  useHeatmapLayerProps,
} from "../../store/heatmap-data";
import { Source } from "react-map-gl/maplibre";
import { HeatmapControls } from "./heatmap-controls";
import { useStreetGroupsRef } from "../../store/street-map-data-form";

export const HeatmapView = (): React.JSX.Element => {
  const mapRef = useRef<MapRef | null>(null);
  const currentFeatureCollections = useHeatmapFeatureCollections();
  const layerProps = useHeatmapLayerProps();
  const streetGroups = useStreetGroupsRef();

  return (
    <Flex
      style={{
        overflow: "hidden",
        height: "100vh",
        flexWrap: "wrap",
        width: "100%",
        alignContent: "flex-start",
        gap: "20px",
      }}
    >
      <HeatmapControls />
      <Map
        ref={mapRef}
        // [sw, ne]
        maxBounds={[
          SanFranciscoSWPoint[1],
          SanFranciscoSWPoint[0],
          SanFranciscoNEPoint[1],
          SanFranciscoNEPoint[0],
        ]}
        reuseMaps={false}
        maxZoom={MAX_ZOOM}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        doubleClickZoom={false}
      >
        {currentFeatureCollections.map(([groupId, geoJson]) => {
          const paintProps = layerProps.paint;
          const streetGroup = streetGroups.get(groupId);
          if (streetGroup == null) {
            return null;
          }
          return (
            <Source id={groupId} key={groupId} type="geojson" data={geoJson}>
              <Layer
                id={`heatmap-${groupId}`}
                {...layerProps}
                paint={{
                  ...paintProps,
                  "heatmap-color": [
                    "interpolate-hcl",
                    ["linear"],
                    ["heatmap-density"],
                    0,
                    "rgba(0, 0, 0, 0)",
                    0.2,
                    streetGroup.color,
                    0.6,
                    "rgb(253,219,199)",
                    0.8,
                    "rgb(239,138,98)",
                    1,
                    "rgb(255,201,101)",
                  ],
                }}
              />
            </Source>
          );
        })}
      </Map>
    </Flex>
  );
};
