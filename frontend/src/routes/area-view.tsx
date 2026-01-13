import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/area-view")({
  component: RouteComponent,
});

function RouteComponent(): React.JSX.Element {
  return <div>Hello "/area-view"!</div>;
}
