import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-lg px-2.5 py-1 text-[13px] font-semibold', {
  variants: { variant: { default: 'bg-muted', sage: 'bg-sage', sky: 'bg-sky', butter: 'bg-butter' } },
  defaultVariants: { variant: 'default' },
})

export function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
