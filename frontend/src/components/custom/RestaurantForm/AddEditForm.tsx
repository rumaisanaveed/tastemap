import { uploadRestaurantImage, addRestaurant, updateRestaurant, searchRestaurantLocations, type LocationSuggestion } from "@/api/restaurantApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurants } from "@/context/RestaurantContext";
import { RATINGS, PRICES, PRICE_FILTER_LABEL } from "@/data/constants";
import { DEFAULT_CENTER } from "@/lib/map";
import { Price, Restaurant, Status } from "@/types/restaurant";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import { ImagePlus, LoaderCircle, Search } from "lucide-react";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import LocationPicker from "../LocationPicker";
import OptionGroup from "../OptionGroup";
import RestaurantImage from "../RestaurantImage";
import { buildUpdatePayload } from "./helpers";
import MultiValueInput from "./MultiValueInput";

const Content = {
  add: ['Add restaurant', 'Save a place you have been to, or one you want to try.'],
  edit: ['Edit restaurant', 'Update any of the details below.'],
  rank: ['Mark as ranked', 'Add your rating to move this restaurant into your ranked list.'],
}

interface Props { mode: 'add' | 'edit' | 'rank'; restaurant?: Restaurant }

function AddEditForm({ mode, restaurant }: Props) {
  const { saveRestaurant, closeForm } = useRestaurants()
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [name, setName] = useState(restaurant?.name ?? '')
  const [cuisine, setCuisine] = useState(restaurant?.cuisine ?? '')
  const [address, setAddress] = useState(restaurant?.address ?? '')
  const [coords, setCoords] = useState<[number, number]>(restaurant?.location.coordinates ?? DEFAULT_CENTER)
  const [price, setPrice] = useState<Price>(restaurant?.price ?? 'moderate')
  const [status, setStatus] = useState<Status>(mode === 'rank' ? 'been' : restaurant?.status ?? 'want_to_try')
  const [rating, setRating] = useState<number | null>(restaurant?.rating ?? null)
  const [image, setImage] = useState(restaurant?.image ?? '')
  const [imagePublicId, setImagePublicId] = useState(restaurant?.imagePublicId ?? '')
  const [tags, setTags] = useState<string[]>(restaurant?.tags ?? [])
  const [links, setLinks] = useState<string[]>(restaurant?.links ?? [])
  const [note, setNote] = useState(restaurant?.note ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [locationSearchLoading, setLocationSearchLoading] = useState(false)
  const [locationSearchError, setLocationSearchError] = useState('')

  useEffect(() => {
    const query = locationQuery.trim()
    if (query.length < 2) {
      setLocationSuggestions([])
      setLocationSearchLoading(false)
      setLocationSearchError('')
      return
    }

    setLocationSuggestions([])
    setLocationSearchLoading(true)
    setLocationSearchError('')
    let active = true
    const timeout = window.setTimeout(async () => {
      try {
        const results = await searchRestaurantLocations(query, coords[1], coords[0])
        if (active) setLocationSuggestions(results.slice(0, 5))
      } catch (error) {
        if (!active) return
        const responseMessage = (error as { response?: { data?: { message?: string } } })
          .response?.data?.message
        setLocationSuggestions([])
        setLocationSearchError(responseMessage || 'Unable to search locations. Please try again.')
      } finally {
        if (active) setLocationSearchLoading(false)
      }
    }, 350)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [locationQuery, coords])

  const clearError = (field: string) => {
    setErrors((current) => {
      if (!current[field] && !current.submit) return current
      const next = { ...current }
      delete next[field]
      delete next.submit
      return next
    })
  }

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/webp', 'image/jpeg', 'image/png']
    const allowedExtensions = /\.(webp|jpe?g|png)$/i
    if (!allowedTypes.includes(file.type) || !allowedExtensions.test(file.name)) {
      setErrors((current) => ({ ...current, image: 'Choose a WEBP, JPG, JPEG, or PNG image.' }))
      e.target.value = ''
      return
    }

    clearError('image')
    setUploadingImage(true)
    try {
      const uploaded = await uploadRestaurantImage(file)
      setImage(uploaded.image)
      setImagePublicId(uploaded.imagePublicId)
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message
      setErrors((current) => ({ ...current, image: responseMessage || 'Unable to upload image. Please try again.' }))
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (!name.trim()) err.name = 'Name is required'
    if (!cuisine.trim()) err.cuisine = 'Cuisine is required'
    if (!address.trim()) err.address = 'Address is required'
    if (status === 'been' && !rating) err.rating = 'Pick a rating from 1 to 5'
    setErrors(err)
    if (Object.keys(err).length) return
    setSaving(true)
    const cleanedTags = tags.map((tag) => tag.trim()).filter(Boolean)
    const cleanedLinks = links.map((link) => link.trim()).filter(Boolean)

    try {
      if (mode === 'add') {
        const created = await addRestaurant({
          name: name.trim(),
          cuisine: cuisine.trim(),
          address: address.trim(),
          location: { coordinates: coords },
          price,
          image,
          imagePublicId,
          status,
          rating: status === 'been' ? rating ?? undefined : undefined,
          tags: cleanedTags,
          links: cleanedLinks,
          note: note.trim(),
        })
        saveRestaurant(created)
      } else {
        if (!restaurant) throw new Error('Restaurant details are missing.')

        const payload = buildUpdatePayload(restaurant, {
          name,
          cuisine,
          address,
          coords,
          price,
          image,
          imagePublicId,
          tags: cleanedTags,
          links: cleanedLinks,
          note,
          rating,
          status,
          mode,
        })

        if (!Object.keys(payload).length) {
          closeForm()
          return
        }

        const updated = await updateRestaurant(restaurant._id, payload)
        saveRestaurant(updated)
      }
    } catch (error) {
      const responseMessage = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message
      setErrors({ submit: responseMessage || `Unable to ${mode === 'add' ? 'add' : 'update'} restaurant. Please try again.` })
    } finally {
      setSaving(false)
    }
  }

  const selectSuggestion = (suggestion : LocationSuggestion) => {
    const placeAddress = [suggestion.city, suggestion.region, suggestion.country]
      .filter(Boolean)
      .join(', ')
    setAddress(placeAddress || suggestion.name)
    setCoords([suggestion.lon, suggestion.lat])
    setLocationQuery('')
    setLocationSuggestions([])
    setLocationSearchError('')
    clearError('address')
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p role="alert" className="mt-1 text-[13px] font-medium text-destructive">{errors[k]}</p> : null)

  return (
    <form onSubmit={onSubmit} className="space-y-5 p-6 md:p-9">
      <div>
        <DialogTitle className="text-display text-[34px]">{Content[mode][0]}</DialogTitle>
        <DialogDescription className="meta mt-1">{Content[mode][1]}</DialogDescription>
      </div>
      {mode === "add" && (
        <div>
          <Label>Status</Label>
          <OptionGroup 
            label="Status" 
            value={[status]} onChange={([v]) => { 
              setStatus(v); 
              if (v !== 'been') clearError('rating') 
            }} 
            options={[{ value: 'been' as Status, label: 'Ranked' }, { value: 'want_to_try' as Status, label: 'Want to try' }]} 
          />
      </div>
      )}
      {status === 'been' && (
        <div className="rounded-2xl bg-sage p-4">
          <Label>Rating</Label>
          <OptionGroup 
            label="Rating" 
            value={rating ? [rating] : []} 
            onChange={([v]) => { setRating(v ?? null); if (v) clearError('rating') }} 
            options={RATINGS.map((n) => ({ value: n, label: String(n) }))} 
          />
          <Err k="rating" />
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) clearError('name') }} /><Err k="name" /></div>
        <div><Label htmlFor="cuisine">Cuisine</Label><Input id="cuisine" value={cuisine} onChange={(e) => { setCuisine(e.target.value); if (e.target.value.trim()) clearError('cuisine') }} /><Err k="cuisine" /></div>
        <div className="md:col-span-2"><Label htmlFor="address">Address</Label><Input id="address" value={address} onChange={(e) => { setAddress(e.target.value); if (e.target.value.trim()) clearError('address') }} /><Err k="address" /></div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location-search">Search for a location</Label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="location-search"
            value={locationQuery}
            onChange={(event) => setLocationQuery(event.target.value)}
            placeholder="Search an address or place"
            autoComplete="off"
            role="combobox"
            aria-expanded={locationSuggestions.length > 0}
            aria-controls="location-suggestions"
            aria-autocomplete="list"
            className="pl-9 pr-10"
          />
          {locationSearchLoading && <LoaderCircle aria-label="Searching locations" className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
          {locationSuggestions.length > 0 && (
            <ul id="location-suggestions" role="listbox" className="absolute z-[1000] mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-background p-1 shadow-lg">
              {locationSuggestions.map((suggestion) => (
                <li key={`${suggestion.name}-${suggestion.lat}-${suggestion.lon}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                    disabled={locationSearchLoading}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span className="block font-medium">{suggestion.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {[
                        [suggestion.city, suggestion.region].filter(Boolean).join(', '),
                        suggestion.distance_m != null ? `${suggestion.distance_m} m away` : '',
                      ].filter(Boolean).join(' · ')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {locationSearchError && <p role="alert" className="text-[13px] text-destructive">{locationSearchError}</p>}
        {!locationSearchLoading && !locationSearchError && locationQuery.trim().length >= 2 && locationSuggestions.length === 0 && (
          <p className="text-[13px] text-muted-foreground">No locations found.</p>
        )}
        <Label>Location (click the map or drag the pin)</Label>
        <LocationPicker value={coords} onChange={setCoords} />
      </div>
      <div>
        <Label>Price</Label>
        <OptionGroup label="Price" value={[price]} onChange={([v]) => setPrice(v)} options={PRICES.map((p) => ({ value: p, label: PRICE_FILTER_LABEL[p] }))} />
      </div>
      <div>
        <Label>Image</Label>
        <div className="flex items-center gap-4">
          <RestaurantImage name={name || 'New restaurant'} image={image} className="size-20 shrink-0 rounded-2xl" />
          <Button asChild variant="outline" className="h-20 flex-1 border-dashed" disabled={uploadingImage}>
            <label className="cursor-pointer"><ImagePlus /> {uploadingImage ? 'Uploading image…' : image ? 'Replace image' : 'Upload image'}<input type="file" accept=".webp,.jpg,.jpeg,.png,image/webp,image/jpeg,image/png" className="sr-only" onChange={onFileChange} disabled={uploadingImage} /></label>
          </Button>
        </div>
        <Err k="image" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MultiValueInput
          label="Tags (optional)"
          values={tags}
          onChange={setTags}
          placeholder="Type a tag and press Enter"
        />

        <MultiValueInput
          label="Links (optional)"
          values={links}
          onChange={setLinks}
          placeholder="Paste a link and press Enter"
          type="url"
        />
      </div>
      <div><Label htmlFor="note">Note</Label><Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      {errors.submit && <p role="alert" className="text-[13px] font-medium text-destructive">{errors.submit}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
        <Button type="submit" disabled={saving || uploadingImage}>{saving ? 'Saving…' : mode === 'rank' ? 'Save as ranked' : 'Save restaurant'}</Button>
      </div>
    </form>
  )
}

export default AddEditForm;
