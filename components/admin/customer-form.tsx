'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import type { Customer } from '@/lib/types'
import Avatar from 'boring-avatars'
import { useCurrencyFormat } from '@/lib/currency'
import { useTranslation } from '@/hooks/use-translation'
import { api } from '@/lib/trpc'
import { type Role } from '@prisma/client'
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from '../ui/select'

interface CustomerFormProps {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CustomerForm({
  customer,
  isOpen,
  onClose,
  onSuccess,
}: CustomerFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('USER')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const currencyFormat = useCurrencyFormat()
  const { t } = useTranslation()
  const { mutateAsync: createCustomer } =
    api.customers.createCustomer.useMutation()
  const { mutateAsync: updateCustomer } =
    api.customers.updateCustomer.useMutation()
  const { mutateAsync: deleteCustomer } =
    api.customers.deleteCustomer.useMutation()

  useEffect(() => {
    if (customer) {
      setName(customer.name)
      setEmail(customer.email || '')
      setRole(customer.role)
    } else {
      setName('')
      setEmail('')
      setRole('USER')
    }
  }, [customer])

  const validateForm = useCallback((): boolean => {
    if (!name.trim()) {
      toast({
        title: t('admin.customers.error'),
        description: t('admin.customers.name-must-be-provided'),
        variant: 'destructive',
      })
      return false
    }

    if (email && !isValidEmail(email)) {
      toast({
        title: t('admin.customers.error'),
        description: t('admin.customers.invalid-email-address'),
        variant: 'destructive',
      })
      return false
    }

    return true
  }, [name, email, t])

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (customer) {
        await updateCustomer({
          customer: { id: customer.id, name, email: email || undefined, role },
        })
        toast({
          title: t('admin.customers.customer-updated'),
          description: t('admin.customers.customer-has-been-updated'),
        })
      } else {
        await createCustomer({
          customer: { name, email: email || undefined, role },
        })
        toast({
          title: t('admin.customers.customer-created'),
          description: t('admin.customers.customer-has-been-added'),
        })
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving customer:', error)
      toast({
        title: t('admin.customers.error'),
        description: t('admin.customers.could-not-save-customer'),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = useCallback(async () => {
    if (!customer) {
      return
    }
    await deleteCustomer({ id: customer.id })
    toast({
      title: t('admin.customers.customer-deleted'),
      description: t('admin.customers.customer-has-been-deleted'),
    })
    window.location.reload()
  }, [customer, t])

  const isDeletable =
    customer && customer.balance === 0 && customer.invoiceBalance === 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] dark:bg-background">
        <DialogHeader>
          <DialogTitle>
            {customer
              ? t('admin.customers.edit-customer')
              : t('admin.customers.new-customer')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {customer && (
            <div className="flex justify-center mb-2">
              <Avatar
                size={80}
                name={name}
                variant="beam"
                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t('admin.customers.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('admin.customers.customer-name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('admin.customers.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('admin.customers.role')}</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('admin.customers.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">
                  {t('admin.customers.roles.USER')}
                </SelectItem>
                <SelectItem value="ADMIN">
                  {t('admin.customers.roles.ADMIN')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {customer && (
            <div className="space-y-2">
              <Label>{t('admin.customers.total-purchased')}</Label>
              <div className="p-2 border rounded-md bg-muted/50">
                {currencyFormat(customer.balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t(
                  'admin.customers.balance-is-calculated-automatically-based-on-transactions',
                )}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {isDeletable && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {t('admin.customers.delete')}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('admin.customers.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? t('admin.customers.saving')
              : t('admin.customers.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

CustomerForm.displayName = 'CustomerForm'

export default CustomerForm
