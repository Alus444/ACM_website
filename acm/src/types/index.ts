export interface Work {
  id: string
  title: string
  description: string
  imageUrl: string
  tags: string[]
  year: number
  software?: string[]
}

export interface BoothItem {
  id: string
  title: string
  description: string
  imageUrl: string
  price: number
  boothUrl: string
  category: string
  tags?: string[]
}

export interface PriceOption {
  label: string
  price: string
  note?: string
}

export interface PriceCategory {
  name: string
  options: PriceOption[]
  notes?: string[]
  contactLink?: boolean
}

export interface Movie {
  youtubeId: string
  title: string
  description?: string
  year?: number
  tags?: string[]
}

export interface Profile {
  name: string
  handle: string
  avatarUrl?: string
  bio: string
  skills: string[]
  social: {
    twitter?: string
    pixiv?: string
    booth?: string
    github?: string
  }
}
