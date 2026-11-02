import Link from 'next/link'
import {getCategories} from '@/sanity/lib/articles'
import {SearchBox} from '@/components/SearchBox'

export async function Header() {
  const categories = await getCategories()

  return (
    <>
      <div className="h-2 bg-sand" />
      <header className="border-b border-olive px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          {/* When your logo arrives, replace this text link with an <Image> */}
          <Link
            href="/"
            className="font-display text-3xl font-semibold uppercase tracking-tight text-heading [word-spacing:0.2em]"
          >
            ESTRELLA MAGAZINE
          </Link>

          <nav className="flex flex-wrap gap-6 text-sm uppercase tracking-widest">
            {categories.map((c) => (
              <Link key={c._id} href={`/category/${c.slug}`} className="hover:text-heading">
                {c.title}
              </Link>
            ))}
          </nav>

          <SearchBox />
        </div>
      </header>
    </>
  )
}