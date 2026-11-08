import { z } from "zod";
import { slugSchema } from "./content";

export const searchQuerySchema = z.object({ q: z.string().trim().min(1).max(100) });

export const slugListSchema = z
  .string()
  .max(4000)
  .transform((v) => v.split(",").filter(Boolean))
  .pipe(z.array(slugSchema).max(200));

export const feedbackSchema = z.object({ slug: slugSchema, helpful: z.boolean() });
export const viewSchema = z.object({ slug: slugSchema });
