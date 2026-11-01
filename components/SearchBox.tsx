'use client'

import {useEffect, useRef, useState} from 'react'
import Form from 'next/form'
import Link from 'next/link'

type Suggestion = {_id: string; title: string; slug: string; category?: string}

export function SearchBox() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState<{q: string; items: Suggestion[]} | null>(null)
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const q = query.trim()

  // Ask for suggestions shortly after the visitor stops typing
  useEffect(() => {
    if (q.length < 2) return

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const items: Suggestion[] = await res.json()
        setData({q, items})
      } catch {
        // Cancelled or network error: ignore
      }
    }, 250)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [q])

  // Close the dropdown when clicking anywhere else
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const showDropdown = open && q.length >= 2 && data?.q === q

  return (
    <div ref={boxRef} className="relative">
      <Form action="/search" onSubmit={() => setOpen(false)}>
        <input
          name="q"
          type="search"
          value={query}
          autoComplete="off"
          placeholder="Search"
          aria-label="Search articles"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
          }}
          className="border-b bg-transparent px-1 py-1 text-sm outline-none"
        />
      </Form>

      {showDropdown && data && (
        <ul className="absolute right-0 z-20 mt-2 w-80 max-w-[90vw] border bg-background text-foreground shadow-lg">
          {data.items.length === 0 ? (
            <li className="px-4 py-3 text-sm">No matches</li>
          ) : (
            <>
              {data.items.map((item) => (
                <li key={item._id}>
                  <Link
                    href={`/articles/${item.slug}`}
                    onClick={() => {
                      setOpen(false)
                      setQuery('')
                    }}
                    className="block px-4 py-3 text-sm hover:bg-foreground/10"
                  >
                    {item.category && (
                      <span className="block text-xs uppercase tracking-widest">
                        {item.category}
                      </span>
                    )}
                    {item.title}
                  </Link>
                </li>
              ))}
              <li className="border-t">
                <Link
                  href={`/search?q=${encodeURIComponent(q)}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-xs uppercase tracking-widest hover:bg-foreground/10"
                >
                  See all results
                </Link>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  )
}