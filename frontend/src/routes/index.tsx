import React, { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import "./spinner.css";
//import { MapPage } from "../pages/map-page";
const MapPage = React.lazy(() =>
  import("../pages/map-page").then((module) => ({
    default: module.MapPage,
  })),
);

export const Route = createFileRoute("/")({
  component: Index,
});

function Index(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div
          style={{
            position: "absolute",
            display: "flex",
            height: "100vh",
            width: "100vw",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="spinner" />
        </div>
      }
    >
      <MapPage />
    </Suspense>
  );
}
