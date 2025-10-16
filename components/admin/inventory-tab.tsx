'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Loader2, Layers } from 'lucide-react'
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
import { useToast } from '@/components/ui/use-toast'
import React from 'react'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'
import {
  RenderCurrentStock,
  RenderSalesData,
  TotalSold,
  UnlistedProducts,
} from './inventory-components'
import { calculateSalesData } from '@/lib/inventory-helper'

export type ProductSalesData = Record<
  string,
  {
    totalSold: number
    totalRevenue: number
    variantSales?: Record<
      string,
      {
        totalSold: number
        totalRevenue: number
      }
    >
  }
>

function InventoryTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [salesData, setSalesData] = useState<ProductSalesData>({})
  const { toast } = useToast()
  const { t } = useTranslation()
  const { data: products, isLoading: isLoadingProducts } =
    api.products.getProducts.useQuery()
  const { data: transactions, isLoading: isLoadingTransactions } =
    api.transactions.getTransactions.useQuery()

  const isLoading = isLoadingProducts || isLoadingTransactions

  useEffect(() => {
    async function loadData() {
      try {
        const calculatedSalesData = calculateSalesData(transactions || [])
        setSalesData(calculatedSalesData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: t('admin.inventory.error'),
          description: t('admin.inventory.error-load-description'),
          variant: 'destructive',
        })
      }
    }

    if (transactions) {
      loadData()
    }
  }, [transactions])

  const filteredProducts = useMemo(() => {
    return (
      products?.filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        const hasStock =
          product.stock > 0 ||
          (product.variants && product.variants.some((v) => v.stock > 0))
        return matchesSearch && hasStock
      }) || []
    )
  }, [products, searchTerm])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {t('admin.inventory.loading-products')}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="relative mb-6 mt-8">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('admin.inventory.search-products')}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {t('admin.inventory.no-products-with-stock')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('admin.inventory.no-products-with-stock-description')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">
                  {t('admin.inventory.image')}
                </TableHead>
                <TableHead>{t('admin.inventory.product')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.inventory.current-stock')}
                </TableHead>
                <TableHead className="text-right">
                  {t('admin.inventory.sales-statistics')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                return (
                  <TableRow key={product.id}>
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
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="align-bottom">
                      <RenderCurrentStock product={product} />
                    </TableCell>
                    <TableCell className="align-bottom">
                      <RenderSalesData
                        salesData={salesData}
                        product={product}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              <UnlistedProducts
                salesData={salesData}
                filteredProducts={filteredProducts}
              />
            </TableBody>
          </Table>
          <TotalSold salesData={salesData} products={filteredProducts} />
        </div>
      )}
    </div>
  )
}

InventoryTab.displayName = 'InventoryTab'

export default InventoryTab
