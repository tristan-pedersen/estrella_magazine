import {cacheLife, cacheTag} from 'next/cache'
import {client} from './client'
import type {PortableTextBlock} from 'sanity'

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
export type Category = {_id: string; title: string; slug: string}

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