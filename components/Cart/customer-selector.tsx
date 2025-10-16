'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { Loader2, User, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Avatar from 'boring-avatars'
import type { Customer } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Nunito_Sans } from 'next/font/google'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-nunito',
})

interface CustomerSelectorProps {
  selectedCustomer: string | null
  setSelectedCustomer: (customerId: string | null) => void
  onCustomerSelect: (customer: Customer | null) => void
  disabled?: boolean
  customers: Customer[]
}

const AvatarIcon = ({ name, size = 40 }: { name: string; size?: number }) => {
  return (
    <Avatar
      size={size}
      name={name}
      variant="beam"
      colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
    />
  )
}

const CustomerSelector = memo(
  ({
    selectedCustomer,
    setSelectedCustomer,
    onCustomerSelect,
    disabled = false,
    customers,
  }: CustomerSelectorProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomerData, setSelectedCustomerData] =
      useState<Customer | null>(null)
    const currencyFormat = useCurrencyFormat()
    const { t } = useTranslation()

    useEffect(() => {
      if (customers.length > 0) {
        setFilteredCustomers(customers)
        setLoading(false)
      }
    }, [customers])

    useEffect(() => {
      if (selectedCustomer) {
        const customer =
          customers.find((c) => c.id === selectedCustomer) || null
        setSelectedCustomerData(customer)
        if (customer) {
          onCustomerSelect(customer)
        }
      } else {
        setSelectedCustomerData(null)
      }
    }, [selectedCustomer, customers, onCustomerSelect])

    const handleSelectCustomer = useCallback(
      (customer: Customer) => {
        setSelectedCustomer(customer.id)
        onCustomerSelect(customer)
        setIsDialogOpen(false)
      },
      [setSelectedCustomer, onCustomerSelect, setIsDialogOpen],
    )

    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary dark:text-white mr-2" />
        </div>
      )
    }

    return (
      <div>
        {selectedCustomerData ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AvatarIcon name={selectedCustomerData.name} size={40} />
              <div className="ml-3">
                <span
                  className={cn(
                    'font-medium dark:text-white',
                    nunito.className,
                  )}
                >
                  {selectedCustomerData.name}
                </span>
                <div
                  className={cn(
                    'text-sm text-muted-foreground dark:text-slate-400',
                    nunito.className,
                  )}
                >
                  {currencyFormat(selectedCustomerData.balance)}
                  {selectedCustomerData.invoiceBalance > 0 && (
                    <span className="text-md text-red-700">*</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCustomer(null)
                onCustomerSelect(null)
              }}
              disabled={disabled}
              className={cn(
                'px-6 py-6 rounded-lg bg-white text-black focus:bg-white hover:bg-white focus:text-black hover:text-black',
                nunito.className,
              )}
            >
              {t('pos.customer-selector.change-customer')}
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            className="w-full h-[5rem] flex-col active:scale-90 transition transform p-4 bg-gray-100 focus:bg-gray-100 text-black hover:bg-gray-100 dark:hover:bg-pos-bg items-start justify-center gap-2 rounded-lg dark:bg-pos-bg dark:focus:bg-pos-bg"
            onClick={() => setIsDialogOpen(true)}
            disabled={disabled}
          >
            <User className="mt-3 h-4 w-4 opacity-70 text-black dark:text-white" />
            <span
              className={cn(
                'mb-3 text-black dark:text-white',
                nunito.className,
              )}
            >
              {t('pos.customer-selector.select-customer')}
            </span>
          </Button>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {t('pos.customer-selector.select-customer')}
              </DialogTitle>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {t('pos.customer-selector.no-customers-found')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredCustomers.map((customer, index) => (
                    <div
                      key={customer.id}
                      className={`flex flex-col p-3 gap-4 rounded-xl border dark:border-pos-borderSecondary dark:bg-pos-bg dark:hover:bg-pos-bg/80 cursor-pointer hover:bg-muted transition-colors ${
                        selectedCustomer === customer.id
                          ? 'bg-muted border-primary'
                          : ''
                      }`}
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <AvatarIcon name={customer.name} size={36} />
                      <div className="flex-1">
                        <div
                          className={cn(
                            'font-medium  flex gap-2',
                            index === 0 ? 'text-[#EFAB3D]' : 'dark:text-white',
                          )}
                        >
                          {customer.name}
                          {index === 0 && (
                            <Crown className="w-5 h-5 text-[#EFAB3D]" />
                          )}
                        </div>
                        <div className="text-xs dark:text-slate-400">
                          {currencyFormat(customer.balance)}
                          {customer.invoiceBalance > 0 && (
                            <span className="text-md text-red-700">*</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
)

CustomerSelector.displayName = 'CustomerSelector'

export default CustomerSelector
