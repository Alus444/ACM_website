export type ProductDocPreset = {
  id: string
  name: string
  appearance: string
  use: string
  comparisonImage?: string
  sourceImage?: string
  alt?: string
  sourceAlt?: string
  caption?: string
}

export type ProductDocParameter = {
  id: string
  groupId: string
  label: string
  labelEn?: string
  range: string
  defaultValue: string
  role: string
  condition?: string
  related?: string
  guide?: string
  note?: string
  scopeLabel?: string
  mode?: string
}

export type ProductDocGlossaryTerm = {
  id: string
  term: string
  termEn?: string
  description: string
  keywords: string[]
}

export type ProductDocIssue = {
  id: string
  question: string
  answer: string
  keywords: string[]
}

export type ProductDocReleaseSection = {
  title: string
  items: string[]
}

export type ProductDocRelease = {
  version: string
  title: string
  publishedAt?: string
  summary?: string
  sections?: ProductDocReleaseSection[]
}

export const presets: ProductDocPreset[] = []
export const parameters: ProductDocParameter[] = []
export const glossaryTerms: ProductDocGlossaryTerm[] = []
export const issues: ProductDocIssue[] = []
export const releases: ProductDocRelease[] = []
