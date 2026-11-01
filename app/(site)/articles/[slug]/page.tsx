import {Suspense} from 'react'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import {getArticlePage, getArticleSlugs} from '@/sanity/lib/articles'
import {SectionHeader, StoryCard} from '@/components/stories'

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p>{children}</p>,
    h2: ({children}) => (
      <h2 className="mt-12 font-display text-3xl font-bold leading-tight">{children}</h2>
    ),
    h3: ({children}) => (
      <h3 className="mt-10 font-display text-2xl font-bold leading-tight">{children}</h3>
    ),
    blockquote: ({children}) => (
      <blockquote className="my-12 border-l-4 border-olive pl-6 font-display text-3xl font-semibold italic leading-snug text-heading">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => <ul className="list-disc space-y-2 pl-6">{children}</ul>,
    number: ({children}) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
  },
  marks: {
    link: ({children, value}) => (
      <a
        href={value?.href}
        rel="noopener noreferrer"
        className="underline decoration-olive decoration-2 underline-offset-4 hover:text-heading"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({value}) =>
      value?.url ? (
        <figure className="my-10 lg:-mx-24">
          <img src={`${value.url}?w=1600&auto=format`} alt={value.caption ?? ''} className="w-full" />
          {value.caption && (
            <figcaption className="mt-2 text-sm italic">{value.caption}</figcaption>
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
  const article = await getArticlePage(slug)

  if (!article) notFound()

  const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article>
      <header className="mx-auto max-w-4xl px-6 pt-12 text-center">
        {article.category && (
          <Link
            href={`/category/${article.categorySlug}`}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-heading"
          >
            {article.category}
          </Link>
        )}
        <h1 className="mt-4 font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="mx-auto mt-6 max-w-2xl font-display text-2xl italic leading-snug">
            {article.subtitle}
          </p>
        )}
        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-3 border-y border-olive py-3 text-xs uppercase tracking-widest">
          {article.author && (
            <>
              <span>By {article.author.name}</span>
              <span aria-hidden>·</span>
            </>
          )}
          <time dateTime={article.publishedAt}>{date}</time>
        </div>
      </header>

      {article.image && (
        <div className="mx-auto mt-10 max-w-5xl px-6">
          <img
            src={`${article.image}?w=1800&auto=format`}
            alt={article.imageAlt ?? article.title}
            className="aspect-[3/2] w-full object-cover"
          />
        </div>
      )}

      <div className="drop-cap mx-auto mt-12 max-w-2xl space-y-6 px-6 text-xl leading-relaxed">
        {article.body && <PortableText value={article.body} components={components} />}
      </div>

      {article.author && (
        <aside className="mx-auto mt-16 flex max-w-2xl gap-5 border-t border-olive px-6 pt-8">
          {article.author.photo && (
            <img
              src={`${article.author.photo}?w=200&h=200&fit=crop&auto=format`}
              alt={article.author.name}
              className="h-20 w-20 shrink-0 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-heading">Written by</p>
            <p className="font-display text-2xl font-bold">{article.author.name}</p>
            {article.author.bio && <p className="mt-1 leading-snug">{article.author.bio}</p>}
            {article.author.instagram && (
              <a
                href={article.author.instagram}
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs uppercase tracking-widest underline decoration-olive underline-offset-4"
              >
                Instagram
              </a>
            )}
          </div>
        </aside>
      )}

      {article.category && article.related.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-6">
          <SectionHeader
            title={`More in ${article.category}`}
            href={`/category/${article.categorySlug}`}
          />
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {article.related.map((a) => (
              <StoryCard key={a._id} article={a} size="small" />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export default function ArticlePage({params}: {params: Promise<{slug: string}>}) {
  return (
    <main>
      <Suspense fallback={<p className="p-10">Loading…</p>}>
        <Article params={params} />
      </Suspense>
    </main>
  )
}