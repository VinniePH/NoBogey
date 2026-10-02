import { mobilePalette } from "./mobile-palette";

/** White surfaces, forest structure, and gold highlights for account entry. */
export const authPalette = {
  ...mobilePalette,
  surface: "#FFFFFF",
  primary: mobilePalette.forest,
  primaryPressed: mobilePalette.forestDark,
  onPrimary: "#FFFFFF"
} as const;
