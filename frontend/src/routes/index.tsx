import { createFileRoute } from "@tanstack/react-router";
import { MapPage } from "../pages/map-page";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <MapPage />;
}
