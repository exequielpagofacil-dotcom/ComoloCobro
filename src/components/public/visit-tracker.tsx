"use client";

import { useEffect } from "react";

type VisitTrackerProps = {
  empresaId: string;
};

export function VisitTracker({ empresaId }: VisitTrackerProps) {
  useEffect(() => {
    void fetch("/api/visita", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ empresaId }),
      cache: "no-store",
    });
  }, [empresaId]);

  return null;
}
