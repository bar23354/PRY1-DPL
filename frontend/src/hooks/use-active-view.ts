"use client";

import { useState } from "react";

import { DEFAULT_VIEW } from "../lib/modules";
import type { ViewKey } from "../types/shell";

export function useActiveView(initialView: ViewKey = DEFAULT_VIEW) {
  const [activeView, setActiveView] = useState<ViewKey>(initialView);

  return {
    activeView,
    setActiveView,
  };
}
