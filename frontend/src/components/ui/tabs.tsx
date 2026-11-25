import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn('flex gap-6 border-b', className)} {...props} />
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn('-mb-px border-b-[3px] border-transparent pb-3 text-[15px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold data-[state=active]:text-foreground', className)}
      {...props}
    />
  )
}

const TabsContent = TabsPrimitive.Content

export { Tabs, TabsList, TabsTrigger, TabsContent }
