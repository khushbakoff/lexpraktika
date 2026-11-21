import { z } from "zod";
import { sourceSchema } from "@/lib/content/scenario-schema";

export const employerSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** Ish beruvchiga mos kasbiy yo'nalish (lib/tracks.ts). */
  trackId: z.string().min(1),
  icon: z.string().min(1),
  tagline: z.string(),
  about: z.string(),
  requirements: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        detail: z.string().default(""),
        /** kirish: ishga qabul talablari; ish: ish jarayonidagi bilim va ko'nikma */
        kind: z.enum(["kirish", "ish"]),
        scenarioIds: z.array(z.string()).min(1),
        sources: z.array(sourceSchema).default([]),
      }),
    )
    .min(1),
  /** "Ish kuni": real ish jarayoni tartibida vaziyatlar. */
  workflow: z.array(z.object({ title: z.string(), scenarioId: z.string() })).default([]),
});

export type Employer = z.infer<typeof employerSchema>;
