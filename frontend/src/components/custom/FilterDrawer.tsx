import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { emptyFilters, useRestaurants, type Filters } from '@/context/RestaurantContext'
import { PRICES, PRICE_FILTER_LABEL, RATINGS } from '@/data/constants'
import { useEffect, useState, type ReactNode } from 'react'
import OptionGroup from './OptionGroup'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t py-4">
      <h3>{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export default function FilterDrawer() {
  const { filterOpen, setFilterOpen, filters, setFilters, availableTags, availableCuisines } = useRestaurants()
  const [draft, setDraft] = useState<Filters>(filters)
  useEffect(() => { 
    if (filterOpen) setDraft(filters) 
  }, [filterOpen]) // eslint-disable-line react-hooks/exhaustive-deps
  const count = (filters.price !== null ? 1 : 0) + draft.tags.length + (draft.rating !== null ? 1 : 0)

  const onApplyFilters = () => { 
    setFilters(draft); 
    setFilterOpen(false) 
  }
  
  const onRemoveFilters = () => {
    setDraft(emptyFilters); 
    setFilters(emptyFilters);
    setFilterOpen(false);
  }

  return (
    <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
      <SheetContent className="px-7 pt-7">
        <SheetTitle className="text-display mb-1 text-[32px]">Filters</SheetTitle>
        <SheetDescription className="sr-only">Filter restaurants by price, rating and tags</SheetDescription>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          <Section title="Price range">
            <OptionGroup
              allowEmpty
              label="Price range"
              value={draft.price ? [draft.price] : []}
              onChange={([price]) => setDraft({ ...draft, price: price ?? null })}
              options={PRICES.map((p) => ({
                value: p,
                label: PRICE_FILTER_LABEL[p],
              }))}
            />
          </Section>
          <Section title="Rating">
            <OptionGroup 
              allowEmpty 
              label="Minimum rating" 
              value={draft.rating ? [draft.rating] : []} 
              onChange={([r]) => setDraft({ ...draft, rating: r ?? null })} 
              options={RATINGS.map((n) => ({ value: n, label: String(n) }))} 
            />
            <p className="meta mt-2">Show restaurants rated this or higher (1 to 5)</p>
          </Section>
          <Section title="Tags">
            <OptionGroup 
              multiple 
              wrap 
              label="Tags" 
              value={draft.tags} 
              onChange={(tags) => setDraft({ ...draft, tags })} 
              options={availableTags.map((t) => ({ value: t, label: t }))} 
            />
          </Section>
          <Section title="Cuisine">
            <OptionGroup 
              multiple 
              wrap 
              label="Cuisine" 
              value={draft.cuisine} 
              onChange={(cuisine) => setDraft({ ...draft, cuisine })} 
              options={availableCuisines.map((c) => ({ value: c, label: c }))} 
            />
            </Section>
        </div>
        <div className="flex items-center justify-between border-t py-5">
          <Button 
            variant="ghost" className="px-2" 
            onClick={onRemoveFilters}
          >
              Clear all
          </Button>
          <Button onClick={onApplyFilters}>Apply filters{count > 0 && ` (${count})`}</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
