import type { Meta, StoryObj } from '@storybook/react-vite'

import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Textarea primitive now used for batch API key imports and token batch share output, replacing `.textarea` as the primary interaction surface.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 480 }}>
      <Textarea {...args} />
    </div>
  ),
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    rows: 5,
    placeholder: 'Paste one key per line',
  },
}

export const ReadOnlyBatchOutput: Story = {
  args: {
    readOnly: true,
    rows: 6,
    value: 'https://example.com/#th-1\nhttps://example.com/#th-2\nhttps://example.com/#th-3',
    className: 'resize-none',
  },
}
