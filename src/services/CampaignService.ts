import { z } from 'zod'

import { fetchWithAuth } from '@/helpers/lib/lib'

const searchResult = z.object({
  id: z.string(),
  name: z.string(),
  image_url: z.string(),
  type: z.enum(['song', 'artist'])
})
const searchResults = z.array(searchResult)
type SearchResult = z.infer<typeof searchResult>

export const getSearchResults = (query: string) => {
  return {
    queryKey: ['search', 'tabs', query],
    queryFn: async (): Promise<SearchResult[]> => {
      return fetchWithAuth<SearchResult[]>(`/search?query=${query}`, searchResults)
    }
  }
}
