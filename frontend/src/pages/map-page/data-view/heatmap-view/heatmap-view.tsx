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

export const HeatmapView = (): React.JSX.Element => {
  const mapRef = useRef<MapRef | null>(null);
  const currentFeatureCollections = useHeatmapFeatureCollections();
  const layerProps = useHeatmapLayerProps();

  return (
    <Flex
      style={{
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
        reuseMaps
        maxZoom={MAX_ZOOM}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        doubleClickZoom={false}
      >
        {currentFeatureCollections.map(([groupId, geoJson]) => {
          // const heatmapLayerStyle: LayerProps = {
          //   id: `heatmap-${groupId}`,
          //   //filter: ["==", ["get", "crash_classification"], "AA"],
          //   maxzoom: MAX_ZOOM,
          //   type: "heatmap",
          //   paint: {
          //     // Increase the heatmap weight based on frequency and property magnitude
          //     "heatmap-weight": [
          //       "interpolate",
          //       ["linear"],
          //       ["get", "number_injured"],
          //       //["==", ["get", "crash_classification"], "AA"],
          //       0,
          //       0,
          //       10,
          //       1,
          //     ],
          //     // Increase the heatmap color weight weight by zoom level
          //     // heatmap-intensity is a multiplier on top of heatmap-weight
          //     "heatmap-intensity": [
          //       "interpolate",
          //       ["linear"],
          //       ["zoom"],
          //       0,
          //       1,
          //       MAX_ZOOM,
          //       1,
          //     ],
          //     // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          //     // Begin color ramp at 0-stop with a 0-transparancy color
          //     // to create a blur-like effect.
          //     "heatmap-color": [
          //       "interpolate",
          //       ["linear"],
          //       ["heatmap-density"],
          //       0,
          //       "rgba(33,102,172,0)",
          //       0.2,
          //       "rgb(103,169,207)",
          //       0.4,
          //       "rgb(209,229,240)",
          //       0.6,
          //       "rgb(253,219,199)",
          //       0.8,
          //       "rgb(239,138,98)",
          //       1,
          //       "rgb(255,201,101)",
          //     ],
          //     // Adjust the heatmap radius by zoom level
          //     "heatmap-radius": [
          //       "interpolate",
          //       ["linear"],
          //       ["zoom"],
          //       0,
          //       2,
          //       MAX_ZOOM,
          //       20,
          //     ],
          //     // Transition from heatmap to circle layer by zoom level
          //     "heatmap-opacity": [
          //       "interpolate",
          //       ["linear"],
          //       ["zoom"],
          //       7,
          //       1,
          //       9,
          //       1,
          //     ],
          //   },
          // };
          return (
            <Source key={groupId} type="geojson" data={geoJson}>
              <Layer id={`heatmap-${groupId}`} {...layerProps} />
            </Source>
          );
        })}
      </Map>
    </Flex>
  );
};
