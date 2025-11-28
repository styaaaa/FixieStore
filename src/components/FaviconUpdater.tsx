import { useEffect } from "react";
import { useTheme } from "next-themes";

const lightFavicon = "/fixie-icon-light.png";
const darkFavicon = "/fixie-icon-dark.png";

export const FaviconUpdater = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const existingLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const link = existingLink ?? document.createElement("link");

    link.rel = "icon";
    link.type = "image/png";
    link.href = resolvedTheme === "dark" ? darkFavicon : lightFavicon;

    if (!link.parentElement) {
      document.head.appendChild(link);
    }
  }, [resolvedTheme]);

  return null;
};