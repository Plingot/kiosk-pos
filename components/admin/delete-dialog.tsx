import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../ui/alert-dialog'
import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from '@/hooks/use-translation'

const DeleteDialog = ({
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  handleDeleteConfirm,
  labelToBeDeleted,
  customDescription,
  customConfirmButtonText,
  isLoading,
}: {
  deleteConfirmOpen: boolean
  setDeleteConfirmOpen: Dispatch<SetStateAction<boolean>>
  handleDeleteConfirm: () => void
  labelToBeDeleted?: string
  customDescription?: string
  customConfirmButtonText?: string
  isLoading?: boolean
}) => {
  const { t } = useTranslation()

  return (
    <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('admin.delete-dialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {customDescription || (
              <>
                {t('admin.delete-dialog.description')}{' '}
                <span className="font-semibold">
                  {labelToBeDeleted || t('admin.delete-dialog.item')}
                </span>{' '}
                {t('admin.delete-dialog.will-be-deleted-permanently')}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('admin.delete-dialog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className="bg-red-500 hover:bg-red-600"
            disabled={isLoading}
          >
            {customConfirmButtonText || t('admin.delete-dialog.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

DeleteDialog.displayName = 'DeleteDialog'

export { DeleteDialog }
