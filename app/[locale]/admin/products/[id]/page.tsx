'use client'

import { useParams } from 'next/navigation'
import ProductForm from '@/components/admin/product-form'

export default function ProductEditPage() {
  const params = useParams()
  const productId = params.id as string

  return <ProductForm productId={productId} />
}
