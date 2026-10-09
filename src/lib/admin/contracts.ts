import { z } from "zod";

export const ADMIN_KINDS=["source","authority","observance","article"] as const;
export const ADMIN_STATES=["draft","in_review","published","archived"] as const;
export type AdminKind=typeof ADMIN_KINDS[number];
export type AdminState=typeof ADMIN_STATES[number];
const httpsUrl=z.string().trim().url().refine(value=>value.startsWith("https://"),"An HTTPS source is required.");
const fields={
  title:z.string().trim().min(3).max(160),
  slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  summary:z.string().trim().max(600).default(""),
  body:z.string().trim().max(16000).default(""),
  sourceUrl:z.union([httpsUrl,z.literal("")]).default(""),
  country:z.string().trim().max(100).default(""),
  tradition:z.string().trim().max(100).default(""),
  eventDate:z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/),z.literal("")]).default("")
};
export const CreateAdminRecord=z.object({kind:z.enum(ADMIN_KINDS),...fields}).strict();
export const UpdateAdminRecord=z.object({
  title:fields.title.optional(),slug:fields.slug.optional(),
  summary:fields.summary.optional(),body:fields.body.optional(),
  sourceUrl:fields.sourceUrl.optional(),country:fields.country.optional(),
  tradition:fields.tradition.optional(),eventDate:fields.eventDate.optional(),
  status:z.enum(ADMIN_STATES).optional(),
  expectedVersion:z.number().int().positive()
}).strict();
export type CreateInput=z.infer<typeof CreateAdminRecord>;
export type UpdateInput=z.infer<typeof UpdateAdminRecord>;

export const transitionAllowed=(from:AdminState,to:AdminState)=>from===to||(
  (from==="draft"&&to==="in_review")||
  (from==="in_review"&&(to==="draft"||to==="published"))||
  (from==="published"&&to==="archived")||
  (from==="archived"&&to==="draft")
);
export const publishReady=(value:{title:string;summary:string;body:string;sourceUrl:string;kind:AdminKind})=>{
  if(!value.title||!value.summary||!value.body)return false;
  // Every externally asserted item must carry a source. Editorial articles also need one.
  return value.sourceUrl.startsWith("https://");
};
export type AdminRecord={
  id:string;kind:AdminKind;title:string;slug:string;summary:string;body:string;sourceUrl:string;
  country:string;tradition:string;eventDate:string;status:AdminState;
  version:number;createdBy:string;updatedBy:string;createdAt:string|null;updatedAt:string|null;
};
