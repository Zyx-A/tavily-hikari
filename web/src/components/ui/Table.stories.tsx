import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

function TableFixture(): JSX.Element {
  return (
    <div style={{ width: 860 }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>HTTP</TableHead>
            <TableHead>MCP</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>2026-03-09 18:42:10</TableCell>
            <TableCell>200</TableCell>
            <TableCell>0</TableCell>
            <TableCell><Badge variant="success">Success</Badge></TableCell>
            <TableCell>-</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2026-03-09 18:39:54</TableCell>
            <TableCell>429</TableCell>
            <TableCell>-1</TableCell>
            <TableCell><Badge variant="warning">Quota exhausted</Badge></TableCell>
            <TableCell>quota exhausted</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

const meta = {
  title: 'UI/Table',
  component: TableFixture,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Table primitive used by TokenDetail, ApiKeysValidationDialog, and the AdminDashboard log/report views after moving away from `.table` as the main layout skeleton.',
      },
    },
  },
  render: () => <TableFixture />,
} satisfies Meta<typeof TableFixture>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
