import type { GetMapApiResponse, Price, Restaurant, Status } from '@/types/restaurant'
import api from './axios'

export interface GetRestaurantsParams {
  view?: 'list' | 'map'
  status?: Status
  search?: string
  location?: string
  cuisine?: string[]
  price?: Price
  rating?: number
  tags?: string[]
  limit?: number
  cursor?: string | null
}

export type AddRestaurantPayload = Pick<
  Restaurant,
  'name' | 'cuisine' | 'address' | 'price' | 'image' | 'imagePublicId' |
  'status' | 'rating' | 'tags' | 'links' | 'note'
> & {
  location: { coordinates: [number, number] }
}

export interface AddRestaurantResponse {
  success: boolean
  message: string
  data: Restaurant
}

export const addRestaurant = async (
  payload: AddRestaurantPayload,
): Promise<Restaurant> => {
  const response = await api.post<AddRestaurantResponse>('/restaurants/add', payload)
  return response.data.data
}

export type UpdateRestaurantPayload = Partial<AddRestaurantPayload>

export const updateRestaurant = async (
  id: string,
  payload: UpdateRestaurantPayload,
): Promise<Restaurant> => {
  const response = await api.patch<AddRestaurantResponse>(`/restaurants/${id}`, payload)
  return response.data.data
}

export interface LocationSuggestion {
  name: string
  type?: string
  category?: string
  lat: number
  lon: number
  distance_m?: number
  country?: string
  city?: string
  region?: string
}

export interface SearchLocationsResponse {
  success: boolean
  count: number
  suggestions: LocationSuggestion[]
}

export const searchRestaurantLocations = async (
  query: string,
  latitude: number,
  longitude: number,
): Promise<LocationSuggestion[]> => {
  const response = await api.get<SearchLocationsResponse>(
    '/restaurants/search',
    {
      params: {
        q: query,
        lat: latitude,
        lon: longitude,
      },
    },
  )
  return response.data.suggestions
}

export interface UploadImageResponse {
  success: boolean
  message: string
  data: { image: string; imagePublicId: string }
}

export const uploadRestaurantImage = async (file: File) => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await api.post<UploadImageResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data.data
}

export interface GetRestaurantsResponse {
  success: boolean
  count: number
  hasMore?: boolean
  nextCursor?: string | null
  data: Restaurant[]
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface GetNearbyRestaurantsParams extends MapBounds {
  name?: string
  location?: string
  cuisine?: string[]
  price?: Price
  rating?: number
  tags?: string[]
}

export const getRestaurants = async (
  params: GetRestaurantsParams
): Promise<GetRestaurantsResponse> => {
  const response = await api.get<GetRestaurantsResponse>('/restaurants', {
    params: {
      ...params,
      tags: params.tags?.join(','),
      cuisine: params.cuisine?.join(','),
    },
  })

  return response.data
}

export const getMapRestaurants = async (): Promise<Restaurant[]> => {
  const response = await api.get<GetMapApiResponse<Restaurant>>(
    '/restaurants',
    {
      params: { view: 'map' },
    },
  )

  return response.data.data
}

export const getNearbyRestaurants = async (
  params: GetNearbyRestaurantsParams,
): Promise<Restaurant[]> => {
  const response = await api.get<GetMapApiResponse<Restaurant>>(
    '/restaurants/nearby',
    {
      params: {
        ...params,
        tags: params.tags?.join(','),
        cuisine: params.cuisine?.join(','),
      },
    },
  )

  return response.data.data
}

export interface RestaurantFilters {
  tags: string[]
  cuisines: string[]
}

export const getRestaurantFilters = async (): Promise<RestaurantFilters> => {
  const response = await api.get("/restaurants/filters")
  return response.data.data
}

export interface DeleteRestaurantResponse {
  success: boolean
  message: string
}

export const deleteRestaurantApi = async (
  id: string,
): Promise<DeleteRestaurantResponse> => {
  const response = await api.delete<DeleteRestaurantResponse>(
    `/restaurants/${id}`,
  )

  return response.data
}
