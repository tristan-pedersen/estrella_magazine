import {Suspense} from 'react'
import {notFound} from 'next/navigation'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import {getArticle, getArticleSlugs} from '@/sanity/lib/articles'

const components: PortableTextComponents = {
  types: {
    image: ({value}) =>
      value?.url ? (
        <figure className="my-10">
          <img
            src={`${value.url}?w=1400&auto=format`}
            alt={value.caption ?? ''}
            className="w-full"
          />
          {value.caption && (
            <figcaption className="mt-2 text-sm">{value.caption}</figcaption>
          )}
        </figure>
      ) : null,
  },
}

export async function generateStaticParams() {
  const slugs = await getArticleSlugs()
  return slugs.map((slug) => ({slug}))
}

async function Article({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const article = await getArticle(slug)

  if (!article) notFound()

  const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="mx-auto max-w-2xl px-6 py-12">
      {article.category && (
        <p className="text-xs uppercase tracking-widest">{article.category}</p>
      )}
      <h1 className="mt-2 text-4xl font-bold leading-tight">{article.title}</h1>
      {article.subtitle && <p className="mt-3 text-xl">{article.subtitle}</p>}
      <p className="mt-4 text-sm">
        {article.author && <>By {article.author} · </>}
        {date}
      </p>

      {article.image && (
        <img
          src={`${article.image}?w=1400&auto=format`}
          alt={article.imageAlt ?? article.title}
          className="my-10 w-full"
        />
      )}

      <div className="space-y-5 text-lg leading-relaxed">
        {article.body && <PortableText value={article.body} components={components} />}
      </div>
    </article>
  )
}

export default function ArticlePage({params}: {params: Promise<{slug: string}>}) {
  return (
    <Suspense fallback={<p className="p-6">Loading…</p>}>
      <Article params={params} />
    </Suspense>
  )
}