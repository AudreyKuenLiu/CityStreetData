import { useEffect, useState } from "react";
import { MapRef } from "react-map-gl/maplibre";
import {
  TerraDraw,
  TerraDrawMouseEvent,
  TerraDrawPolygonMode,
  ValidateNotSelfIntersecting,
} from "terra-draw";
import { ViewState } from "react-map-gl/maplibre";
import { DEFAULT_ZOOM } from "../constants";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useActions } from "../../store/street-map-data-form";
import { polygon } from "@turf/turf";
import type { Position } from "geojson";

export enum MapControl {
  PointerSelect,
  PolygonSelect,
  HoverDelete,
  HoverSelect,
}

interface UseMapControlPanelReturn {
  hoverInfo: { cnn: string } | null;
  onHover: (event: MapLayerMouseEvent) => void;
  onClick: (event: MapLayerMouseEvent) => void;
  viewState: ViewState;
  setViewState: (nextViewState: ViewState) => void;
  currentMapControl: MapControl;
  setMapControl: (mapControl: MapControl) => void;
}

let terraDraw: TerraDraw | null = null;

let timeMs = 0;
const throttleFunc = (
  func: (e: MapLayerMouseEvent) => void,
  event: MapLayerMouseEvent,
): void => {
  const throttleTimeMs = 50;
  if (Date.now() - timeMs <= throttleTimeMs) {
    return;
  }
  func(event);
  timeMs = Date.now();
  return;
};

const pointerSelectOptions = {
  onClick: (_: MapLayerMouseEvent): void => {},
  onHover: (_: MapLayerMouseEvent): void => {},
};

const hoverDeleteOptions = {
  onClick: (_: MapLayerMouseEvent): void => {},
  onHover: (_: MapLayerMouseEvent): void => {},
};

const hoverSelectOptions = {
  onClick: (_: MapLayerMouseEvent): void => {},
  onHover: (_: MapLayerMouseEvent): void => {},
};

const polygonSelectOptions = {
  onClick: (_: MapLayerMouseEvent): void => {},
  onHover: (_: MapLayerMouseEvent): void => {},
};

const controllerOptions = {
  [MapControl.PointerSelect]: pointerSelectOptions,
  [MapControl.HoverDelete]: hoverDeleteOptions,
  [MapControl.HoverSelect]: hoverSelectOptions,
  [MapControl.PolygonSelect]: polygonSelectOptions,
};

export const useMapControlPanel = ({
  mapRef,
  panelRef,
  centerLatLon,
}: {
  mapRef: MapRef | null;
  panelRef: HTMLElement | null;
  centerLatLon: readonly [number, number];
}): UseMapControlPanelReturn => {
  const [mapControl, setMapControl] = useState(MapControl.PointerSelect);
  const [hoverInfo, setHoverInfo] = useState<{ cnn: string } | null>(null);
  const { addStreet, removeStreet, toggleStreet } = useActions();
  const [viewState, setViewState] = useState<ViewState>({
    longitude: centerLatLon[1],
    latitude: centerLatLon[0],
    zoom: DEFAULT_ZOOM,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  //event handlers for the for the map
  useEffect(() => {
    pointerSelectOptions.onClick = (event: MapLayerMouseEvent): void => {
      const features = event.features;
      if (
        features?.[0]?.properties?.cnn != null &&
        features?.[0].geometry.type === "LineString"
      ) {
        toggleStreet({
          cnn: features[0].properties.cnn,
          line: JSON.parse(features[0].properties.line),
        });
      }
    };
    pointerSelectOptions.onHover = (event: MapLayerMouseEvent): void => {
      const street = event.features?.[0];
      if (hoverInfo?.cnn !== street?.properties.cnn) {
        setHoverInfo({
          cnn: street?.properties.cnn,
        });
      }
    };

    hoverDeleteOptions.onHover = (event: MapLayerMouseEvent): void => {
      const street = event.features?.[0];
      if (street != null) {
        removeStreet(street.properties.cnn);
      }
    };

    hoverSelectOptions.onHover = (event: MapLayerMouseEvent): void => {
      const street = event.features?.[0];
      if (street != null) {
        addStreet({
          cnn: street.properties.cnn,
          line: JSON.parse(street.properties.line),
        });
      }
    };
  }, [addStreet, removeStreet, toggleStreet, hoverInfo]);

  //event listeners for the map panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "x") {
        setMapControl(MapControl.HoverDelete);
        setHoverInfo(null);
      }
      if (e.key === "Control") {
        setMapControl(MapControl.HoverSelect);
        setHoverInfo(null);
      }
    };
    const handleKeyUp = (e: KeyboardEvent): void => {
      if (e.key === "x" || e.key === "Control") {
        setMapControl(MapControl.PointerSelect);
        setHoverInfo(null);
      }
    };
    panelRef?.addEventListener("keydown", handleKeyDown);
    panelRef?.addEventListener("keyup", handleKeyUp);
    return (): void => {
      panelRef?.removeEventListener("keydown", handleKeyDown);
      panelRef?.removeEventListener("keyup", handleKeyUp);
    };
  }, [setMapControl, panelRef]);

  //event handlers for terradraw and mapref
  useEffect(() => {
    if (mapRef == null) {
      return;
    }

    const terraDrawAdapter = new TerraDrawMapLibreGLAdapter({
      map: mapRef?.getMap(),
    });
    let polygonLine: Position[] = [];

    const polygonDrawMode = new TerraDrawPolygonMode({
      pointerEvents: {
        leftClick: (event: TerraDrawMouseEvent): boolean => {
          const { lat, lng } = event;
          const newPos: Position = [lng, lat];
          const startPos = polygonLine[0];
          const polygonArr =
            startPos != null ? [...polygonLine, newPos] : [newPos];

          let valid = true;
          if (polygonArr.length >= 3) {
            const { valid: isValid } = ValidateNotSelfIntersecting(
              polygon([[...polygonArr, polygonArr[0]]]),
            );
            valid = isValid;
          }
          if (valid) {
            polygonLine = polygonArr;
          }
          return valid;
        },
        rightClick: true,
        contextMenu: true,
        onDragStart: true,
        onDrag: true,
        onDragEnd: true,
      },
    });
    terraDraw = new TerraDraw({
      adapter: terraDrawAdapter,
      modes: [polygonDrawMode],
    });

    if (mapControl === MapControl.PolygonSelect) {
      terraDraw.start();
      terraDraw.setMode("polygon");
      terraDraw.on("finish", () => {
        console.log("on complete handler");
        terraDraw?.clear();
      });
      terraDraw.on("change", (_, type) => {
        if (type === "delete") {
          polygonLine = [];
        }
      });
    }
    return (): void => {
      if (mapControl === MapControl.PolygonSelect && terraDraw) {
        terraDraw?.setMode("static");
        terraDraw?.stop();
      }
    };
  }, [mapControl, mapRef]);

  return {
    onClick: (event: MapLayerMouseEvent): void => {
      controllerOptions[mapControl].onClick(event);
    },
    onHover: (event: MapLayerMouseEvent): void => {
      throttleFunc(controllerOptions[mapControl].onHover, event);
    },
    currentMapControl: mapControl,
    setMapControl: setMapControl,
    hoverInfo,
    viewState,
    setViewState,
  };
};
