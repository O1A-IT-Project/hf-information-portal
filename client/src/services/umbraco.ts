/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Role } from '../App'

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

const FULL_ACCESS_ROLES = ['admin', 'custodian']

function normaliseRole(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

function isVisibleToRole(audiences: string[], activeRole: Role | null) {
  const role = normaliseRole(activeRole ?? 'patient')

  if (FULL_ACCESS_ROLES.includes(role)) {
    return true
  }

  return audiences.some(audience => normaliseRole(audience) === role)
}

export async function getContent(activeRole: Role | null): Promise<Content[]> {
  const params = new URLSearchParams({
    filter: 'contentType:contentPage',
    take: '1000',
  })

  const res = await fetch(
    `https://localhost:8443/umbraco/delivery/api/v2/content?${params}`
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch content: ${res.status}`)
  }

  let data = await res.json()

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
    })).filter((content: Content) =>
    isVisibleToRole(content.visibility, activeRole),
    );
}

export async function getForms(activeRole: Role | null): Promise<Survey[]> {
  const res = await fetch(
    'https://localhost:8443/umbraco/delivery/api/v2/content'
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch forms: ${res.status}`)
  }

  let data = await res.json()

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
    })).filter((survey: Survey) =>
      isVisibleToRole(survey.recipients, activeRole)
    )
}