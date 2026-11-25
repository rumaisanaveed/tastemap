import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { PRICE_LABEL } from '@/data/constants'
import { useRestaurants } from '@/context/RestaurantContext'
import { cn } from '@/lib/utils'
import RestaurantImage from './RestaurantImage'

const TAG_VARIANTS = ['sky', 'sage', 'butter'] as const

function Info({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><p className="eyebrow">{label}</p><p className="mt-0.5 font-semibold">{children}</p></div>
}

export default function RestaurantDetailsModal() {
  const { details: r, closeDetails, openForm, handleDeleteRestaurant } = useRestaurants()
  const ranked = r?.status === 'been'
  return (
    <Dialog open={!!r} onOpenChange={(o) => !o && closeDetails()}>
      <DialogContent className="max-w-4xl max-md:overflow-y-auto md:grid md:min-h-150 md:grid-cols-[380px_1fr]">
        {r && (
          <>
            <RestaurantImage name={r.name} image={r.image} className="h-60 w-full md:h-full" />
            <div className="flex flex-col p-6 md:p-10">
              <Badge variant={ranked ? 'sage' : 'butter'} className="self-start">{ranked ? "Ranked" : 'Want to try'}</Badge>
              <DialogTitle className="text-display mt-3 text-[40px] leading-tight">{r.name}</DialogTitle>
              <DialogDescription className="sr-only">Restaurant details</DialogDescription>
              {ranked && (
                <div className="mt-3 flex items-center gap-1.5" role="img" aria-label={`Rating ${r.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((n) => <i key={n} className={cn('size-4.5 rounded-full border-2 border-primary', n <= (r.rating ?? 0) && 'bg-primary')} />)}
                  <span className="meta ml-1.5">{r.rating} / 5</span>
                </div>
              )}
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
                <Info label="Cuisine">{r.cuisine}</Info>
                <Info label="Price">{PRICE_LABEL[r.price]}</Info>
                <Info label="Address" className="col-span-2">{r.address}</Info>
              </div>
              {r.note && <div className="mt-5 rounded-2xl bg-accent px-5 py-4"><p className="eyebrow mb-1">Note</p><p className="leading-relaxed">{r.note}</p></div>}
              {r.tags.length > 0 && <div className="mt-5"><p className="eyebrow mb-2">Tags</p><div className="flex flex-wrap gap-2">{r.tags.map((t, i) => <Badge key={t} variant={TAG_VARIANTS[i % 3]}>{t}</Badge>)}</div></div>}
              {r.links.length > 0 && (
                <div className="mt-5"><p className="eyebrow mb-1">Links</p>
                  {r.links.map((l) => <a key={l} href={l} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-semibold underline underline-offset-4">{l.replace(/^https?:\/\//, '')}<ExternalLink className="size-3.5" /></a>)}
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-3 md:mt-auto md:pt-8">
                {/* if rating is not present */}
                {!ranked && <Button onClick={() => openForm('rank', r)}>Mark as ranked</Button>}
                <Button variant="outline" onClick={() => openForm('edit', r)}><Pencil /> Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteRestaurant(r._id)}><Trash2 /> Delete</Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
