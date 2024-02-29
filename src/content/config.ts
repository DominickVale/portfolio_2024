import { z, defineCollection, type CollectionEntry } from "astro:content";
const postsCollection = defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      subtitle: z.string(),
      description: z.string(),
      date: z.date(),
      lastUpdated: z.date(),
      image: z.object({
        url: z.string(),
        alt: z.string()
      }),
      tags: z.array(z.string()),
      ttr: z.number()
    })
});

export const collections = {
  posts: postsCollection,
};

export type Frontmatter = CollectionEntry<'blog'>['data']
