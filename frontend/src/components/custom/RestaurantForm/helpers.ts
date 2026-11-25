import { UpdateRestaurantPayload } from "@/api/restaurantApi"
import { Price, Restaurant, Status } from "@/types/restaurant"

type UpdateFormValues = {
  name: string
  cuisine: string
  address: string
  coords: [number, number]
  price: Price
  image: string
  imagePublicId: string
  tags: string[]
  links: string[]
  note: string
  rating: number | null
  status: Status
  mode: 'edit' | 'rank'
}

export function buildUpdatePayload(
  restaurant: Restaurant,
  values: UpdateFormValues,
): UpdateRestaurantPayload {
  const {
    name,
    cuisine,
    address,
    coords,
    price,
    image,
    imagePublicId,
    tags,
    links,
    note,
    rating,
    status,
    mode,
  } = values

  const payload: UpdateRestaurantPayload = {}

  if (name.trim() !== restaurant.name) payload.name = name.trim()
  if (cuisine.trim() !== restaurant.cuisine) payload.cuisine = cuisine.trim()
  if (address.trim() !== restaurant.address) payload.address = address.trim()

  const locationChanged =
    coords[0] !== restaurant.location.coordinates[0] ||
    coords[1] !== restaurant.location.coordinates[1]

  if (address.trim() !== restaurant.address || locationChanged) {
    payload.location = { coordinates: coords }
  }

  if (price !== restaurant.price) payload.price = price
  if (image !== restaurant.image) payload.image = image
  if (imagePublicId !== restaurant.imagePublicId) {
    payload.imagePublicId = imagePublicId
  }

  if (JSON.stringify(tags) !== JSON.stringify(restaurant.tags ?? [])) {
    payload.tags = tags
  }

  if (JSON.stringify(links) !== JSON.stringify(restaurant.links ?? [])) {
    payload.links = links
  }

  if (note.trim() !== (restaurant.note ?? '')) {
    payload.note = note.trim()
  }

  if (mode === 'rank') {
    payload.status = 'been'
    payload.rating = rating!
  } else if (rating !== restaurant.rating && status === 'been') {
    payload.rating = rating ?? null
  }

  return payload
}