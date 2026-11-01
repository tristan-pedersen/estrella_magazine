import {Suspense} from 'react'
import {getHomepage} from '@/sanity/lib/articles'
import {LeadStory, SectionHeader, StoryCard} from '@/components/stories'

async function HomepageContent() {
  const {lead, latest, sections} = await getHomepage()

  if (!lead) {
    return <p className="py-10">No articles published yet.</p>
  }

  const secondary = latest.filter((a) => a._id !== lead._id).slice(0, 3)
  const visibleSections = sections.filter((s) => s.articles.length > 0)

  return (
    <>
      <LeadStory article={lead} />

      {secondary.length > 0 && (
        <div className="mt-12 grid gap-8 border-t border-olive pt-10 sm:grid-cols-3">
          {secondary.map((article) => (
            <StoryCard key={article._id} article={article} />
          ))}
        </div>
      )}

      {visibleSections.map((section) => (
        <section key={section.slug} className="mt-16">
          <SectionHeader title={section.title} href={`/category/${section.slug}`} />
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {section.articles.map((article) => (
              <StoryCard key={article._id} article={article} size="small" />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Suspense fallback={<p>Loading…</p>}>
        <HomepageContent />
      </Suspense>
    </main>
  )
}