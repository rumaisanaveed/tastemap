import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useRestaurants } from '@/context/RestaurantContext'
import AddEditForm from './AddEditForm'

export default function RestaurantFormModal() {
  const { form, closeForm } = useRestaurants()

  return (
    <Dialog open={!!form} onOpenChange={(o) => !o && closeForm()}>
      <DialogContent className="max-w-2xl overflow-y-auto md:max-h-[92dvh]">
        {form && <AddEditForm 
                    key={`${form.mode}-${form.restaurant?._id ?? 'new'}`} 
                    mode={form.mode} 
                    restaurant={form.restaurant} 
                  />
        }
      </DialogContent>
    </Dialog>
  )
}


