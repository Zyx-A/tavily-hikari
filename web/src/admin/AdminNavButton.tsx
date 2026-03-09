import * as React from 'react'

import { Button, type ButtonProps } from '../components/ui/button'
import { cn } from '../lib/utils'

interface AdminNavButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  active?: boolean
}

const AdminNavButton = React.forwardRef<HTMLButtonElement, AdminNavButtonProps>(
  ({ active = false, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn('admin-nav-item w-full justify-start px-3 py-2.5', active && 'admin-nav-item-active', className)}
      {...props}
    />
  ),
)

AdminNavButton.displayName = 'AdminNavButton'

export default AdminNavButton
