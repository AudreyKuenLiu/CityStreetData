import { useState, useCallback, useEffect } from "react";
import { ViewState } from "react-map-gl/maplibre";
import { DEFAULT_ZOOM } from "../constants";
import { useActions } from "../store/street-map-data-form";
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
  const [isXPressed, setIsXPressed] = useState(false);

  const { addStreet, removeStreet } = useActions();
  const throttledHover = useCallback(
    (event: MapLayerMouseEvent): void => {
      const street = event.features?.[0];
      if (isXPressed && street != null) {
        removeStreet(street.properties.cnn);
      }
      if (
        !isXPressed &&
        event.originalEvent.shiftKey === true &&
        street != null
      ) {
        addStreet({
          cnn: street.properties.cnn,
          line: JSON.parse(street.properties.line),
        });
      }
      if (hoverInfo?.cnn !== street?.properties.cnn) {
        setHoverInfo({
          cnn: street?.properties.cnn,
        });
      }
    },
    [hoverInfo?.cnn, addStreet, isXPressed, removeStreet]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "X") {
        setIsXPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent): void => {
      if (e.key === "X" || e.shiftKey === false) {
        setIsXPressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return (): void => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setIsXPressed]);

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
