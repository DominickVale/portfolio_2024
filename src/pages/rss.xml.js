import rss from '@astrojs/rss'
import { pagesGlobToRssItems } from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET(context) {
  const posts = await getCollection('blog')
  return rss({
    title: "Dominick's ramblings",
    description: 'Ramblings',
    site: context.site,
    //include both md and mdx
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.{md,mdx}')),
    items: posts.map((post) => ({
      title: post.data.title,
      date: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  })
}
