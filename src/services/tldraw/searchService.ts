interface SearXNGResult {
  title?: string
  url?: string
  content?: string
}

export interface SearchResult {
  title: string;
  url: string;
  content?: string;
}

export class SearchService {
  static async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) {
      return []
    }

    try {
      const searchParams = new URLSearchParams({
        q: query,
        format: 'json',
        language: 'en',
        time_range: 'None',
        safesearch: '0',
        engines: 'google,bing,duckduckgo',
      })

      const url = `${import.meta.env.VITE_SITE_URL}/searxng-api/search?${searchParams.toString()}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`)
      }
      
      const data = await response.json()
      return (data.results || []).map((result: SearXNGResult) => ({
        title: result.title || '',
        url: result.url || '',
        content: result.content || ''
      }))
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  }
} 