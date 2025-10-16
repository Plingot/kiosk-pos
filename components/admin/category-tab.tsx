'use client'

import { useState, useCallback, useMemo } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import type { Category } from '@/lib/types'
import { DynamicIcon } from '@/components/dynamic-icon'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'

function CategoryTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  )
  const { toast } = useToast()
  const { t } = useTranslation()

  const utils = api.useUtils()
  const { data: categories, isLoading } =
    api.categories.getCategories.useQuery()
  const { mutateAsync: deleteCategory } =
    api.categories.deleteCategory.useMutation()
  const { mutateAsync: updateCategory } =
    api.categories.updateCategory.useMutation()
  const { mutateAsync: createCategory } =
    api.categories.createCategory.useMutation()

  const resetForm = useCallback(() => {
    setIsEditing(false)
    setCurrentCategory(null)
    setTitle('')
    setIcon('')
  }, [])

  const openCreateDialog = useCallback(() => {
    resetForm()
    setIsDialogOpen(true)
  }, [resetForm])

  const openEditDialog = useCallback((category: Category) => {
    setIsEditing(true)
    setCurrentCategory(category)
    setTitle(category.title)
    setIcon(category.icon)
    setIsDialogOpen(true)
  }, [])

  const requestDelete = useCallback((category: Category) => {
    setCategoryToDelete(category)
    setDeleteConfirmOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) {
      return
    }

    try {
      await deleteCategory({ id: categoryToDelete.id })
      utils.categories.getCategories.refetch()
      toast({
        title: t('admin.categories.category-deleted'),
        description: `${categoryToDelete.title} ${t(
          'admin.categories.has-been-deleted',
        )}`,
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: t('admin.categories.error'),
        description: t('admin.categories.error-delete-description'),
        variant: 'destructive',
      })
    } finally {
      setDeleteConfirmOpen(false)
      setCategoryToDelete(null)
    }
  }, [categoryToDelete, toast])

  const canSave = useMemo(() => title.trim().length > 0, [title])

  const saveCategory = useCallback(async () => {
    if (!canSave) {
      toast({
        title: t('admin.categories.error'),
        description: t('admin.categories.error-title-required'),
        variant: 'destructive',
      })
      return
    }
    try {
      if (isEditing && currentCategory) {
        await updateCategory({
          category: { id: currentCategory.id, title, icon },
        })
        utils.categories.getCategories.refetch()
        toast({
          title: t('admin.categories.category-updated'),
          description: `${title} ${t('admin.categories.has-been-updated')}`,
        })
      } else {
        await createCategory({ category: { title, icon } })
        utils.categories.getCategories.refetch()
        toast({
          title: t('admin.categories.category-created'),
          description: `${title} ${t('admin.categories.has-been-created')}`,
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: t('admin.categories.error'),
        description: t('admin.categories.error-save-description'),
        variant: 'destructive',
      })
    }
  }, [canSave, currentCategory, icon, isEditing, title, toast])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="mt-4 text-muted-foreground">
          {t('admin.categories.loading')}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end items-center mb-6 mt-8">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> {t('admin.categories.add-category')}
        </Button>
      </div>

      {categories?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">
              {t('admin.categories.no-categories-found')}
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />{' '}
              {t('admin.categories.add-category')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.categories.icon')}</TableHead>
                <TableHead>{t('admin.categories.title-category')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.categories.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow
                  key={category.id}
                  className="cursor-pointer"
                  onClick={() => openEditDialog(category)}
                >
                  <TableCell className="font-mono">
                    <DynamicIcon name={category.icon} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {category.title}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(category)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          requestDelete(category)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="dark:bg-background">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? t('admin.categories.edit-category')
                : t('admin.categories.new-category')}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t('admin.categories.update-information-for-this-category')
                : t(
                    'admin.categories.fill-in-information-to-create-a-new-category',
                  )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                {t('admin.categories.title-category')}
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('admin.categories.category-title')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">
                {t('admin.categories.icon')} (Lucide icons)
              </Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder={t('admin.categories.enter-manually')}
              />
              <DynamicIcon name={icon} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('admin.categories.cancel')}
            </Button>
            <Button onClick={saveCategory} disabled={!canSave}>
              {t('admin.categories.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        deleteConfirmOpen={deleteConfirmOpen}
        setDeleteConfirmOpen={setDeleteConfirmOpen}
        handleDeleteConfirm={confirmDelete}
        labelToBeDeleted={categoryToDelete?.title || ''}
      />
    </>
  )
}

CategoryTab.displayName = 'CategoryTab'

export default CategoryTab
