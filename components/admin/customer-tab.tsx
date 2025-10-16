'use client'

import { useCallback, useMemo, useState } from 'react'
import { Plus, Pencil, Search, Loader2 } from 'lucide-react'
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
import Avatar from 'boring-avatars'
import type { Customer } from '@/lib/types'
import CustomerForm from './customer-form'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'
import { Badge } from '../ui/badge'

function CustomerTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()
  const { data: customers, isLoading } = api.customers.getCustomers.useQuery()

  const utils = api.useUtils()

  const filteredCustomers = useMemo(
    () =>
      customers?.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.email &&
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())),
      ) || [],
    [customers, searchTerm],
  )

  const handleEditCustomer = useCallback((customer: Customer) => {
    setEditingCustomer(customer)
  }, [])

  const handleFormClose = useCallback(() => {
    setEditingCustomer(null)
    setIsCreating(false)
  }, [])

  const handleFormSuccess = useCallback(() => {
    setEditingCustomer(null)
    setIsCreating(false)
    utils.customers.getCustomers.refetch()
  }, [utils.customers.getCustomers])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {t('admin.customers.loading-customers')}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end items-center mb-6 mt-8">
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('admin.customers.add-customer')}
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('admin.customers.search-customers')}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">
              {t('admin.customers.no-customers-found')}
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />{' '}
              {t('admin.customers.add-customer')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>{t('admin.customers.name')}</TableHead>
                <TableHead>{t('admin.customers.email')}</TableHead>
                <TableHead>{t('admin.customers.role')}</TableHead>
                <TableHead>{t('admin.customers.total-purchased')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.customers.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() => handleEditCustomer(customer)}
                >
                  <TableCell>
                    <Avatar
                      size={40}
                      name={customer.name}
                      variant="beam"
                      colors={[
                        '#92A1C6',
                        '#146A7C',
                        '#F0AB3D',
                        '#C271B4',
                        '#C20D90',
                      ]}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.role === 'ADMIN' ? 'default' : 'secondary'
                      }
                    >
                      {t(`admin.customers.roles.${customer.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>{currencyFormat(customer.balance)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {(editingCustomer || isCreating) && (
        <CustomerForm
          customer={editingCustomer}
          isOpen={!!editingCustomer || isCreating}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

CustomerTab.displayName = 'CustomerTab'

export default CustomerTab
