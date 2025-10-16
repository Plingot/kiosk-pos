'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from '@/app/i18n/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Plus, ArrowLeft, Tag, RefreshCcw, X, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { Link } from '@/app/i18n/navigation'
import type { Product, ProductVariant } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrencyFormat } from '@/lib/currency'
import {
  MetricCard,
  FormActions,
  StockDialog,
  VariantRow,
} from '@/components/admin/edit-product-components'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'
import {
  validateProductForm,
  buildProductPayload,
  computeStockAggregation,
} from '@/lib/product-helper'

function ProductForm({ productId }: { productId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const isNewProduct = productId === 'new'

  const currencyFormat = useCurrencyFormat()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [image, setImage] = useState('')
  const [newStock, setNewStock] = useState('')
  const [newPurchasePrice, setNewPurchasePrice] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [stockModal, setStockModal] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState('details')
  const [productStats, setProductStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
  })
  const { t } = useTranslation()
  const { mutateAsync: updateProductMutation } =
    api.products.updateProduct.useMutation()
  const { mutateAsync: createProductMutation } =
    api.products.createProduct.useMutation()
  const { data: transactions } = api.transactions.getTransactions.useQuery()
  const { data: categories } = api.categories.getCategories.useQuery()
  const { data: productsData } = api.products.getProducts.useQuery()
  const { data: productData, isLoading } = api.products.getProduct.useQuery({
    id: productId,
  })

  const hasVariants = variants.length > 0

  useEffect(() => {
    if (isNewProduct) {
      setAvailableProducts(productsData || [])
    } else {
      setAvailableProducts(
        productsData?.filter((p) => p.id !== productId) || [],
      )
    }
  }, [productData, productId])

  useEffect(() => {
    async function loadProduct() {
      if (isNewProduct) {
        setName('')
        setPrice('')
        setStock('0')
        setPurchasePrice('')
        setImage('/placeholder.svg')
        setVariants([])
        setRelatedProductIds([])

        return
      }

      try {
        if (productData) {
          setName(productData.name)
          setPrice(productData.price ? productData.price.toString() : '')
          setStock(productData.stock ? productData.stock.toString() : '')
          setPurchasePrice(
            productData.purchasePrice
              ? productData.purchasePrice.toString()
              : '',
          )
          setImage(productData.image)
          setCategoryId(productData.categoryId)
          setVariants(productData.variants || [])
          setRelatedProductIds(productData.relatedProductIds || [])

          await loadProductStats(productData)
        } else {
          toast({
            title: t('admin.products.error'),
            description: t('admin.products.product-not-found'),
            variant: 'destructive',
          })
          router.push('/admin/products')
        }
      } catch (error) {
        console.error('Error loading product:', error)
        toast({
          title: t('admin.products.error'),
          description: t('admin.products.error-load-description'),
          variant: 'destructive',
        })
      }
    }

    if (isNewProduct || productData) {
      loadProduct()
    }
  }, [productId, isNewProduct, router, productData])

  async function loadProductStats(product: Product) {
    try {
      let totalSales = 0
      let totalRevenue = 0

      transactions?.forEach((transaction) => {
        transaction.items.forEach((item) => {
          if (item.productId === product.id) {
            totalSales += item.quantity
            totalRevenue += item.price * item.quantity
          }
        })
      })

      setProductStats({
        totalSales,
        totalRevenue,
      })
    } catch (error) {
      console.error('Error loading product statistics:', error)
    }
  }

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: uuidv4(),
      name: '',
      price: 0,
      stock: 0,
      purchasePrice: 0,
    }
    setVariants([...variants, newVariant])
  }

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id))
  }

  const handleVariantChange = (
    id: string,
    field: keyof ProductVariant,
    value: string | number | undefined,
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    )
  }

  const handleAddRelatedProduct = (productId: string) => {
    if (!relatedProductIds.includes(productId)) {
      setRelatedProductIds([...relatedProductIds, productId])
    }
  }

  const handleRemoveRelatedProduct = (productId: string) => {
    setRelatedProductIds(relatedProductIds.filter((id) => id !== productId))
  }

  const validateForm = (): boolean =>
    validateProductForm({
      name,
      hasVariants,
      price,
      stock,
      variants,
      onError: (description) =>
        toast({ title: 'Error', description, variant: 'destructive' }),
      t,
    })

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      const productData = buildProductPayload({
        name,
        price,
        stock,
        purchasePrice,
        image,
        variants,
        relatedProductIds,
        categoryId,
        hasVariants,
      })

      if (isNewProduct) {
        await createProductMutation(productData)
        toast({
          title: t('admin.products.product-created'),
          description: t('admin.products.product-has-been-added'),
        })
        router.push('/admin/products')
      } else {
        await updateProductMutation({ id: productId, ...productData })
        toast({
          title: t('admin.products.product-updated'),
          description: t('admin.products.product-has-been-updated'),
        })
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: t('admin.products.error'),
        description: t('admin.products.error-save-description'),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const activeVariant = useMemo(
    () => variants.find((v) => v.id === stockModal),
    [variants, stockModal],
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {t('admin.products.loading-product')}
        </p>
      </div>
    )
  }

  const handleAddNewStock = () => {
    if (!stockModal || !activeVariant) {
      return
    }
    const addStock = Number.parseInt(newStock) || 0
    const pNew = newPurchasePrice ? Number.parseFloat(newPurchasePrice) || 0 : 0
    const currentPurchase = activeVariant.purchasePrice || pNew
    const next = computeStockAggregation(
      activeVariant.stock,
      currentPurchase,
      addStock,
      pNew,
      1.1,
    )
    handleVariantChange(stockModal, 'price', next.price || 0)
    handleVariantChange(stockModal, 'stock', next.stock || 0)
    handleVariantChange(stockModal, 'purchasePrice', next.purchasePrice || 0)
    setNewStock('')
    setNewPurchasePrice('')
    setStockModal(undefined)
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">
          {isNewProduct
            ? t('admin.products.new-product')
            : t('admin.products.edit-product')}
        </h1>
      </div>

      {!isNewProduct && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <MetricCard
            icon={<Tag className="h-6 w-6 text-purple-600" />}
            title={t('admin.products.total-number-of-sold')}
            value={productStats.totalSales}
          />
          <MetricCard
            icon={<RefreshCcw className="h-6 w-6 text-amber-600" />}
            title={t('admin.products.total-revenue')}
            value={currencyFormat(productStats.totalRevenue)}
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">
            {t('admin.products.product-details')}
          </TabsTrigger>
          <TabsTrigger value="variants">
            {t('admin.products.variants')}
          </TabsTrigger>
          <TabsTrigger value="related">
            {t('admin.products.related-products')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.products.basic-information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('admin.products.name')}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('admin.products.product-name')}
                  />
                </div>

                {!hasVariants && (
                  <div className="space-y-2">
                    <Label htmlFor="price">{t('admin.products.price')}</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="stock"
                    className={hasVariants ? 'text-muted-foreground' : ''}
                  >
                    {t('admin.products.stock')}{' '}
                    {hasVariants && `(${t('admin.products.use-variant')})`}
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder={
                      hasVariants ? t('admin.products.use-variant') : '0'
                    }
                    disabled={hasVariants}
                    className={
                      hasVariants ? 'bg-muted text-muted-foreground' : ''
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="purchasePrice"
                    className={hasVariants ? 'text-muted-foreground' : ''}
                  >
                    {t('admin.products.purchase-price')}{' '}
                    {hasVariants && `(${t('admin.products.use-variant')})`}
                  </Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder={
                      hasVariants ? t('admin.products.use-variant') : '0'
                    }
                    disabled={hasVariants}
                    className={
                      hasVariants ? 'bg-muted text-muted-foreground' : ''
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">{t('admin.products.image-url')}</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  {t('admin.products.category-optional')}
                </Label>
                <Select
                  value={categoryId ?? undefined}
                  onValueChange={(val) => setCategoryId(val || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('admin.products.select-category')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null as unknown as string}>
                      {t('admin.products.no-category')}
                    </SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {image && (
                <div className="mt-4">
                  <Label>{t('admin.products.preview')}</Label>
                  <div className="mt-2 relative h-40 w-40 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={image || '/placeholder.svg'}
                      alt="Product image"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              {variants.length === 0 && !isNewProduct && (
                <div className="mt-4">
                  <Link href={`/admin/transactions?productId=${productId}`}>
                    <Button variant="outline">
                      <Eye className="h-4 w-4" />{' '}
                      {t('admin.products.view-transactions')}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <FormActions onSubmit={handleSubmit} isSaving={isSaving} />
        </TabsContent>

        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{t('admin.products.product-variants')}</span>
                <Button type="button" onClick={handleAddVariant}>
                  <Plus className="h-4 w-4 mr-1" />{' '}
                  {t('admin.products.add-variant')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockDialog
                open={!!stockModal}
                onClose={() => {
                  setStockModal(undefined)
                  setNewStock('')
                  setNewPurchasePrice('')
                }}
                variant={activeVariant}
                newStock={newStock}
                setNewStock={setNewStock}
                newPurchasePrice={newPurchasePrice}
                setNewPurchasePrice={setNewPurchasePrice}
                onConfirm={() => handleAddNewStock()}
              />
              {variants.length > 0 ? (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <VariantRow
                      key={variant.id}
                      variant={variant}
                      index={index}
                      onChange={handleVariantChange}
                      onRemove={handleRemoveVariant}
                      onOpenStock={(id) => setStockModal(id)}
                      isNewProduct={isNewProduct}
                      productId={productId}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  {t('admin.products.no-variants-added')}.{' '}
                  {t('admin.products.click-add-variant-to-add-a-variant')}
                </div>
              )}
            </CardContent>
          </Card>

          <FormActions onSubmit={handleSubmit} isSaving={isSaving} />
        </TabsContent>

        <TabsContent value="related" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.products.related-products')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="related-product">
                  {t('admin.products.add-related-product')}
                </Label>
                <div className="flex gap-2">
                  <Select onValueChange={handleAddRelatedProduct}>
                    <SelectTrigger className="flex-1">
                      <SelectValue
                        placeholder={t('admin.products.select-product')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts
                        .filter((p) => !relatedProductIds.includes(p.id))
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.products.selected-related-products')}</Label>
                {relatedProductIds.length > 0 ? (
                  <div className="space-y-2">
                    {relatedProductIds.map((id) => {
                      const relatedProduct = availableProducts.find(
                        (p) => p.id === id,
                      )
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 rounded-md overflow-hidden bg-muted">
                              <Image
                                src={
                                  relatedProduct?.image || '/placeholder.svg'
                                }
                                alt={relatedProduct?.name || 'Product'}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span>
                              {relatedProduct?.name ||
                                t('admin.products.unknown-product')}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleRemoveRelatedProduct(id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded-md">
                    {t('admin.products.no-related-products-selected')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <FormActions onSubmit={handleSubmit} isSaving={isSaving} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

ProductForm.displayName = 'ProductForm'

export default ProductForm
