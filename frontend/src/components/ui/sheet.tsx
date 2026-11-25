import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DialogOverlay, DialogPortal } from './dialog'

const Sheet = DialogPrimitive.Root
const SheetTitle = DialogPrimitive.Title
const SheetDescription = DialogPrimitive.Description

/** Left-side slide-in drawer. */
function SheetContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn('fixed inset-y-0 left-0 z-2001 flex w-[min(400px,92vw)] flex-col bg-background outline-none duration-300 data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left', className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close aria-label="Close" className="absolute right-5 top-6 grid size-10 place-items-center rounded-full border-[1.5px] border-foreground transition-colors hover:bg-foreground hover:text-background">
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export { Sheet, SheetContent, SheetTitle, SheetDescription }
