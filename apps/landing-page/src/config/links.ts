const optionalUrl = (value: string | undefined) => value?.trim() || undefined;

export const installLinks = {
  golfer: {
    appStore: optionalUrl(import.meta.env.VITE_GOLFER_APP_STORE_URL),
    googlePlay: optionalUrl(import.meta.env.VITE_GOLFER_GOOGLE_PLAY_URL)
  },
  caddie: {
    appStore: optionalUrl(import.meta.env.VITE_CADDIE_APP_STORE_URL),
    googlePlay: optionalUrl(import.meta.env.VITE_CADDIE_GOOGLE_PLAY_URL)
  }
} as const;

export const adminWebUrl = optionalUrl(import.meta.env.VITE_ADMIN_WEB_URL) ?? "http://localhost:8080/login";
export const clubContactEmail = import.meta.env.VITE_CLUB_CONTACT_EMAIL?.trim() || "hello@nobogey.app";
