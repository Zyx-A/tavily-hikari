import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

function SelectStory(props: { width?: number }): JSX.Element {
  const [value, setValue] = useState('all')

  return (
    <div style={{ width: props.width ?? 220 }}>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Request filter">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="success">Success</SelectItem>
          <SelectItem value="error">Errors</SelectItem>
          <SelectItem value="quota_exhausted">Quota exhausted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

const meta = {
  title: 'UI/Select',
  component: SelectStory,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Shared select primitive used by TokenDetail and AdminDashboard filter bars for period and page-size controls.',
      },
    },
  },
  render: (args) => <SelectStory {...args} />,
} satisfies Meta<typeof SelectStory>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const MobileWidth: Story = {
  args: {
    width: 176,
  },
  parameters: {
    viewport: { defaultViewport: '0390-device-iphone-14' },
  },
}
