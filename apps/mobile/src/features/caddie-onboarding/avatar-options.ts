export const caddieAvatarOptions = [
  { icon: "account", id: "avatar://caddie-classic", label: "Classic profile" },
  { icon: "account-tie-hat", id: "avatar://caddie-hat", label: "Caddie hat" },
  { icon: "account-star", id: "avatar://caddie-featured", label: "Featured profile" }
] as const;

export function selectedCaddieAvatar(id: string) {
  return caddieAvatarOptions.find((option) => option.id === id) ?? caddieAvatarOptions[0];
}
