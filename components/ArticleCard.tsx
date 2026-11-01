import type {ArticleCard as ArticleCardData} from '@/sanity/lib/articles'
import {StoryCard} from '@/components/stories'

export function ArticleCard({article}: {article: ArticleCardData}) {
  return <StoryCard article={article} />
}