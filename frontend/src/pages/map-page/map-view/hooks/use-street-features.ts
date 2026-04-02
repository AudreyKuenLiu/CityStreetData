import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  StreetFeature,
  StreetFeatureEnum,
  //StreetFeatureEnum,
  StreetFeatureType,
} from "../../../../models/api-models";
import type { FeatureCollection } from "geojson";
import { LineLayerSpecification } from "maplibre-gl";
import axios from "axios";
import { getRandomColor } from "../../../../utils";

export type StreetFeatureLegend = { value: string; color: string }[];

interface IUseStreetFeaturesReturn {
  streetFeatureProps: {
    streetFeatureLayer: StreetFeatureType | null;
    setStreetFeatureLayer: (val: StreetFeatureType) => void;
    isLoading: boolean;
  };
  geoJson: FeatureCollection | null;
  geoJsonStyle: LineLayerSpecification[] | null;
  legend: StreetFeatureLegend;
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

  const legend = useMemo(() => {
    if (result.data != null) {
      return streetFeaturesToLegend({ streetFeatures: result.data });
    }
    return [];
  }, [result.data]);

  const [geoJson, geoJsonStyle] = useMemo(() => {
    if (streetFeatureLayer != null && result.data != null) {
      return streetFeaturesToGeoJson({
        streetFeatureLayer,
        streetFeatures: result.data,
        legend,
      });
    }
    return [null, null];
  }, [result.data, streetFeatureLayer, legend]);

  return {
    streetFeatureProps: {
      streetFeatureLayer,
      setStreetFeatureLayer,
      isLoading: result.isLoading,
    },
    geoJson,
    geoJsonStyle,
    legend,
  };
};

const streetFeaturesToLegend = ({
  streetFeatures,
}: {
  streetFeatures: StreetFeature[];
}): StreetFeatureLegend => {
  const streetFeatureValues = new Set();
  let initialIndex = 40;
  const ret: { value: string; color: string }[] = [];
  const sortedFeatures = streetFeatures.sort((a, b) => {
    if (Number.isInteger(a.value) && Number.isInteger(b.value)) {
      return Number(a.value) - Number(b.value);
    }
    return a.value.localeCompare(b.value);
  });
  for (const streetFeature of sortedFeatures) {
    const streetFeatureValue = streetFeature.value;
    if (!streetFeatureValues.has(streetFeatureValue)) {
      ret.push({
        value: streetFeatureValue,
        color: getRandomColor(initialIndex),
      });
      initialIndex += 1;
      streetFeatureValues.add(streetFeatureValue);
    }
  }

  return ret;
};

const streetFeaturesToGeoJson = ({
  streetFeatureLayer,
  streetFeatures,
  legend,
}: {
  streetFeatureLayer: StreetFeatureType;
  streetFeatures: StreetFeature[];
  legend: StreetFeatureLegend;
}):
  | [data: FeatureCollection, layerStyles: LineLayerSpecification[]]
  | [null, null] => {
  return [
    {
      type: "FeatureCollection" as const,
      features: streetFeatures.map(({ properties, geometry, value }) => {
        return {
          type: "Feature" as const,
          geometry,
          properties: { value, ...properties },
        };
      }),
    },
    legend.map(({ value, color }) => ({
      id: `${value}-${streetFeatureLayer}-features-style`,
      filter: ["==", ["get", "value"], value],
      type: "line" as const,
      source: "street-features",
      layout: {
        "line-cap": "round" as const,
      },
      paint: {
        "line-opacity": 0.8,
        "line-width": 5,
        "line-color": color,
      },
    })),
  ];
  //return [null, null];
};
