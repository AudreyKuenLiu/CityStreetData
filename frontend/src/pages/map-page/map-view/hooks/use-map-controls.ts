import { useState, useCallback } from "react";
import { ViewState } from "react-map-gl/maplibre";
import { DEFAULT_ZOOM } from "../constants";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";

interface useMapControlsReturn {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  hoverInfo: { cnn: string } | null;
  onHover: (event: MapLayerMouseEvent) => void;
  cursor: string;
  key: number;
  setKey: (nextKey: number) => void;
  viewState: ViewState;
  setViewState: (nextViewState: ViewState) => void;
}

export const useMapControls = ({
  centerLatLon,
}: {
  centerLatLon: [number, number];
}): useMapControlsReturn => {
  const [cursor, setCursor] = useState<string>("grab");
  const [hoverInfo, setHoverInfo] = useState<{ cnn: string } | null>(null);
  const [key, setKey] = useState(0);
  const throttledHover = useCallback(
    (event: MapLayerMouseEvent): void => {
      const street = event.features?.[0];
      if (hoverInfo?.cnn !== street?.properties.cnn) {
        console.log(
          "setting hover info",
          hoverInfo?.cnn,
          street?.properties.cnn
        );
        setHoverInfo({
          cnn: street?.properties.cnn,
        });
      }
    },
    [hoverInfo?.cnn]
  );

  const [viewState, setViewState] = useState<ViewState>({
    longitude: centerLatLon[1],
    latitude: centerLatLon[0],
    zoom: DEFAULT_ZOOM,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  const onMouseEnter = useCallback(() => setCursor("pointer"), []);
  const onMouseLeave = useCallback(() => setCursor("grab"), []);

  return {
    onMouseEnter,
    onMouseLeave,
    hoverInfo,
    onHover: throttledHover,
    cursor,
    key,
    setKey,
    viewState,
    setViewState,
  };
};
