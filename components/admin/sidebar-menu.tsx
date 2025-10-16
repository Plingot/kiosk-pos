import { memo, useCallback } from 'react'
import { Link } from '@/app/i18n/navigation'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Receipt,
  Wallet,
  ShoppingCart,
  AlertCircle,
  Tag,
} from 'lucide-react'
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { useTranslation } from '@/hooks/use-translation'
import { cn } from '@/lib/utils'

const SidebarMenuComponent = memo(() => {
  const { t } = useTranslation()
  const pathname = usePathname()

  const menuItems = useCallback(
    () => [
      {
        path: '/admin',
        label: t('admin.dashboard.title'),
        icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      },
      {
        path: '/admin/products',
        label: t('admin.products.title'),
        icon: <ShoppingBag className="h-4 w-4 mr-2" />,
      },
      {
        path: '/admin/categories',
        label: t('admin.categories.title'),
        icon: <Tag className="h-4 w-4 mr-2" />,
      },
      {
        path: '/admin/customers',
        label: t('admin.customers.title'),
        icon: <Users className="h-4 w-4 mr-2" />,
      },
      {
        path: '/admin/transactions',
        label: t('admin.transactions.title'),
        icon: <Receipt className="h-4 w-4 mr-2" />,
      },
      {
        path: '/admin/balance',
        label: t('admin.balances.title'),
        icon: <Wallet className="h-4 w-4 mr-2" />,
      },
      {
        path: '/admin/inventory',
        label: t('admin.inventory.title'),
        icon: <ShoppingCart className="h-4 w-4 mr-2" />,
      },
      {
        path: '/admin/requests',
        label: t('admin.requests.title'),
        icon: <AlertCircle className="h-4 w-4 mr-2" />,
      },
    ],
    [t],
  )

  return (
    <SidebarContent className="">
      <SidebarMenu className="px-3">
        {menuItems().map((item) => (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton
              asChild
              isActive={
                pathname === item.path ||
                (pathname.startsWith(item.path) && item.path !== '/admin')
              }
              className={cn(
                'w-full flex items-center rounded-md text-sm font-medium transition-colors',
                pathname === item.path ||
                  (pathname.startsWith(item.path) && item.path !== '/admin')
                  ? '!bg-gray-200 text-gray-900 dark:!bg-gray-800 dark:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-800 dark:text-gray-200',
              )}
            >
              <Link
                href={item.path}
                className="flex items-center px-3 py-6 gap-2 w-full"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  )
})

SidebarMenuComponent.displayName = 'SidebarMenuComponent'

export { SidebarMenuComponent }
