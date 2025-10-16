import { useMemo } from 'react'
import { Trash2, ImageIcon, PlusCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { Link } from '@/app/i18n/navigation'
import type { ProductVariant } from '@/lib/types'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DialogContent } from '@/components/ui/dialog'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'
import { computeStockAggregation } from '@/lib/product-helper'

export function FormActions({
  onSubmit,
  isSaving,
}: {
  onSubmit: () => void
  isSaving: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="flex justify-end gap-2">
      <Link href="/admin/products">
        <Button variant="outline">{t('admin.products.cancel')}</Button>
      </Link>
      <Button onClick={onSubmit} disabled={isSaving}>
        {isSaving ? t('admin.products.saving') : t('admin.products.save')}
      </Button>
    </div>
  )
}

FormActions.displayName = 'FormActions'

export function MetricCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode
  title: string
  value: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

MetricCard.displayName = 'MetricCard'

export function VariantRow({
  variant,
  index,
  onChange,
  onRemove,
  onOpenStock,
  isNewProduct,
  productId,
}: {
  variant: ProductVariant
  index: number
  onChange: (
    id: string,
    field: keyof ProductVariant,
    value: string | number | undefined,
  ) => void
  onRemove: (id: string) => void
  onOpenStock: (id: string) => void
  isNewProduct: boolean
  productId: string
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2 p-3 border rounded-md">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`variant-name-${index}`}>
            {t('admin.products.name')}
          </Label>
          <Input
            id={`variant-name-${index}`}
            value={variant.name}
            onChange={(e) => onChange(variant.id, 'name', e.target.value)}
            placeholder={t('admin.products.variant-name')}
          />
        </div>
        <div className="w-24 space-y-2">
          <Label htmlFor={`variant-price-${index}`}>
            {t('admin.products.price')}
          </Label>
          <Input
            id={`variant-price-${index}`}
            type="number"
            min="0"
            step="0.01"
            value={variant.price}
            onChange={(e) =>
              onChange(
                variant.id,
                'price',
                Number.parseFloat(e.target.value) || 0,
              )
            }
            placeholder="0.00"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 mb-0.5"
          onClick={() => onRemove(variant.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`variant-stock-${index}`}>
            {t('admin.products.stock')}
          </Label>
          <Input
            id={`variant-stock-${index}`}
            type="number"
            min="0"
            step="1"
            value={variant.stock}
            onChange={(e) =>
              onChange(
                variant.id,
                'stock',
                Number.parseInt(e.target.value) || 0,
              )
            }
            placeholder="0"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor={`variant-purchasePrice-${index}`}>
            {t('admin.products.purchase-price')}
          </Label>
          <Input
            id={`variant-purchasePrice-${index}`}
            type="number"
            min="0"
            value={variant.purchasePrice}
            onChange={(e) =>
              onChange(
                variant.id,
                'purchasePrice',
                Number.parseFloat(e.target.value) || 0,
              )
            }
            placeholder="0"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 mb-0.5"
          onClick={() => onOpenStock(variant.id)}
        >
          <PlusCircle className="h-4 w-4" />
          {t('admin.products.add-to-stock')}
        </Button>
      </div>
      <div className="flex items-start mt-2 gap-2">
        <div className="space-y-2 w-full">
          <Label
            htmlFor={`variant-image-${index}`}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" /> {t('admin.products.image-url')}{' '}
            (valfritt)
          </Label>
          <Input
            id={`variant-image-${index}`}
            value={variant.image || ''}
            onChange={(e) => onChange(variant.id, 'image', e.target.value)}
            placeholder="https://example.com/variant-image.jpg"
          />
          <p className="text-xs text-muted-foreground">
            {t('admin.products.leave-empty-to-use-parent-image')}
          </p>
        </div>
        {variant.image && (
          <div className="flex justify-center p-4 border rounded-md bg-muted">
            <div className="relative w-40 h-40">
              <Image
                src={variant.image || '/placeholder.svg'}
                alt={variant.name}
                fill
                className="object-contain"
                sizes="160px"
              />
            </div>
          </div>
        )}
      </div>
      {!isNewProduct && (
        <div className="flex">
          <Link
            href={`/admin/transactions?productId=${productId}&variantId=${variant.id}`}
          >
            <Button variant="outline">
              <Eye className="h-4 w-4" />{' '}
              {t('admin.products.view-transactions')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

VariantRow.displayName = 'VariantRow'

export function StockDialog({
  open,
  onClose,
  variant,
  newStock,
  setNewStock,
  newPurchasePrice,
  setNewPurchasePrice,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  variant?: ProductVariant
  newStock: string
  setNewStock: (v: string) => void
  newPurchasePrice: string
  setNewPurchasePrice: (v: string) => void
  onConfirm: (update: {
    stock: number
    purchasePrice: number
    price: number
  }) => void
}) {
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()

  const summary = useMemo(() => {
    if (!variant) {
      return undefined
    }
    const addStock = Number.parseInt(newStock) || 0
    const pNew = newPurchasePrice ? Number.parseFloat(newPurchasePrice) || 0 : 0
    const currentPurchase = variant.purchasePrice || pNew
    return computeStockAggregation(
      variant.stock,
      currentPurchase,
      addStock,
      pNew,
      1.1,
    )
  }, [variant, newStock, newPurchasePrice])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="dark:bg-background">
        <DialogHeader>
          <DialogTitle>{t('admin.products.add-to-stock')}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="variant-stock-new">
              {t('admin.products.new-stock-amount')}
            </Label>
            <Input
              id="variant-stock-new"
              type="number"
              min="0"
              step="1"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="variant-purchasePrice-new">
              {t('admin.products.new-purchase-price')}
            </Label>
            <Input
              id="variant-purchasePrice-new"
              type="number"
              min="0"
              value={newPurchasePrice}
              onChange={(e) => setNewPurchasePrice(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {t('admin.products.new-stock')}: {summary?.stock ?? '-'}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('admin.products.new-purchase-price')}:{' '}
            {currencyFormat(summary?.purchasePrice)}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('admin.products.new-price')}: {currencyFormat(summary?.price)}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('admin.products.cancel')}
          </Button>
          <Button onClick={() => summary && onConfirm(summary)}>
            {t('admin.products.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

StockDialog.displayName = 'StockDialog'
