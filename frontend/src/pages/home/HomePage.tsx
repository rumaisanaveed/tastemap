import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AppHeader from '@/components/custom/AppHeader'
import SearchBar from '@/components/custom/SearchBar'
import MapView from '@/components/custom/MapView/MapView'
import BottomSheet from '@/components/custom/BottomSheet'
import RestaurantDetailsModal from '@/components/custom/RestaurantDetailsModal'
import RestaurantFormModal from '@/components/custom/RestaurantForm/RestaurantFormModal'
import FilterDrawer from '@/components/custom/FilterDrawer'
import { useRestaurants } from '@/context/RestaurantContext'
import RestaurantList from '@/components/custom/RestaurantList/RestaurantList'

export default function HomePage() {
  const { openForm } = useRestaurants()
  const addButton = (className: string, iconOnly = false) => (
    <Button size="lg" className={className} onClick={() => openForm('add')}>
      <Plus className="size-5" />
      {!iconOnly && 'Add restaurant'}
    </Button>
  )
  return (
    <div className="h-dvh overflow-hidden md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-[370px] shrink-0 flex-col border-r bg-background pt-6 md:flex">
        <div className="px-6">
          <AppHeader />
          <h1 className="text-title my-4">Your personal<br />restaurant experience</h1>
          <SearchBar />
        </div>
        <RestaurantList className="mt-5 flex-1 px-1.5" />
      </aside>

      <main className="absolute inset-0 md:static md:flex-1">
        <MapView />
        <div className="absolute inset-x-3 top-3 z-[1000] md:hidden"><SearchBar /></div>
        {addButton('absolute bottom-7 right-7 z-[1000] hidden shadow-sm md:inline-flex')}
      </main>

      {/* For mobile */}
      <BottomSheet floating={addButton('size-12 rounded-full p-0 shadow-sm', true)}>
        <div className="px-5"><AppHeader /></div>
        <RestaurantList className="mt-3 min-h-0 flex-1" />
      </BottomSheet>

      <RestaurantDetailsModal />
      <RestaurantFormModal />
      <FilterDrawer />
    </div>
  )
}
