import { Plus, Minus } from "lucide-react"
import { useMap } from "react-leaflet"

export function Overlay() {
  const map = useMap()

  const btn = 'grid size-[42px] place-items-center text-lg hover:bg-accent'

  return (
    <>
      <div className="absolute right-4 top-20 z-[1000] hidden overflow-hidden rounded-xl border-[1.5px] border-input bg-card md:top-4 md:block">
        <button
          className={btn}
          aria-label="Zoom in"
          onClick={() => map.zoomIn()}
        >
          <Plus className="size-4" />
        </button>

        <button
          className={`${btn} border-t`}
          aria-label="Zoom out"
          onClick={() => map.zoomOut()}
        >
          <Minus className="size-4" />
        </button>
      </div>

      <div className="meta absolute bottom-7 left-4 z-[1000] hidden items-center gap-4 rounded-xl bg-background px-4 py-3 text-foreground md:flex">
        <span className="flex items-center gap-2">
          <i className="size-3.5 rounded-full bg-foreground" />
          Ranked
        </span>

        <span className="flex items-center gap-2">
          <i className="size-3.5 rounded-full border-2 border-primary bg-butter" />
          Want to try
        </span>
      </div>
    </>
  )
}