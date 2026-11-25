import * as React from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn('field h-auto min-h-20 py-2.5', className)} {...props} />
}
