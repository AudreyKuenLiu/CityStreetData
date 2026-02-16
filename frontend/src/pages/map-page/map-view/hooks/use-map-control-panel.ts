import { useEffect, useState, useRef } from "react";
import { MapRef } from "react-map-gl/maplibre";
import {
  TerraDraw,
  TerraDrawMouseEvent,
  TerraDrawPolygonMode,
} from "terra-draw";
import { ViewState } from "react-map-gl/maplibre";
import { DEFAULT_ZOOM } from "../constants";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { useActions } from "../../store/street-map-data-form";
import { PolygonSelectHandler } from "../../../../models/map-models/polygon-select-handler";
import { StreetSearchTrees } from "../../../../models/map-models/street-search-tree";

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

export const useMapControlPanel = ({
  mapRef,
  panelRef,
  centerLatLon,
  streetSearchTrees,
}: {
  mapRef: MapRef | null;
  panelRef: HTMLElement | null;
  centerLatLon: readonly [number, number];
  streetSearchTrees: StreetSearchTrees;
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
  const zoom = useRef<number>(DEFAULT_ZOOM);
  zoom.current = viewState.zoom;

  const pointerSelectOptions = {
    onClick: (event: MapLayerMouseEvent): void => {
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
    },
    onHover: (event: MapLayerMouseEvent): void => {
      const street = event.features?.[0];
      if (hoverInfo?.cnn !== street?.properties.cnn) {
        setHoverInfo({
          cnn: street?.properties.cnn,
        });
      }
    },
  };

  const hoverDeleteOptions = {
    onClick: (_: MapLayerMouseEvent): void => {},
    onHover: (event: MapLayerMouseEvent): void => {
      const street = event.features?.[0];
      if (street != null) {
        removeStreet(street.properties.cnn);
      }
    },
  };

  const hoverSelectOptions = {
    onClick: (_: MapLayerMouseEvent): void => {},
    onHover: (event: MapLayerMouseEvent): void => {
      const street = event.features?.[0];
      if (street != null) {
        addStreet({
          cnn: street.properties.cnn,
          line: JSON.parse(street.properties.line),
        });
      }
    },
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

  //event listeners for the map panel
  useEffect(() => {
    if (panelRef == null) {
      return;
    }
    panelRef.focus(); //initially focus to the panel on load
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "x") {
        setMapControl(MapControl.HoverDelete);
      }
      if (e.key === "Control") {
        setMapControl(MapControl.HoverSelect);
      }
      if (e.key === "p") {
        setMapControl(MapControl.PolygonSelect);
      }
      setHoverInfo(null);
    };
    const handleKeyUp = (e: KeyboardEvent): void => {
      if (e.key === "x" || e.key === "Control") {
        setMapControl(MapControl.PointerSelect);
        setHoverInfo(null);
      }
    };
    panelRef.addEventListener("keydown", handleKeyDown);
    panelRef.addEventListener("keyup", handleKeyUp);
    return (): void => {
      panelRef.removeEventListener("keydown", handleKeyDown);
      panelRef.removeEventListener("keyup", handleKeyUp);
    };
  }, [setMapControl, panelRef]);

  //event handlers for terradraw and mapref
  useEffect(() => {
    if (
      mapRef == null ||
      mapControl !== MapControl.PolygonSelect ||
      panelRef == null
    ) {
      return;
    }

    const terraDrawAdapter = new TerraDrawMapLibreGLAdapter({
      map: mapRef?.getMap(),
    });
    const polygonSelectHandler = new PolygonSelectHandler({
      streetSearchTrees,
    });

    const polygonDrawMode = new TerraDrawPolygonMode({
      pointerEvents: {
        leftClick: (event: TerraDrawMouseEvent): boolean => {
          return polygonSelectHandler.onClickValidator(event);
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

    terraDraw.start();
    terraDraw.setMode("polygon");
    terraDraw.on("finish", () => {
      const selectedStreets = polygonSelectHandler.onFinish({
        zoomLevel: zoom.current,
      });
      for (const street of selectedStreets) {
        addStreet(street);
      }
      terraDraw?.clear();
    });

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        polygonSelectHandler.onClear();
      }
    };
    panelRef.addEventListener("keydown", handleKeyDown);
    return (): void => {
      panelRef.removeEventListener("keydown", handleKeyDown);
      if (terraDraw) {
        terraDraw?.setMode("static");
        terraDraw?.stop();
      }
    };
  }, [mapControl, panelRef, mapRef, streetSearchTrees, addStreet]);

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
