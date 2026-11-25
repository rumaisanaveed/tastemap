import type { GetRestaurantsParams, MapBounds } from '@/api/restaurantApi'
import { deleteRestaurantApi, getNearbyRestaurants, getRestaurantFilters, getRestaurants } from '@/api/restaurantApi'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { Price, Restaurant } from '@/types/restaurant'
import { toLatLng } from '@/utils/restaurant'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type Tab = 'ranked' | 'want'

export interface Filters {
  price: Price | null
  rating: number | null
  tags: string[],
  cuisine : string[]
}

export type FormState =
  | { mode: 'add' | 'edit' | 'rank'; restaurant?: Restaurant }
  | null

export interface PaginatedRestaurants {
  items: Restaurant[]
  nextCursor: string | null
  hasMore: boolean
  loading: boolean
  error: string | null
  queryKey: string
}

export interface MapFocus {
  id: string
  coordinates: [number, number]
}

export const emptyFilters: Filters = {
  price: null,
  rating: null,
  tags: [],
  cuisine : [],
}

const initialPagination: PaginatedRestaurants = {
  items: [],
  nextCursor: null,
  hasMore: true,
  loading: false,
  error: null,
  queryKey: '',
}

export const RESTAURANT_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

const STATUS_BY_TAB = {
  ranked: 'been',
  want: 'want_to_try',
} as const

function mergeUnique(existing: Restaurant[], incoming: Restaurant[]) {
  const ids = new Set(existing.map((item) => item._id))

  return [
    ...existing,
    ...incoming.filter((item) => {
      if (ids.has(item._id)) return false

      ids.add(item._id)
      return true
    }),
  ]
}

interface RestaurantCtx {
  ranked: Restaurant[]
  wishlist: Restaurant[]
  rankedPagination: PaginatedRestaurants
  wishlistPagination: PaginatedRestaurants

  mapRestaurants: Restaurant[]
  mapFocus: MapFocus | null
  fetchNearbyRestaurants: (bounds: MapBounds) => Promise<void>

  tab: Tab
  setTab: (tab: Tab) => void
  loadMore: () => Promise<void>

  search: string
  setSearch: (search: string) => void
  filters: Filters
  setFilters: (filters: Filters) => void
  activeFilterCount: number
  availableTags: string[]
  availableCuisines: string[]

  filterOpen: boolean
  setFilterOpen: (open: boolean) => void
  selectedId: string | null
  selectRestaurant: (restaurant: Restaurant) => void
  details: Restaurant | null
  closeDetails: () => void

  form: FormState
  openForm: (mode: 'add' | 'edit' | 'rank', restaurant?: Restaurant) => void
  closeForm: () => void
  saveRestaurant: (restaurant: Restaurant) => void
  deleteRestaurant: (id: string) => void
  handleDeleteRestaurant: (id: string) => Promise<void>
}

const RestaurantsContext = createContext<RestaurantCtx | null>(null)

export function RestaurantProvider({
  children,
}: {
  children: ReactNode
}) {
  const [rankedPagination, setRankedPagination] =
    useState<PaginatedRestaurants>(initialPagination)

  const [wishlistPagination, setWishlistPagination] =
    useState<PaginatedRestaurants>(initialPagination)

  const [mapRestaurants, setMapRestaurants] = useState<Restaurant[]>([])
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null)

  const [tab, setTab] = useState<Tab>('ranked')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [filterOpen, setFilterOpen] = useState(false)

  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([])

  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [form, setForm] = useState<FormState>(null)

  const debouncedSearch = useDebouncedValue(
    search.trim(),
    SEARCH_DEBOUNCE_MS,
  )

  const paginationRef = useRef<Record<Tab, PaginatedRestaurants>>({
    ranked: initialPagination,
    want: initialPagination,
  })

  const tabRef = useRef(tab)
  tabRef.current = tab

  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const requestIds = useRef<Record<Tab, number>>({
    ranked: 0,
    want: 0,
  })

  const setPagination = useCallback(
    (
      targetTab: Tab,
      updater: (prev: PaginatedRestaurants) => PaginatedRestaurants,
    ) => {
      const next = updater(paginationRef.current[targetTab])

      paginationRef.current[targetTab] = next

      if (targetTab === 'ranked') {
        setRankedPagination(next)
      } else {
        setWishlistPagination(next)
      }
    },
    [],
  )

  // ---------------------------------------------------------------------------
  // List query
  // ---------------------------------------------------------------------------

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        search: debouncedSearch,
        price: filters.price,
        rating: filters.rating,
        tags: filters.tags,
        cuisine : filters.cuisine
      }),
    [debouncedSearch, filters],
  )

  const fetchPage = useCallback(
    async (targetTab: Tab, reset = false) => {
      const current = paginationRef.current[targetTab]

      if (!reset && (current.loading || !current.hasMore)) return

      const requestId = ++requestIds.current[targetTab]

      setPagination(targetTab, (prev) => ({
        ...prev,
        loading: true,
        error: null,
        ...(reset ? { queryKey } : {}),
      }))

      const params: GetRestaurantsParams = {
        view: 'list',
        status: STATUS_BY_TAB[targetTab],
        limit: RESTAURANT_PAGE_SIZE,
        search: debouncedSearch || undefined,
        price: filters.price ?? undefined,
        rating: filters.rating ?? undefined,
        tags: filters.tags.length ? filters.tags : undefined,
        cuisine: filters.cuisine.length ? filters.cuisine : undefined,
        cursor: reset ? undefined : current.nextCursor,
      }

      try {
        const response = await getRestaurants(params)

        if (requestIds.current[targetTab] !== requestId) return

        setPagination(targetTab, (prev) => ({
          ...prev,
          items: reset
            ? response.data
            : mergeUnique(prev.items, response.data),
          nextCursor: response.nextCursor ?? null,
          hasMore: response.hasMore ?? false,
          loading: false,
          error: null,
        }))
      } catch (error) {
        if (requestIds.current[targetTab] !== requestId) return

        console.error('Failed to fetch restaurants:', error)

        setPagination(targetTab, (prev) => ({
          ...prev,
          loading: false,
          error: 'Unable to load restaurants. Please try again.',
        }))
      }
    },
    [
      setPagination,
      queryKey,
      debouncedSearch,
      filters,
    ],
  )

  useEffect(() => {
    // if query key is same, don't fetch
    if (paginationRef.current[tab].queryKey === queryKey) return

    void fetchPage(tab, true)
  }, [tab, queryKey, fetchPage])

  const loadMore = useCallback(
    () => fetchPage(tab),
    [tab, fetchPage],
  )

  const invalidateListQueries = useCallback(() => {
    requestIds.current.ranked += 1
    requestIds.current.want += 1

    ;(['ranked', 'want'] as Tab[]).forEach((targetTab) => {
      setPagination(targetTab, (prev) => ({
        ...prev,
        queryKey: '',
        nextCursor: null,
        hasMore: true,
        loading: false,
        error: null,
      }))
    })
  }, [setPagination])

  // ---------------------------------------------------------------------------
  // Map focus
  // ---------------------------------------------------------------------------

  const focusSeq = useRef(0)

  const focusOn = useCallback((restaurant: Restaurant) => {
    setMapFocus({
      id: `${restaurant._id}:${++focusSeq.current}`,
      coordinates: toLatLng(restaurant),
    })
  }, [])

  // ---------------------------------------------------------------------------
  // Nearby map restaurants
  // ---------------------------------------------------------------------------

  const mapRequestId = useRef(0)
  const mapBoundsRef = useRef<MapBounds | null>(null)

  const fetchNearbyRestaurants = useCallback(
    async (bounds: MapBounds) => {
      mapBoundsRef.current = bounds

      const requestId = ++mapRequestId.current

      try {
        const data = await getNearbyRestaurants({
          ...bounds,
          price: filters.price ?? undefined,
          rating: filters.rating ?? undefined,
          tags: filters.tags.length ? filters.tags : undefined,
          cuisine: filters.cuisine.length ? filters.cuisine : undefined,
        })

        if (requestId !== mapRequestId.current) return

        setMapRestaurants(data)
      } catch (error) {
        if (requestId !== mapRequestId.current) return

        console.error('Failed to fetch nearby restaurants:', error)
      }
    },
    [filters],
  )

  const refreshMapRestaurants = useCallback(() => {
      mapRequestId.current += 1

      const bounds = mapBoundsRef.current

      if (bounds) {
        void fetchNearbyRestaurants(bounds)
      } else {
        setMapRestaurants([])
      }
  }, [fetchNearbyRestaurants])

  // ---------------------------------------------------------------------------
  // Search and move the map
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!debouncedSearch) return

    let active = true

    void (async () => {
      try {
        const currentFilters = filtersRef.current
        const currentTab = tabRef.current

        const searchFilters = {
          price: currentFilters.price ?? undefined,
          rating: currentFilters.rating ?? undefined,
          tags: currentFilters.tags.length ? currentFilters.tags : undefined,
          cuisine: currentFilters.cuisine.length ? currentFilters.cuisine : undefined,
        }

        // search calls both list apis and moves the map to the fetched result
        const [rankedResponse, wishlistResponse] = await Promise.all([
          getRestaurants({
            view: 'list',
            status: 'been',
            search: debouncedSearch,
            limit: 1,
            ...searchFilters,
          }),
          getRestaurants({
            view: 'list',
            status: 'want_to_try',
            search: debouncedSearch,
            limit: 1,
            ...searchFilters,
          }),
        ])

        if (!active) return

        // if the user is currently on the tab other than where the restaurants are present, then
        // we switch the tab accordingly
        const otherTab: Tab = currentTab === 'ranked' ? 'want' : 'ranked'
        const responses = { ranked: rankedResponse, want: wishlistResponse }

        const targetTab: Tab | null =
          responses[currentTab].data.length > 0
            ? currentTab
            : responses[otherTab].data.length > 0
              ? otherTab
              : null

        if (!targetTab) {
          setSelected(null)
          setDetailsOpen(false)
          return
        }

        const restaurant = responses[targetTab].data[0]

        if (targetTab !== currentTab) setTab(targetTab)

        setSelected(restaurant)
        setDetailsOpen(false)
        focusOn(restaurant)
      } catch (error) {
        if (active) console.error('Failed to search restaurants:', error)
      }
    })()

    return () => {
      active = false
    }
  }, [debouncedSearch, focusOn])

  // fetch filters
  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await getRestaurantFilters()
      setAvailableTags(options.tags)
      setAvailableCuisines(options.cuisines)
    } catch (error) {
      console.error('Failed to fetch restaurant filter options:', error)
    }
  }, [])

  useEffect(() => {
    void fetchFilterOptions()
  }, [fetchFilterOptions])

  // ---------------------------------------------------------------------------
  // Selection and details
  // ---------------------------------------------------------------------------

  const selectRestaurant = useCallback(
    (restaurant: Restaurant) => {
      setSelected(restaurant)
      setDetailsOpen(true)
      focusOn(restaurant)
    },
    [focusOn],
  )

  const closeDetails = useCallback(() => {
    setDetailsOpen(false)
  }, [])

  // ---------------------------------------------------------------------------
  // Forms
  // ---------------------------------------------------------------------------

  const openForm = useCallback(
    (
      mode: 'add' | 'edit' | 'rank',
      restaurant?: Restaurant,
    ) => {
      setDetailsOpen(false)
      setForm({ mode, restaurant })
    },
    [],
  )

  const closeForm = useCallback(() => {
    setForm(null)
  }, [])

  // ---------------------------------------------------------------------------
  // Save and delete
  // ---------------------------------------------------------------------------

  const saveRestaurant = useCallback(
    (restaurant: Restaurant) => {
      const targetTab: Tab =
        restaurant.status === 'been' ? 'ranked' : 'want'

      invalidateListQueries()

      setMapRestaurants((prev) =>
        prev.filter((item) => item._id !== restaurant._id),
      )

      refreshMapRestaurants()

      setSelected(restaurant)
      setTab(targetTab)
      setForm(null)

      void fetchPage(targetTab, true)
    },
    [invalidateListQueries, refreshMapRestaurants, fetchPage],
  )

  const deleteRestaurant = useCallback(
    (id: string) => {
      invalidateListQueries()
      setPagination('ranked', (prev) => ({
        ...prev,
        items: prev.items.filter((item) => item._id !== id),
      }))
      setPagination('want', (prev) => ({
        ...prev,
        items: prev.items.filter((item) => item._id !== id),
      }))
      setMapRestaurants((prev) =>
        prev.filter((item) => item._id !== id),
      )
      refreshMapRestaurants()
      setSelected((current) =>
        current?._id === id ? null : current,
      )
      setDetailsOpen(false)
      void fetchPage(tab, true)
    },
    [
      invalidateListQueries,
      setPagination,
      refreshMapRestaurants,
      fetchPage,
      tab
    ],
  )

  const handleDeleteRestaurant = useCallback(
    async (id: string) => {
      await deleteRestaurantApi(id)

      deleteRestaurant(id)
    },
    [deleteRestaurant],
)

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const ranked = rankedPagination.items
  const wishlist = wishlistPagination.items

  const activeFilterCount =
    (filters.price !== null ? 1 : 0) +
    filters.tags.length +
    filters.cuisine.length +
    (filters.rating !== null ? 1 : 0)

  const selectedId = selected?._id ?? null
  const details = detailsOpen ? selected : null

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------

  const value = useMemo<RestaurantCtx>(
    () => ({
      ranked,
      wishlist,
      rankedPagination,
      wishlistPagination,

      mapRestaurants,
      mapFocus,
      fetchNearbyRestaurants,

      tab,
      setTab,
      loadMore,

      search,
      setSearch,
      filters,
      setFilters,
      activeFilterCount,
      availableTags,
      availableCuisines,

      filterOpen,
      setFilterOpen,
      selectedId,
      selectRestaurant,
      details,
      closeDetails,

      form,
      openForm,
      closeForm,
      saveRestaurant,
      deleteRestaurant,
      handleDeleteRestaurant,
    }),
    [
      ranked,
      wishlist,
      rankedPagination,
      wishlistPagination,
      mapRestaurants,
      mapFocus,
      fetchNearbyRestaurants,
      tab,
      loadMore,
      search,
      filters,
      activeFilterCount,
      availableTags,
      availableCuisines,
      filterOpen,
      selectedId,
      selectRestaurant,
      details,
      closeDetails,
      form,
      openForm,
      closeForm,
      saveRestaurant,
      deleteRestaurant,
      handleDeleteRestaurant,
    ],
  )

  return (
    <RestaurantsContext.Provider value={value}>
      {children}
    </RestaurantsContext.Provider>
  )
}

export function useRestaurants() {
  const context = useContext(RestaurantsContext)

  if (!context) {
    throw new Error(
      'useRestaurants must be used inside RestaurantProvider',
    )
  }

  return context
}
