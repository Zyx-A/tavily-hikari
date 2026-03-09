import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import AdminShell, { type AdminNavItem } from './AdminShell'
import type { AdminModuleId } from './routes'

const NAV_ITEMS: AdminNavItem[] = [
  { module: 'dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard-outline' },
  { module: 'tokens', label: 'Tokens', icon: 'mdi:key-chain-variant' },
  { module: 'keys', label: 'API Keys', icon: 'mdi:key-outline' },
  { module: 'requests', label: 'Requests', icon: 'mdi:file-document-outline' },
  { module: 'jobs', label: 'Jobs', icon: 'mdi:calendar-clock-outline' },
  { module: 'users', label: 'Users', icon: 'mdi:account-group-outline' },
]

function AdminShellFixture(): JSX.Element {
  const [activeModule, setActiveModule] = useState<AdminModuleId>('tokens')

  return (
    <AdminShell
      activeModule={activeModule}
      navItems={NAV_ITEMS}
      skipToContentLabel="Skip to main content"
      onSelectModule={setActiveModule}
    >
      <section className="surface panel">
        <div className="panel-header">
          <div>
            <h2>Admin shell fixture</h2>
            <p className="panel-description">
              Use this story to verify the wrapper-managed navigation buttons across desktop and stacked/mobile layouts.
            </p>
          </div>
        </div>
        <div className="empty-state alert">Selected module: {activeModule}</div>
      </section>
    </AdminShell>
  )
}

const meta = {
  title: 'Admin/AdminShell',
  component: AdminShellFixture,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Admin shell fixture focused on the `AdminNavButton` wrapper, mobile menu toggle, and the active/collapsed semantics kept during the shadcn convergence.',
      },
    },
  },
  render: () => <AdminShellFixture />,
} satisfies Meta<typeof AdminShellFixture>

export default meta

type Story = StoryObj<typeof meta>

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: '1440-device-desktop' },
  },
}

export const StackedMobile: Story = {
  parameters: {
    viewport: { defaultViewport: '0767-breakpoint-small-max' },
  },
}
