import { PRICE_LABEL } from '@/data/constants'
import { cn } from '@/lib/utils'
import type { Restaurant } from '@/types/restaurant'
import RestaurantImage from '../RestaurantImage';

interface Props { restaurant: Restaurant; selected: boolean; onSelect: () => void }

export default function RestaurantListItem({ restaurant: r, selected, onSelect }: Props) {
  return (
    <button type="button" onClick={onSelect} aria-current={selected} className={cn('flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-2.5 text-left transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none', selected && 'bg-accent')}>
      <RestaurantImage name={r.name} image={r.image} className="size-14 shrink-0 rounded-2xl" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{r.name}</span>
        <span className="meta block truncate">{r.cuisine} · {PRICE_LABEL[r.price]}</span>
      </span>
    </button>
  )
}
