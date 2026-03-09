import { Icon } from '@iconify/react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import AdminNavButton from './AdminNavButton'

const meta = {
  title: 'Admin/AdminNavButton',
  component: AdminNavButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Navigation button wrapper built on top of `buttonVariants`, keeping AdminShell active, hover, focus, and stacked/mobile semantics in one place.',
      },
    },
  },
  render: (args) => (
    <div className="admin-sidebar surface" style={{ width: 240 }}>
      <nav className="admin-sidebar-nav">
        <AdminNavButton {...args}>
          <Icon icon="mdi:view-dashboard-outline" width={18} height={18} />
          <span>Dashboard</span>
        </AdminNavButton>
      </nav>
    </div>
  ),
} satisfies Meta<typeof AdminNavButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    active: false,
  },
}

export const Active: Story = {
  args: {
    active: true,
  },
}
