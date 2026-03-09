import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import QuotaRangeInput from './QuotaRangeInput'
import {
  buildQuotaSliderTrack,
  clampQuotaSliderStageIndex,
  createQuotaSliderSeed,
  getQuotaSliderStagePosition,
  getQuotaSliderStageValue,
} from './quotaSlider'

function QuotaRangeStoryCanvas(): JSX.Element {
  const seed = useMemo(() => createQuotaSliderSeed('dailyLimit', 128, 1000), [])
  const [limit, setLimit] = useState(seed.initialLimit)
  const position = getQuotaSliderStagePosition(seed.stages, limit)

  return (
    <div className="surface panel" style={{ width: 420 }}>
      <div className="panel-header">
        <div>
          <h2 style={{ margin: 0 }}>Daily quota</h2>
          <p className="panel-description">Controlled wrapper around the native range input used in AdminDashboard.</p>
        </div>
      </div>
      <div className="quota-control-row">
        <div className="quota-slider-wrap">
          <QuotaRangeInput
            min={0}
            max={Math.max(0, seed.stages.length - 1)}
            step="any"
            value={position}
            onChange={(event) => {
              const nextIndex = clampQuotaSliderStageIndex(seed.stages, Number.parseFloat(event.target.value))
              setLimit(getQuotaSliderStageValue(seed.stages, nextIndex))
            }}
            style={{ background: buildQuotaSliderTrack(seed.stages, seed.used, limit) }}
            aria-label="Daily quota"
          />
          <span className="panel-description">{seed.used} / {limit}</span>
        </div>
      </div>
    </div>
  )
}

const meta = {
  title: 'Admin/QuotaRangeInput',
  component: QuotaRangeStoryCanvas,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Controlled wrapper that keeps the native `range` element out of business pages while preserving the custom quota track rendering used by AdminDashboard.',
      },
    },
  },
  render: () => <QuotaRangeStoryCanvas />,
} satisfies Meta<typeof QuotaRangeStoryCanvas>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
