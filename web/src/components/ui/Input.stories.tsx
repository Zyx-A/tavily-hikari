import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Text input primitive used for token fields, admin search bars, and quota overrides. Stories include the password-manager-safe attributes kept on the PublicHome token input path.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Input {...args} />
    </div>
  ),
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Search users, tokens, or API keys',
  },
}

export const TokenField: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Input
        name="not-a-login-field"
        placeholder="Enter access token"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-autocomplete="none"
        inputMode="text"
        data-1p-ignore="true"
        data-lpignore="true"
        data-form-type="other"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Fixture for the token input contract that avoids password-manager heuristics while staying on the shared `Input` primitive.',
      },
    },
  },
}
