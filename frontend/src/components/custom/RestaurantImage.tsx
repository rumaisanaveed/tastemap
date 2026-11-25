import plate from '@/assets/images/plate.svg'
import { cn } from '@/lib/utils'

const TINTS = ['#F6B8A8', '#CFE0EC', '#F6D869', '#D3DEC6']

export default function RestaurantImage({ name, image, className }: { name: string; image?: string; className?: string }) {
  if (image) return <img src={image} alt={name} className={cn('object-cover', className)} />
  const tint = TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length]
  return (
    <div className={cn('grid place-items-center', className)} style={{ background: tint }} role="img" aria-label={`${name}, no image yet`}>
      <img src={plate} alt="" className="w-3/4 max-w-56" />
    </div>
  )
}
