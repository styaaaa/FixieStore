import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";

import { Spinner } from "./ui/spinner";

export const GlobalLoadingOverlay = () => {
  const location = useLocation();
  const activeFetches = useIsFetching();
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    setRouteLoading(true);
    const timeout = setTimeout(() => setRouteLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const showOverlay = routeLoading || activeFetches > 0;
  if (!showOverlay) return null;

  const message = routeLoading ? "Memuat halaman..." : "Memuat data...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-8 text-center shadow-lg">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-base font-semibold text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">Harap tunggu sebentar</p>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
