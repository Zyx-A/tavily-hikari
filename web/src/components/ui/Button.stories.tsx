import { Icon } from '@iconify/react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Primary button primitive used across the shadcn migration. Stories highlight the variants now used for primary, outline, warning, success, and icon-only admin interactions.',
      },
    },
  },
  args: {
    children: 'Save changes',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="success">Success</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Core variants used by PublicHome, TokenDetail, AdminShell, and AdminDashboard after removing the DaisyUI `.btn` mainline dependency.',
      },
    },
  },
}

export const IconAndBusyStates: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="icon" variant="ghost" aria-label="Refresh">
        <Icon icon="mdi:refresh" width={18} height={18} />
      </Button>
      <Button aria-busy>
        <Icon icon="mdi:loading" width={18} height={18} className="icon-spin" />
        <span>Syncing</span>
      </Button>
      <Button variant="success">
        <Icon icon="mdi:check-bold" width={18} height={18} />
        <span>Copied</span>
      </Button>
    </div>
  ),
}
