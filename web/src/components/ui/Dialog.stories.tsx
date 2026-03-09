import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'

function DialogFixture(): JSX.Element {
  return (
    <Dialog open>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Rotate token secret</DialogTitle>
          <DialogDescription>
            Confirm the action before the regenerated secret is copied to your clipboard.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          This is the same Radix dialog shell now used by PublicHome, TokenDetail, ApiKeysValidationDialog, and AdminDashboard.
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const meta = {
  title: 'UI/Dialog',
  component: DialogFixture,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Radix dialog primitive fixture used to verify focus trapping, footer layouts, and close-button suppression for the migrated modal flows.',
      },
    },
  },
  render: () => <DialogFixture />,
} satisfies Meta<typeof DialogFixture>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}

export const OpenMobileWidth: Story = {
  parameters: {
    viewport: { defaultViewport: '0390-device-iphone-14' },
  },
}
