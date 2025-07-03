import React from "react";
import type { ProjectTemplateProps } from "./types";

export default function CustomTemplate({ children }: ProjectTemplateProps) {
  // Custom template provides complete freedom - just render the children
  // The project content component is responsible for its own layout and styling
  return <>{children}</>;
}
