import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

const snapsOf = () => { const h = window.innerHeight; return [230, Math.round(h * 0.5), Math.round(h * 0.88)] }

export default function BottomSheet({ children, floating }: { children: ReactNode; floating?: ReactNode }) {
  const [height, setHeight] = useState(() => snapsOf()[1])
  const [dragging, setDragging] = useState(false)
  const start = useRef({ y: 0, h: 0 })

  const onDown = (e: PointerEvent) => { e.currentTarget.setPointerCapture(e.pointerId); start.current = { y: e.clientY, h: height }; setDragging(true) }
  const onMove = (e: PointerEvent) => {
    if (!dragging) return
    const s = snapsOf()
    setHeight(Math.min(s[2], Math.max(s[0], start.current.h + start.current.y - e.clientY)))
  }
  const onUp = () => { setDragging(false); setHeight((h) => snapsOf().reduce((a, b) => (Math.abs(b - h) < Math.abs(a - h) ? b : a))) }

  return (
    <section aria-label="Restaurants" className="absolute inset-x-0 bottom-0 z-1100 flex flex-col rounded-t-[28px] bg-background shadow-[0_-1px_0_var(--border)] md:hidden" style={{ height, transition: dragging ? 'none' : 'height .25s ease' }}>
      <div className="absolute bottom-4 right-4">{floating}</div>
      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} className="flex h-8 shrink-0 touch-none cursor-grab items-center justify-center" aria-hidden>
        <span className="h-1.5 w-11 rounded-full bg-input" />
      </div>
      {children}
    </section>
  )
}
