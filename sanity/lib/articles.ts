import {cacheLife, cacheTag} from 'next/cache'
import type {PortableTextBlock} from 'sanity'
import {client} from './client'

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

export type ArticleFull = {
  _id: string
  title: string
  subtitle?: string
  publishedAt: string
  category?: string
  author?: string
  image?: string
  imageAlt?: string
  body?: PortableTextBlock[]
}

export type Category = {_id: string; title: string; slug: string}

/* ---------- Homepage ---------- */

export async function getLatestArticles() {
  'use cache'
  cacheLife('minutes')
  cacheTag('articles')

  return client.fetch<ArticleCard[]>(`
    *[_type == "article" && defined(slug.current)]
      | order(publishedAt desc)[0...12] {
        _id,
        title,
        subtitle,
        excerpt,
        publishedAt,
        "slug": slug.current,
        "category": category->title,
        "author": author->name,
        "image": heroImage.asset->url
      }
  `)
}

/* ---------- Single article ---------- */

export async function getArticleSlugs() {
  return client.fetch<string[]>(
    `*[_type == "article" && defined(slug.current)].slug.current`
  )
}

export async function getArticle(slug: string) {
  'use cache'
  cacheLife('minutes')
  cacheTag('articles')

  return client.fetch<ArticleFull | null>(
    `*[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      subtitle,
      publishedAt,
      "category": category->title,
      "author": author->name,
      "image": heroImage.asset->url,
      "imageAlt": heroImage.alt,
      body[] {
        ...,
        _type == "image" => {..., "url": asset->url}
      }
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
        | order(publishedAt desc) {
          _id,
          title,
          subtitle,
          excerpt,
          publishedAt,
          "slug": slug.current,
          "category": category->title,
          "author": author->name,
          "image": heroImage.asset->url
        }
    }`,
    {slug}
  )
}

/* ---------- Search (titles only) ---------- */

export async function searchArticles(query: string) {
  const terms = query
    .replace(/[*"]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)

  if (terms.length === 0) return []

  // "star gir" becomes "star* gir*" so partial words match
  const pattern = terms.map((t) => `${t}*`).join(' ')

  return client.fetch<ArticleCard[]>(
    `*[_type == "article" && defined(slug.current) && title match $pattern]
      | order(publishedAt desc)[0...24] {
        _id,
        title,
        subtitle,
        excerpt,
        publishedAt,
        "slug": slug.current,
        "category": category->title,
        "author": author->name,
        "image": heroImage.asset->url
      }`,
    {pattern}
  )
}
export type SearchSuggestion = {
  _id: string
  title: string
  slug: string
  category?: string
}

export async function searchSuggestions(query: string) {
  const terms = query
    .replace(/[*"]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)

  if (terms.length === 0) return []

  const pattern = terms.map((t) => `${t}*`).join(' ')

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

export type HomepageData = {
  lead: ArticleCard | null
  latest: ArticleCard[]
  sections: {title: string; slug: string; articles: ArticleCard[]}[]
}

export async function getHomepage() {
  'use cache'
  cacheLife('minutes')
  cacheTag('articles')

  return client.fetch<HomepageData>(`{
    "lead": *[_type == "article" && defined(slug.current)]
      | order(coalesce(featured, false) desc, publishedAt desc)[0] {${CARD_FIELDS}},
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