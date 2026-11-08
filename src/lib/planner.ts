import { z } from "zod";
import { validCivilDate } from "@/lib/ui/moment";
export const PlannerInput=z.object({
 title:z.string().trim().min(1).max(160),
 date:z.string().refine(validCivilDate,"Choose a real date between 1900 and 2100."),
 category:z.enum(["personal","family","work","festival"]).default("personal"),
 notes:z.string().trim().max(2000).default(""),
 completed:z.boolean().default(false)
}).strict();
export type PlannerValues=z.infer<typeof PlannerInput>;
export type PlannerEvent=PlannerValues&{id:string;createdAt:string};
export const PLANNER_MODULE="worldpatro-planner-v1";
export const PLANNER_STORAGE_KEY="worldpatro.planner.v1";
export function readDeviceEvents(raw:string|null):PlannerEvent[]{
 try{
  const data:unknown=JSON.parse(raw||"[]");if(!Array.isArray(data))return [];
  return data.slice(0,500).flatMap(item=>{
   if(!item||typeof item!=="object")return [];
   const {id,createdAt,...values}=item as Record<string,unknown>;
   const parsed=PlannerInput.safeParse(values);
   return parsed.success&&typeof id==="string"&&id.length<=128&&typeof createdAt==="string"?[{...parsed.data,id,createdAt}]:[];
  });
 }catch{return [];}
}
