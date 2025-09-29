import { useRef, useState } from "react";
import {
  CityGrid,
  ZoomLevelInView,
  getZoomLevelInView,
  StreetSegment,
} from "../../../../models/map-grid";
import type { LineString } from "geojson";

export const useStreetSegmentsFromViewport = ({
  zoomLevel,
  nePoint,
  swPoint,
  mapConfig,
}: {
  zoomLevel: number;
  nePoint: [number, number];
  swPoint: [number, number];
  mapConfig: {
    zoomLevelInView: ZoomLevelInView;
    cityGrid: CityGrid;
  }[];
}): {
  //streetSegments: ViewportSegment[];
  streetSegments: StreetSegment[];
} => {
  const zoomLevelInView = getZoomLevelInView(zoomLevel);
  // ne, sw
  const bounds = useRef({
    boundsInView: [0, 0, 0, 0],
    zoomLevelInView: ZoomLevelInView.ONE,
  });
  const [streetSegments, setStreetSegments] = useState<
    { cnn: number; line: LineString }[]
  >([]);
  const selectedMap = mapConfig.find(({ zoomLevelInView: configZoomLevel }) => {
    return configZoomLevel === zoomLevelInView;
  });

  if (selectedMap == null) {
    return {
      streetSegments,
    };
  }

  const boundingBoxInView = selectedMap.cityGrid.getBoundingBoxInView({
    bbox: [...nePoint, ...swPoint],
  });

  const {
    boundsInView: previousBoundsInView,
    zoomLevelInView: previousZoomLevelInView,
  } = bounds.current;

  if (
    previousZoomLevelInView !== zoomLevelInView ||
    previousBoundsInView[0] !== boundingBoxInView[0] ||
    previousBoundsInView[1] !== boundingBoxInView[1] ||
    previousBoundsInView[2] !== boundingBoxInView[2] ||
    previousBoundsInView[3] !== boundingBoxInView[3]
  ) {
    bounds.current.zoomLevelInView = zoomLevelInView;
    bounds.current.boundsInView = boundingBoxInView;
    const startTime = new Date().getTime();
    const streetSegmentsInView = selectedMap.cityGrid.getStreetSegmentsInView({
      bbox: boundingBoxInView,
    });
    const endTime = new Date().getTime();

    console.log(`Method execution time: ${endTime - startTime} milliseconds`);
    setStreetSegments(streetSegmentsInView);
  }

  return {
    streetSegments,
  };
};
