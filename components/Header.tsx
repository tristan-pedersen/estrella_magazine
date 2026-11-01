import Link from 'next/link'
import {getCategories} from '@/sanity/lib/articles'

export async function Header() {
  const categories = await getCategories()

  return (
    <header className="border-b px-6 py-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-4">
        <Link href="/" className="text-2xl font-bold">
          Estrella Magazine
        </Link>
        <nav className="flex gap-6 text-sm uppercase tracking-widest">
          {categories.map((c) => (
            <Link key={c._id} href={`/category/${c.slug}`}>
              {c.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}