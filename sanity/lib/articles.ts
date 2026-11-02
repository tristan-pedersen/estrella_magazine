import {cacheLife, cacheTag} from 'next/cache'
import type {PortableTextBlock} from 'sanity'
import {client} from './client'

/* ---------- Shared pieces ---------- */

// The fields every story card needs
const CARD_FIELDS = `
  _id,
  title,
  subtitle,
  excerpt,
  publishedAt,
  "slug": slug.current,
  "category": category->title,
  "author": author->name,
  "image": heroImage.asset->url
`

// "star gir" becomes "star* gir*" so partial words match
function makePattern(query: string) {
  const terms = query
    .replace(/[*"]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)

  return terms.length > 0 ? terms.map((t) => `${t}*`).join(' ') : null
}

/* ---------- Types ---------- */

export type ArticleCard = {
  _id: string
  title: string
  subtitle?: string
  excerpt?: string
  publishedAt: string
  slug: string
  category?: string
  author?: string
  image?: string
}

export type Category = {_id: string; title: string; slug: string}

export type SearchSuggestion = {
  _id: string
  title: string
  slug: string
  category?: string
}

export type HomepageData = {
  features: ArticleCard[]
  latest: ArticleCard[]
  sections: {title: string; slug: string; articles: ArticleCard[]}[]
}

export type ArticlePageData = {
  _id: string
  title: string
  subtitle?: string
  excerpt?: string
  publishedAt: string
  category?: string
  categorySlug?: string
  author?: {name: string; bio?: string; photo?: string; instagram?: string}
  image?: string
  imageAlt?: string
  body?: PortableTextBlock[]
  related: ArticleCard[]
}

export type SiteSettings = {
  mostTalkedAbout: {_id: string; title: string; slug: string; category?: string}[]
  videos: {_key: string; title: string; url: string}[]
}

/* ---------- Homepage ---------- */

export async function getHomepage() {
  'use cache'
  cacheLife('minutes')
  cacheTag('articles')

  return client.fetch<HomepageData>(`{
    "features": *[_type == "article" && defined(slug.current)]
      | order(coalesce(featured, false) desc, publishedAt desc)[0...2] {${CARD_FIELDS}},
    "latest": *[_type == "article" && defined(slug.current)]
      | order(publishedAt desc)[0...8] {${CARD_FIELDS}},
    "sections": *[_type == "category" && defined(slug.current)]
      | order(_createdAt asc) {
        title,
        "slug": slug.current,
        "articles": *[_type == "article" && defined(slug.current) && references(^._id)]
          | order(publishedAt desc)[0...4] {${CARD_FIELDS}}
      }
  }`)
}

export async function getSiteSettings(): Promise<SiteSettings> {
  'use cache'
  cacheLife('minutes')
  cacheTag('articles')

  const data = await client.fetch<{
    mostTalkedAbout?: ({_id: string; title: string; slug: string; category?: string} | null)[]
    videos?: SiteSettings['videos']
  } | null>(`*[_id == "siteSettings"][0] {
    "mostTalkedAbout": mostTalkedAbout[]->{
      _id,
      title,
      "slug": slug.current,
      "category": category->title
    },
    videos[] {_key, title, url}
  }`)

  return {
    // Unpublished or deleted articles come back empty, so skip those
    mostTalkedAbout: (data?.mostTalkedAbout ?? []).filter(
      (a): a is NonNullable<typeof a> => !!a && !!a.slug
    ),
    videos: data?.videos ?? [],
  }
}

/* ---------- Single article ---------- */

export async function getArticleSlugs() {
  return client.fetch<string[]>(
    `*[_type == "article" && defined(slug.current)].slug.current`
  )
}

export async function getArticlePage(slug: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('articles')

  return client.fetch<ArticlePageData | null>(
    `*[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      subtitle,
      excerpt,
      publishedAt,
      "category": category->title,
      "categorySlug": category->slug.current,
      "author": author->{name, bio, "photo": photo.asset->url, instagram},
      "image": heroImage.asset->url,
      "imageAlt": heroImage.alt,
      body[] {
        ...,
        _type == "image" => {..., "url": asset->url}
      },
      "related": *[_type == "article" && defined(slug.current) && _id != ^._id && category._ref == ^.category._ref]
        | order(publishedAt desc)[0...3] {${CARD_FIELDS}}
    }`,
    {slug}
  )
}

/* ---------- Categories ---------- */

export async function getCategories() {
  'use cache'
  cacheLife('minutes')
  cacheTag('articles')

  return client.fetch<Category[]>(`
    *[_type == "category" && defined(slug.current)] | order(_createdAt asc) {
      _id,
      title,
      "slug": slug.current
    }
  `)
}

export async function getCategoryWithArticles(slug: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('articles')

  return client.fetch<{
    title: string
    description?: string
    articles: ArticleCard[]
  } | null>(
    `*[_type == "category" && slug.current == $slug][0] {
      title,
      description,
      "articles": *[_type == "article" && references(^._id)]
        | order(publishedAt desc) {${CARD_FIELDS}}
    }`,
    {slug}
  )
}

/* ---------- Search (titles only) ---------- */

export async function searchArticles(query: string) {
  const pattern = makePattern(query)
  if (!pattern) return []

  return client.fetch<ArticleCard[]>(
    `*[_type == "article" && defined(slug.current) && title match $pattern]
      | order(publishedAt desc)[0...24] {${CARD_FIELDS}}`,
    {pattern}
  )
}

export async function searchSuggestions(query: string) {
  const pattern = makePattern(query)
  if (!pattern) return []

  return client.fetch<SearchSuggestion[]>(
    `*[_type == "article" && defined(slug.current) && title match $pattern]
      | order(publishedAt desc)[0...6] {
        _id,
        title,
        "slug": slug.current,
        "category": category->title
      }`,
    {pattern}
  )
}