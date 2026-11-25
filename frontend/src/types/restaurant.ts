export type Price = 'budget' | 'moderate' | 'expensive'
export type Status = 'been' | 'want_to_try'

export interface Restaurant {
  _id: string
  userId: string
  name: string
  cuisine: string
  address: string
  location: { type: 'Point'; coordinates: [number, number] }
  price: Price
  image: string
  imagePublicId: string
  status: Status
  rating?: number | null
  tags: string[]
  links: string[]
  note: string
  createdAt: string
  updatedAt: string
}

export interface MapRestaurant {
  _id: string
  name: string
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  status: Status
  rating?: number
}

export interface GetMapApiResponse<T = Restaurant> {
  success: boolean
  count: number
  hasMore?: boolean
  nextCursor?: string | null
  data: T[]
}