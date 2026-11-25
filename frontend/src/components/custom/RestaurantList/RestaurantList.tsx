import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RESTAURANT_PAGE_SIZE, useRestaurants, type Tab } from '@/context/RestaurantContext'
import { cn } from '@/lib/utils'
import RestaurantListItem from './RestaurantListItem'

export default function RestaurantList({ className }: { className?: string }) {
  const {
    tab,
    setTab,
    ranked,
    wishlist,
    rankedPagination,
    wishlistPagination,
    loadMore,
    selectedId,
    selectRestaurant,
    search,
    filters,
  } = useRestaurants()

  const items = tab === 'ranked' ? ranked : wishlist

  const pagination =
    tab === 'ranked' ? rankedPagination : wishlistPagination

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as Tab)}
      className={cn('flex flex-col min-h-0', className)}
    >
      <div className="bg-background px-5">
        <TabsList>
          <TabsTrigger value="ranked">
            Ranked <span className="meta">{ranked.length}</span>
          </TabsTrigger>

          <TabsTrigger value="want">
            Want to try <span className="meta">{wishlist.length}</span>
          </TabsTrigger>
        </TabsList>

        <p className="meta pb-1.5 pt-3.5">
          {items.length} restaurant{items.length === 1 ? '' : 's'}
        </p>
      </div>

      <TabsContent
        value={tab}
        className="flex-1 min-h-0 overflow-y-auto px-2.5 pb-6 outline-none"
      >
        {pagination.loading && items.length === 0 && (
          <p className="meta px-3 py-8 text-center">
            Loading restaurants...
          </p>
        )}

        {!pagination.loading && pagination.error && items.length === 0 && (
          <div className="py-8 text-center">
            <p className="meta">{pagination.error}</p>
            <Button
              variant="outline"
              size="default"
              className="mt-3"
              onClick={() => loadMore()}
            >
              Try again
            </Button>
          </div>
        )}

        {!pagination.loading &&
          !pagination.error &&
          items.length === 0 && (
            <p className="meta px-3 py-8 text-center">
              No restaurants found.
            </p>
          )}

        {items.map((restaurant) => (
          <RestaurantListItem
            key={restaurant._id}
            restaurant={restaurant}
            selected={restaurant._id === selectedId}
            onSelect={() => selectRestaurant(restaurant)}
          />
        ))}

        {items.length > 0 && pagination.hasMore && (
          <div className="flex justify-center py-5">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={pagination.loading}
            >
              {pagination.loading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}

        {items.length > RESTAURANT_PAGE_SIZE && !pagination.hasMore &&
          !search.trim() &&
          filters.price === null &&
          filters.rating === null &&
          filters.tags.length === 0 && (
          <p className="meta py-5 text-center">
            You've reached the end.
          </p>
        )}

        {pagination.error && items.length > 0 && (
          <div className="py-3 text-center">
            <p className="meta">{pagination.error}</p>
            <Button
              variant="outline"
              size="default"
              className="mt-2"
              onClick={loadMore}
            >
              Try again
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
