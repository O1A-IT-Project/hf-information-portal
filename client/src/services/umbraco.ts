export type Post = {
  id: string

  title: string

  body?: string

  contentType: string

  createDate?: string
  updateDate?: string

  route?: {
    path: string
  }

  properties: Record<string, unknown>
}

type UmbracoApiItem = {
  id: string

  name: string

  contentType: string

  createDate?: string
  updateDate?: string

  route?: {
    path: string
  }

  properties: {
    pageTitle?: string
    overview?: string
    [key: string]: unknown
  }
}

type UmbracoApiResponse = {
  items: UmbracoApiItem[]
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

// ---- Mock data, used only when VITE_USE_MOCK_DATA=true ----
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Understanding Heart Failure',
    body: 'An introduction to heart failure symptoms and causes.',
    contentType: 'conditionPage',
    createDate: '2025-03-14',
    updateDate: '2025-03-14',
    route: { path: '/understanding-heart-failure' },
    properties: { pageTitle: 'Understanding Heart Failure', overview: 'An introduction to heart failure symptoms and causes.' },
  },
  {
    id: '2',
    title: 'New Treatment Guidelines',
    body: 'Updated clinical guidelines released this year.',
    contentType: 'newsPage',
    createDate: '2024-11-02',
    updateDate: '2024-11-02',
    route: { path: '/new-treatment-guidelines' },
    properties: { pageTitle: 'New Treatment Guidelines', overview: 'Updated clinical guidelines released this year.' },
  },
  {
    id: '3',
    title: 'Living Well with Heart Failure',
    body: 'A patient guide video series.',
    contentType: 'videoPage',
    createDate: '2023-06-20',
    updateDate: '2023-06-20',
    route: { path: '/living-well' },
    properties: { pageTitle: 'Living Well with Heart Failure', overview: 'A patient guide video series.' },
  },
  {
    id: '4',
    title: 'Medication Overview',
    body: 'A breakdown of common heart failure medications.',
    contentType: 'contentPage',
    createDate: '2023-01-05',
    updateDate: '2023-01-05',
    route: { path: '/medication-overview' },
    properties: { pageTitle: 'Medication Overview', overview: 'A breakdown of common heart failure medications.' },
  },
  {
    id: '5',
    title: 'Annual Report 2022',
    body: 'Yearly summary of clinical outcomes.',
    contentType: 'newsPage',
    createDate: '2022-12-01',
    updateDate: '2022-12-01',
    route: { path: '/annual-report-2022' },
    properties: { pageTitle: 'Annual Report 2022', overview: 'Yearly summary of clinical outcomes.' },
  },
  {
    id: '6',
    title: 'Archived Research Notes',
    body: 'Older material with no recorded date.',
    contentType: 'contentPage',
    createDate: undefined,
    updateDate: undefined,
    route: { path: '/archived-notes' },
    properties: { pageTitle: 'Archived Research Notes', overview: 'Older material with no recorded date.' },
  },
]

const getMockPosts = async (): Promise<Post[]> => {
  // Simulate network latency so loading states are visible during testing
  await new Promise(resolve => setTimeout(resolve, 400))

  return mockPosts
}

const getRealPosts = async (): Promise<Post[]> => {
  const res = await fetch('/umbraco/delivery/api/v2/content')

  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }

  const data: UmbracoApiResponse = await res.json()

  return data.items
    .filter(item => item.route?.path && item.route.path !== '/')
    .map(item => ({
      id: item.id,

      title: item.properties?.pageTitle || item.name,

      body: item.properties?.overview || '',

      route: item.route,

      contentType: item.contentType,

      properties: item.properties,

      createDate: item.createDate,

      updateDate: item.updateDate,
    }))
}

export async function getPosts(): Promise<Post[]> {
  if (USE_MOCK_DATA) {
    return getMockPosts()
  }

  return getRealPosts()
}

export async function getContentBySlug(slug: string) {
  const cleanedSlug = slug.startsWith('/') ? slug.substring(1) : slug

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300))

    const match = mockPosts.find(post => post.route?.path?.replace(/^\//, '') === cleanedSlug)

    if (!match) {
      throw new Error('Failed to fetch content')
    }

    return match
  }

  const res = await fetch(`/umbraco/delivery/api/v2/content/item/${cleanedSlug}`)

  if (!res.ok) {
    throw new Error('Failed to fetch content')
  }

  const data = await res.json()

  return data
}