import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from './drawer'

function DrawerFixture(): JSX.Element {
  return (
    <Drawer open shouldScaleBackground={false}>
      <DrawerContent className="max-h-[88vh]">
        <DrawerHeader>
          <DrawerTitle>Validation results</DrawerTitle>
          <DrawerDescription>
            Mobile shell used by the API key validation flow when the viewport collapses below the desktop dialog breakpoint.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-2 text-sm text-muted-foreground">
          Keep this story on a phone viewport to review the retained Drawer behavior.
        </div>
        <DrawerFooter>
          <Button variant="outline">Close</Button>
          <Button>Import valid keys</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const meta = {
  title: 'UI/Drawer',
  component: DrawerFixture,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: '0390-device-iphone-14' },
    docs: {
      description: {
        component:
          'Vaul drawer primitive used as the mobile fallback for API key validation while desktop uses the shared Dialog primitive.',
      },
    },
  },
  render: () => <DrawerFixture />,
} satisfies Meta<typeof DrawerFixture>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}
