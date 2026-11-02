import Link from 'next/link'
import type {ArticleCard} from '@/sanity/lib/articles'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Label({children}: {children: React.ReactNode}) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-heading">
      {children}
    </p>
  )
}

function Byline({article}: {article: ArticleCard}) {
  return (
    <p className="mt-3 text-xs uppercase tracking-widest">
      {article.author && <>By {article.author} · </>}
      {formatDate(article.publishedAt)}
    </p>
  )
}

function Picture({article, ratio}: {article: ArticleCard; ratio: string}) {
  return (
    <Link href={`/articles/${article.slug}`} className="block">
      {article.image ? (
        <img
          src={`${article.image}?w=1400&auto=format`}
          alt={article.title}
          className={`w-full object-cover ${ratio}`}
        />
      ) : (
        <div className={`w-full bg-sand ${ratio}`} />
      )}
    </Link>
  )
}

export function SectionHeader({title, href}: {title: string; href: string}) {
  return (
    <div className="flex items-baseline justify-between border-t-4 border-olive pt-3">
      <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-heading">
        {title}
      </h2>
      <Link href={href} className="text-xs uppercase tracking-widest hover:text-heading">
        View all →
      </Link>
    </div>
  )
}

/* One big story, used when only a single story is featured */
export function LeadStory({article}: {article: ArticleCard}) {
  const href = `/articles/${article.slug}`

  return (
    <article className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <Picture article={article} ratio="aspect-[3/2]" />
      </div>
      <div className="lg:col-span-4">
        {article.category && <Label>{article.category}</Label>}
        <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
          <Link
            href={href}
            className="decoration-olive decoration-2 underline-offset-4 hover:underline"
          >
            {article.title}
          </Link>
        </h2>
        {(article.subtitle || article.excerpt) && (
          <p className="mt-4 text-lg leading-snug">{article.subtitle ?? article.excerpt}</p>
        )}
        <Byline article={article} />
        <Link
          href={href}
          className="mt-5 inline-block border-b-2 border-olive pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-heading"
        >
          Read the story →
        </Link>
      </div>
    </article>
  )
}

/* Two featured stories side by side (stacked on phones) */
export function FeaturedPair({articles}: {articles: ArticleCard[]}) {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      {articles.map((article) => {
        const href = `/articles/${article.slug}`

        return (
          <article key={article._id}>
            <Picture article={article} ratio="aspect-[3/2]" />
            <div className="mt-5">
              {article.category && <Label>{article.category}</Label>}
              <h2 className="mt-2 font-display text-3xl font-bold leading-[1.05] lg:text-4xl">
                <Link
                  href={href}
                  className="decoration-olive decoration-2 underline-offset-4 hover:underline"
                >
                  {article.title}
                </Link>
              </h2>
              {(article.subtitle || article.excerpt) && (
                <p className="mt-3 text-lg leading-snug">
                  {article.subtitle ?? article.excerpt}
                </p>
              )}
              <Byline article={article} />
              <Link
                href={href}
                className="mt-4 inline-block border-b-2 border-olive pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-heading"
              >
                Read the story →
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}

/* A regular story card, used in the secondary row, section rails, and category pages */
export function StoryCard({
  article,
  size = 'medium',
}: {
  article: ArticleCard
  size?: 'medium' | 'small'
}) {
  return (
    <article>
      <Picture article={article} ratio="aspect-[4/3]" />
      <div className="mt-4">
        {article.category && <Label>{article.category}</Label>}
        <h3
          className={`mt-1 font-display font-bold leading-tight ${
            size === 'small' ? 'text-lg' : 'text-2xl'
          }`}
        >
          <Link
            href={`/articles/${article.slug}`}
            className="decoration-olive decoration-2 underline-offset-4 hover:underline"
          >
            {article.title}
          </Link>
        </h3>
        {size === 'medium' && article.excerpt && (
          <p className="mt-2 leading-snug">{article.excerpt}</p>
        )}
        <Byline article={article} />
      </div>
    </article>
  )
}