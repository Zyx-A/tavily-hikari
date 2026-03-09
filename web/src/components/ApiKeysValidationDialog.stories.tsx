import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  ApiKeysValidationDialog,
  computeExhaustedKeys,
  computeValidKeys,
  computeValidationCounts,
  type KeysValidationState,
} from './ApiKeysValidationDialog'

function ValidationDialogHarness(props: { initial: KeysValidationState }): JSX.Element {
  const [state, setState] = useState<KeysValidationState | null>(props.initial)

  const counts = useMemo(() => computeValidationCounts(state), [state])
  const validKeys = useMemo(() => computeValidKeys(state), [state])
  const exhaustedKeys = useMemo(() => computeExhaustedKeys(state), [state])

  return (
    <ApiKeysValidationDialog
      state={state}
      counts={counts}
      validKeys={validKeys}
      exhaustedKeys={exhaustedKeys}
      onClose={() => setState(null)}
      onRetryFailed={() => {
        setState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            rows: prev.rows.map((row) =>
              row.status === 'unauthorized' || row.status === 'forbidden' || row.status === 'invalid' || row.status === 'error'
                ? {
                    ...row,
                    status: 'ok',
                    detail: undefined,
                    attempts: row.attempts + 1,
                    quota_limit: 1000,
                    quota_remaining: 999,
                  }
                : row,
            ),
          }
        })
      }}
      onRetryOne={(apiKey) => {
        setState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            rows: prev.rows.map((row) =>
              row.api_key === apiKey && (row.status === 'unauthorized' || row.status === 'forbidden' || row.status === 'invalid' || row.status === 'error')
                ? {
                    ...row,
                    status: 'ok',
                    detail: undefined,
                    attempts: row.attempts + 1,
                    quota_limit: 1000,
                    quota_remaining: 888,
                  }
                : row,
            ),
          }
        })
      }}
      onImportValid={() => {
        setState((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            importing: false,
            importReport: {
              summary: {
                input_lines: prev.input_lines,
                valid_lines: prev.valid_lines,
                unique_in_input: prev.unique_in_input,
                duplicate_in_input: prev.duplicate_in_input,
                created: 1,
                undeleted: 0,
                existed: 1,
                failed: 0,
              },
              results: [
                { api_key: 'tvly-OK-NEW', status: 'created' },
                { api_key: 'tvly-OK-EXISTING', status: 'existed' },
              ],
            },
          }
        })
      }}
    />
  )
}

const meta = {
  title: 'Admin/ApiKeysValidationDialog',
  component: ValidationDialogHarness,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Desktop Dialog plus mobile Drawer fixture for the API key validation flow. Stories cover mixed results, in-progress validation, retry/import actions, and the responsive shell split required by production.',
      },
    },
  },
  render: (args) => <ValidationDialogHarness {...args} />,
} satisfies Meta<typeof ValidationDialogHarness>

export default meta

type Story = StoryObj<typeof meta>

const mixedResultsState: KeysValidationState = {
  group: 'default',
  input_lines: 7,
  valid_lines: 6,
  unique_in_input: 5,
  duplicate_in_input: 1,
  checking: false,
  importing: false,
  rows: [
    { api_key: 'tvly-OK-NEW', status: 'ok', quota_limit: 1000, quota_remaining: 123, attempts: 1 },
    { api_key: 'tvly-OK-EXHAUSTED', status: 'ok_exhausted', quota_limit: 1000, quota_remaining: 0, attempts: 1 },
    {
      api_key: 'tvly-UNAUTHORIZED',
      status: 'unauthorized',
      detail: 'Tavily usage request failed with 401 Unauthorized. This usually means the key is invalid or revoked.',
      attempts: 1,
    },
    {
      api_key: 'tvly-ERROR',
      status: 'error',
      detail: 'Upstream returned 502 Bad Gateway. Use retry to re-run a subset of rows.',
      attempts: 1,
    },
    { api_key: 'tvly-OK-NEW', status: 'duplicate_in_input', attempts: 0 },
  ],
}

export const MixedResultsDesktop: Story = {
  args: {
    initial: mixedResultsState,
  },
  parameters: {
    viewport: { defaultViewport: '1440-device-desktop' },
    docs: {
      description: {
        story: 'Desktop dialog state with mixed statuses, per-row retry buttons, and the footer action cluster migrated to shadcn Buttons.',
      },
    },
  },
}

export const MixedResultsMobileDrawer: Story = {
  args: {
    initial: mixedResultsState,
  },
  parameters: {
    viewport: { defaultViewport: '0390-device-iphone-14' },
    docs: {
      description: {
        story: 'Small viewport variant confirming that the mobile flow still uses `Drawer` while the footer actions stay aligned with the desktop button API.',
      },
    },
  },
}

export const CheckingInProgress: Story = {
  args: {
    initial: {
      group: 'default',
      input_lines: 3,
      valid_lines: 3,
      unique_in_input: 3,
      duplicate_in_input: 0,
      checking: true,
      importing: false,
      rows: [
        { api_key: 'tvly-PENDING-1', status: 'pending', attempts: 0 },
        { api_key: 'tvly-PENDING-2', status: 'pending', attempts: 0 },
        { api_key: 'tvly-PENDING-3', status: 'pending', attempts: 0 },
      ],
    },
  },
}

export const PostImportWithWarning: Story = {
  args: {
    initial: {
      group: 'default',
      input_lines: 5,
      valid_lines: 1,
      unique_in_input: 1,
      duplicate_in_input: 0,
      checking: false,
      importing: false,
      importWarning: '1 valid key is quota-exhausted and will still be imported.',
      rows: [
        {
          api_key: 'tvly-INVALID-REMAINING',
          status: 'invalid',
          detail: '400 Bad Request',
          attempts: 1,
        },
      ],
      importReport: {
        summary: {
          input_lines: 5,
          valid_lines: 5,
          unique_in_input: 5,
          duplicate_in_input: 0,
          created: 2,
          undeleted: 1,
          existed: 1,
          failed: 1,
        },
        results: [
          { api_key: 'tvly-IMPORTED-1', status: 'created' },
          { api_key: 'tvly-IMPORTED-2', status: 'created' },
          { api_key: 'tvly-IMPORTED-3', status: 'undeleted' },
          { api_key: 'tvly-IMPORTED-4', status: 'existed' },
          { api_key: 'tvly-INVALID-REMAINING', status: 'failed', error: '400 Bad Request' },
        ],
      },
    },
  },
}
