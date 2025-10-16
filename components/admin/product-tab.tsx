'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'
import { Link } from '@/app/i18n/navigation'
import type { Product } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from '@/app/i18n/navigation'
import { useCurrencyFormat } from '@/lib/currency'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'

function ProductTab() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()
  const { data: productsData, isLoading } = api.products.getProducts.useQuery()
  const { mutateAsync: deleteProductMutation } =
    api.products.deleteProduct.useMutation()

  useEffect(() => {
    setProducts(productsData || [])
  }, [productsData])

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [products, searchTerm],
  )

  const handleDeleteClick = useCallback(
    (product: Product) => {
      setProductToDelete(product)
      setDeleteConfirmOpen(true)
    },
    [setProductToDelete, setDeleteConfirmOpen],
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!productToDelete) {
      return
    }

    try {
      await deleteProductMutation({ id: productToDelete.id })
      toast({
        title: t('admin.products.product-deleted'),
        description: `${productToDelete.name} ${t(
          'admin.products.has-been-deleted',
        )}`,
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: t('admin.products.error'),
        description: t('admin.products.error-delete-description'),
        variant: 'destructive',
      })
    } finally {
      setDeleteConfirmOpen(false)
      setProductToDelete(null)
    }
  }, [productToDelete, toast, t])

  const returnPrice = useCallback(
    (product: Product) => {
      let str = ''
      if ([...new Set(product.variants?.map((v) => v.price))]?.length > 1) {
        str += t('admin.products.fr')
      }

      str += currencyFormat(
        product.variants?.length && product.variants.length > 0
          ? Math.min(...(product.variants?.map((v) => v.price) || []))
          : product.price,
      )

      return str
    },
    [t, currencyFormat],
  )

  const returnNoVariants = useCallback(
    (product: Product) => {
      return product.variants && product.variants.length > 0
        ? `${product.variants.length} ${t('admin.products.variants')}`
        : `${t('admin.products.no-variants')}`
    },
    [t],
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t('admin.products.loading')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end items-center mb-8">
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> {t('admin.products.add-product')}
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('admin.products.search-placeholder')}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">
              {t('admin.products.no-products-found')}
            </p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />{' '}
                {t('admin.products.add-product')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">
                  {t('admin.products.image')}
                </TableHead>
                <TableHead>{t('admin.products.name')}</TableHead>
                <TableHead>{t('admin.products.price')}</TableHead>
                <TableHead>{t('admin.products.stock')}</TableHead>
                <TableHead>{t('admin.products.purchase-price')}</TableHead>
                <TableHead>{t('admin.products.variants')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.products.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/products/${product.id}`)}
                >
                  <TableCell>
                    <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{returnPrice(product)}</TableCell>
                  <TableCell>
                    {product.stock +
                      (product.variants?.reduce((sum, v) => sum + v.stock, 0) ||
                        0)}
                  </TableCell>
                  <TableCell>{currencyFormat(product.purchasePrice)}</TableCell>
                  <TableCell>{returnNoVariants(product)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(product)
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

      <DeleteDialog
        deleteConfirmOpen={deleteConfirmOpen}
        setDeleteConfirmOpen={setDeleteConfirmOpen}
        handleDeleteConfirm={handleDeleteConfirm}
        labelToBeDeleted={productToDelete?.name || ''}
      />
    </>
  )
}

ProductTab.displayName = 'ProductTab'

export default ProductTab
