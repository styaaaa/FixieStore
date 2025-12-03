import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { FixieLoading } from "./FixieLoading";

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

  return <FixieLoading message={message} size="md" fullscreen />;
};

export default GlobalLoadingOverlay;
