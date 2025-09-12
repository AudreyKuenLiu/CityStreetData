import { createFileRoute } from "@tanstack/react-router";
import { MapPage } from "../pages/map-page";
import React from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index(): React.JSX.Element {
  return <MapPage />;
}
