import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRestaurants } from '@/context/RestaurantContext'

export default function SearchBar() {
  const { search, setSearch, activeFilterCount, setFilterOpen } =
    useRestaurants()

  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [searchInput, setSearch])

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
  }

  return (
    <div className="flex gap-2.5">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2" />

        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or location"
          aria-label="Search restaurants"
          className="h-12 pl-10 pr-10 md:h-11"
        />

        {searchInput && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="relative h-12 w-12 cursor-pointer bg-card md:h-11 md:w-11"
        aria-label={`Filters, ${activeFilterCount} active`}
        onClick={() => setFilterOpen(true)}
      >
        <SlidersHorizontal />

        {activeFilterCount > 0 && (
          <span className="absolute -right-2 -top-2 grid size-4.5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  )
}