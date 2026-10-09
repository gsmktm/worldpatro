export const MUHURAT_CATEGORIES=[
  "general","education","travel","business_opening","griha_pravesh",
  "engagement","marriage","naming","bhoomi_puja"
] as const;
export type MuhuratCategory=typeof MUHURAT_CATEGORIES[number];
