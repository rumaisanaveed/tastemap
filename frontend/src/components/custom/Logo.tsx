import logo from '@/assets/icons/logo.svg'
import { cn } from '@/lib/utils'

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 font-display text-[28px] leading-none', className)}>
      <img src={logo} alt="" className="size-8" />
      <span>Taste<span className="text-brand">Map</span></span>
    </div>
  )
}
