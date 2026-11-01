type Content = {
  id: string
  name: string
  pageTitle: string
  overview: string
  category: string
  type: string
  visibility: string[]
  bodyContent: string
  author: string
  created: string
  updated: string
  path: string
}

type Survey = {
  id: string
  name: string
  description: string
  category: string
  recipients: string[]
  organisationName: string
  created: string
  updated: string
  path: string
}

export async function getContent(): Promise<Content[]> {
  const res = await fetch(
    'https://localhost:44343/umbraco/delivery/api/v2/content'
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch content: ${res.status}`)
  }

  const data = await res.json()

  return data.items
    .filter((item: any) => item.contentType === 'contentPage')
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      pageTitle: item.properties?.pageTitle ?? '',
      overview: item.properties?.overview ?? '',
      category: item.properties?.category ?? '',
      type: item.properties?.type ?? '',
      visibility: item.properties?.visibility ?? [],
      bodyContent: item.properties?.bodyContent?.markup ?? '',
      author: item.properties?.author ?? '',
      created: item.createDate,
      updated: item.updateDate,
      path: item.route?.path ?? '',
    }))
}

export async function getForms(): Promise<Survey[]> {
  const res = await fetch(
    'https://localhost:44343/umbraco/delivery/api/v2/content'
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch forms: ${res.status}`)
  }

  const data = await res.json()

  return data.items
    .filter((item: any) => item.contentType === 'surveyPage')
    .map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.properties?.description ?? '',
      category: item.properties?.category ?? '',
      recipients: item.properties?.recipients ?? [],
      organisationName: item.properties?.organisationName ?? '',
      created: item.createDate,
      updated: item.updateDate,
      path: item.route?.path ?? '',
    }))
}









