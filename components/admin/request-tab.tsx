'use client'

import { useState } from 'react'
import { Loader2, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProductRequest } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/format-date'
import { DeleteDialog } from './delete-dialog'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'

function RequestTab() {
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<ProductRequest | null>(
    null,
  )
  const { toast } = useToast()
  const { t } = useTranslation()
  const utils = api.useUtils()

  const { data: requests, isLoading: isLoadingRequests } =
    api.productRequests.getProductRequests.useQuery()
  const { mutateAsync: deleteProductRequest } =
    api.productRequests.deleteProductRequest.useMutation()
  const { mutateAsync: clearAllProductRequests } =
    api.productRequests.clearAllProductRequests.useMutation()

  const isLoading = isLoadingRequests

  const handleDeleteClick = (request: ProductRequest) => {
    setRequestToDelete(request)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) {
      return
    }

    try {
      await deleteProductRequest({ id: requestToDelete.id })
      utils.productRequests.getProductRequests.refetch()
      toast({
        title: t('admin.requests.request-deleted'),
        description: t('admin.requests.request-deleted-description', {
          productName: requestToDelete.productName,
        }),
      })
    } catch (error) {
      console.error('Error deleting request:', error)
      toast({
        title: t('admin.requests.error'),
        description: t('admin.requests.could-not-delete-request'),
        variant: 'destructive',
      })
    } finally {
      setDeleteConfirmOpen(false)
      setRequestToDelete(null)
    }
  }

  const handleClearAllConfirm = async () => {
    try {
      await clearAllProductRequests()
      utils.productRequests.getProductRequests.refetch()
      toast({
        title: t('admin.requests.all-requests-deleted'),
        description: t('admin.requests.all-product-requests-have-been-deleted'),
      })
    } catch (error) {
      console.error('Error clearing requests:', error)
      toast({
        title: t('admin.requests.error'),
        description: t('admin.requests.could-not-clear-requests'),
        variant: 'destructive',
      })
    } finally {
      setClearConfirmOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {t('admin.requests.loading-product-requests')}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end items-center mb-6 mt-8">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => utils.productRequests.getProductRequests.refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('admin.requests.update')}
          </Button>

          {requests?.length && requests.length > 0 && (
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-white"
              onClick={() => setClearConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('admin.requests.clear-all')}
            </Button>
          )}
        </div>
      </div>

      {requests?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">
              {t('admin.requests.no-product-requests-found')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.requests.product')}</TableHead>
                <TableHead>{t('admin.requests.variant')}</TableHead>
                <TableHead className="text-center">
                  {t('admin.requests.number-of-requests')}
                </TableHead>
                <TableHead>{t('admin.requests.last-requested')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.requests.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.productName}
                  </TableCell>
                  <TableCell>{request.variantName || '-'}</TableCell>
                  <TableCell className="text-center">{request.count}</TableCell>
                  <TableCell>{formatDate(request.lastRequested)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-white"
                        onClick={() => handleDeleteClick(request)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteDialog
        deleteConfirmOpen={deleteConfirmOpen}
        setDeleteConfirmOpen={setDeleteConfirmOpen}
        handleDeleteConfirm={handleDeleteConfirm}
        labelToBeDeleted={requestToDelete?.productName || ''}
      />

      <DeleteDialog
        deleteConfirmOpen={clearConfirmOpen}
        setDeleteConfirmOpen={setClearConfirmOpen}
        handleDeleteConfirm={handleClearAllConfirm}
        labelToBeDeleted={t('admin.requests.all-product-requests')}
        customConfirmButtonText={t('admin.requests.clear-all')}
      />
    </div>
  )
}

RequestTab.displayName = 'RequestTab'

export default RequestTab
