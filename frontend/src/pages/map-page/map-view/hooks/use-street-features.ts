import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  StreetFeature,
  StreetFeatureEnum,
  //StreetFeatureEnum,
  StreetFeatureType,
} from "../../../../models/api-models";
import type { FeatureCollection } from "geojson";
import { Feature, LineLayerSpecification } from "maplibre-gl";
import axios from "axios";

interface IUseStreetFeaturesReturn {
  streetFeatureProps: {
    streetFeatureLayer: StreetFeatureType | null;
    setStreetFeatureLayer: (val: StreetFeatureType) => void;
    isLoading: boolean;
  };
  geoJson: FeatureCollection | null;
  geoJsonStyle: LineLayerSpecification | null;
}

export const useStreetFeatures = (): IUseStreetFeaturesReturn => {
  const [streetFeatureLayer, setStreetFeatureLayer] =
    useState<StreetFeatureType | null>(null);
  const result = useQuery({
    queryKey: [streetFeatureLayer],
    // gcTime: Infinity,
    // staleTime: Infinity,
    queryFn: async (): Promise<StreetFeature[]> => {
      if (streetFeatureLayer == null) {
        return [];
      }
      const result = await axios.get<StreetFeature[]>(`/api/streets/features`, {
        params: {
          featureType: JSON.stringify(streetFeatureLayer),
        },
      });

      return result.data;
    },
  });

  const [geoJson, geoJsonStyle] = useMemo(() => {
    if (streetFeatureLayer != null && result.data != null) {
      return streetFeaturesToGeoJson({
        streetFeatureLayer,
        streetFeatures: result.data,
      });
    }
    return [null, null];
  }, [result.data, streetFeatureLayer]);

  return {
    streetFeatureProps: {
      streetFeatureLayer,
      setStreetFeatureLayer,
      isLoading: result.isLoading,
    },
    geoJson,
    geoJsonStyle,
  };
};

const streetFeaturesToGeoJson = ({
  streetFeatureLayer,
  streetFeatures,
}: {
  streetFeatureLayer: StreetFeatureType;
  streetFeatures: StreetFeature[];
}):
  | [data: FeatureCollection, layerStyle: LineLayerSpecification]
  | [null, null] => {
  if (streetFeatureLayer === StreetFeatureEnum.SlowStreet) {
    return [
      {
        type: "FeatureCollection" as const,
        features: streetFeatures.map(({ properties, geometry }) => {
          return {
            type: "Feature" as const,
            geometry,
            properties,
          };
        }),
      },
      {
        id: `slow-street-features-style`,
        type: "line" as const,
        source: "street-features",
        layout: {
          "line-cap": "round" as const,
        },
        paint: {
          "line-opacity": 0.8,
          "line-width": 5,
          "line-color": "black",
        },
      },
    ];
  }
  return [null, null];
};
