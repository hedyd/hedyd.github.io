import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/data/projects" }),
  schema: z.object({
    title: z.string(),
    job: z.string().optional(),
    year: z.number().optional(),
    // Sort order for entries without a year (e.g. teaching, conclusion).
    order: z.number().optional(),
    // Pins the nav sticky note to a specific solid pattern instead of the
    // index-based default.
    noteSolidType: z.enum(["checkered", "dotted", "lines"]).optional(),
    images: z.string().array(),
    imageHeight: z.number(),
    // Optional overrides for the polaroid caption (defaults to title/job/year).
    imageTitle: z.string().optional(),
    imageJob: z.string().optional(),
    imageYear: z.number().optional(),
    video: z.string().optional(),
    summary: z.union([z.string(), z.string().array()]).optional(),
    responsibilities: z.string().array().optional(),
    features: z.string().array().optional(),
    skills: z.string().array().optional(),
    roles: z
      .object({
        title: z.string(),
        org: z.string(),
        items: z.string().array(),
      })
      .array()
      .optional(),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/data/about" }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    images: z.string().array(),
    imageHeight: z.number(),
    imageTitle: z.string(),
    imageJob: z.string(),
    imageYear: z.number(),
    summary: z.string().array(),
    skills: z
      .object({
        type: z.string(),
        skills: z.string().array(),
      })
      .array(),
    links: z
      .object({
        title: z.string(),
        svg: z.string(),
        url: z.string(),
      })
      .array(),
  }),
});

export const collections = { projects, about };
