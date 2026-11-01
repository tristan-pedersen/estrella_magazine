import Link from 'next/link'
import type {ArticleCard as ArticleCardData} from '@/sanity/lib/articles'

export function ArticleCard({article}: {article: ArticleCardData}) {
  const href = `/articles/${article.slug}`

  return (
    <article>
      {article.image && (
        <Link href={href}>
          <img
            src={`${article.image}?w=800&auto=format`}
            alt={article.title}
            className="mb-4 aspect-[4/5] w-full object-cover"
          />
        </Link>
      )}
      {article.category && (
        <p className="text-xs uppercase tracking-widest">{article.category}</p>
      )}
      <h2 className="mt-1 text-2xl font-semibold">
        <Link href={href}>{article.title}</Link>
      </h2>
      {article.excerpt && <p className="mt-2 text-sm">{article.excerpt}</p>}
      {article.author && <p className="mt-2 text-xs">By {article.author}</p>}
    </article>
  )
}