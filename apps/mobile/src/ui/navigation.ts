import { router, type Href } from "expo-router";

/** Returns to the actual previous screen, retaining a deterministic direct-link fallback. */
export function backToPreviousPage(fallback: Href) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
