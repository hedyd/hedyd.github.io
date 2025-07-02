import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/data/projects" }),
  schema: z.object({
    title: z.string(),
    job: z.string(),
    year: z.number(),
    images: z.string().array(),
    imageHeight: z.number(),
    video: z.string(),
    summary: z.string(),
    responsibilities: z.string().array(),
    features: z.string().array(),
    skills: z.string().array(),
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
