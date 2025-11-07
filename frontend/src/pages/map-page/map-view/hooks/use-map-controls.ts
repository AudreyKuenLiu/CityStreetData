import { useState, useEffect, useRef } from "react";
import { ViewState } from "react-map-gl/maplibre";
import { DEFAULT_ZOOM } from "../constants";
import { useActions } from "../../store/street-map-data-form";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";

interface useMapControlsReturn {
  hoverInfo: { cnn: string } | null;
  onHover: (event: MapLayerMouseEvent) => void;
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
  const timeMs = useRef<number>(0);
  const [hoverInfo, setHoverInfo] = useState<{ cnn: string } | null>(null);
  const [key, setKey] = useState(0);
  const [isXPressed, setIsXPressed] = useState(false);

  const { addStreet, removeStreet } = useActions();

  const throttleFunc = (
    func: (e?: MapLayerMouseEvent) => void,
    event?: MapLayerMouseEvent
  ): void => {
    const throttleTimeMs = 30;
    if (Date.now() - timeMs.current <= throttleTimeMs) {
      return;
    }
    func(event);
    timeMs.current = Date.now();
    return;
  };

  const onHover = (event?: MapLayerMouseEvent): void => {
    if (event == null) {
      return;
    }
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
  };

  const throttledHover = (event: MapLayerMouseEvent): void =>
    throttleFunc(onHover, event);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "x") {
        setIsXPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent): void => {
      if (e.key === "x") {
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

  return {
    hoverInfo,
    onHover: throttledHover,
    key,
    setKey,
    viewState,
    setViewState,
  };
};
