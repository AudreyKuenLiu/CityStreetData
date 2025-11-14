import type { FeatureCollection, LineString } from "geojson";
import { StreetSegment } from "../../../../models/map-grid";
import { LineLayerSpecification } from "maplibre-gl";
import { useStreetGroups } from "../../store/street-map-data-form";

interface useSelectedStreetsReturnType {
  configs: {
    sourceId: string;
    data: FeatureCollection<LineString, StreetSegment>;
    layerStyle: LineLayerSpecification;
  }[];
}

export const useSelectedStreets = (): useSelectedStreetsReturnType => {
  const streetGroups = useStreetGroups();

  const configs = Array.from(streetGroups.entries()).map(
    ([groupId, streetGroup]) => {
      return {
        sourceId: `${groupId}-selected-streets`,
        data: {
          type: "FeatureCollection" as const,
          features: Array.from(streetGroup.cnns.values()).map(
            ({ cnn, line }) => {
              return {
                type: "Feature" as const,
                geometry: line,
                properties: {
                  line: line,
                  cnn: cnn,
                },
              };
            }
          ),
        },
        layerStyle: {
          id: `${groupId}-highlighted-selected-street-segment-layer`,
          type: "line" as const,
          source: "streets",
          layout: {
            "line-cap": "round" as const,
          },
          paint: {
            "line-opacity": 0.8,
            "line-width": 15,
            "line-color": streetGroup.color,
          },
        },
      };
    }
  );
  return {
    configs,
  };
};
