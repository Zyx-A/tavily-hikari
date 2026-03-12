import type { Meta, StoryObj } from '@storybook/react-vite'

import ForwardProxySettingsModule from './ForwardProxySettingsModule'
import { LanguageProvider, useTranslate } from '../i18n'

function StoryCanvas(): JSX.Element {
  const strings = useTranslate().admin.proxySettings

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        color: 'hsl(var(--foreground))',
        background: [
          'radial-gradient(1000px 520px at 6% -8%, hsl(var(--primary) / 0.14), transparent 62%)',
          'radial-gradient(900px 460px at 95% -14%, hsl(var(--accent) / 0.12), transparent 64%)',
          'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 62%, hsl(var(--muted) / 0.58) 100%)',
          'hsl(var(--background))',
        ].join(', '),
      }}
    >
      <ForwardProxySettingsModule
        strings={strings}
        draft={{
          proxyUrlsText: 'http://127.0.0.1:8080\nsocks5h://127.0.0.1:1080',
          subscriptionUrlsText: 'https://example.com/subscription.base64',
          subscriptionUpdateIntervalSecs: '3600',
          insertDirect: true,
        }}
        settingsLoadState="ready"
        statsLoadState="ready"
        settingsError={null}
        statsError={null}
        saveError={null}
        validationError={null}
        saving={false}
        validatingKind={null}
        savedAt={Date.now()}
        validationEntries={[
          {
            id: 'subscription-1',
            kind: 'subscriptionUrl',
            value: 'https://example.com/subscription.base64',
            result: {
              ok: true,
              message: 'subscription validation succeeded',
              normalizedValue: 'https://example.com/subscription.base64',
              discoveredNodes: 3,
              latencyMs: 182.5,
            },
          },
          {
            id: 'proxy-1',
            kind: 'proxyUrl',
            value: 'vmess://demo',
            result: {
              ok: false,
              message: 'xray binary is missing',
              normalizedValue: 'vmess://demo',
              discoveredNodes: 0,
              latencyMs: null,
            },
          },
        ]}
        settings={{
          proxyUrls: ['http://127.0.0.1:8080', 'socks5h://127.0.0.1:1080'],
          subscriptionUrls: ['https://example.com/subscription.base64'],
          subscriptionUpdateIntervalSecs: 3600,
          insertDirect: true,
          nodes: [
            {
              key: 'node-a',
              source: 'subscription',
              displayName: 'Tokyo-A',
              endpointUrl: 'socks5h://127.0.0.1:30001',
              weight: 0.91,
              penalized: false,
              primaryAssignmentCount: 3,
              secondaryAssignmentCount: 1,
              stats: {
                oneMinute: { attempts: 5, successRate: 1, avgLatencyMs: 121 },
                fifteenMinutes: { attempts: 22, successRate: 0.95, avgLatencyMs: 132 },
                oneHour: { attempts: 96, successRate: 0.94, avgLatencyMs: 141 },
                oneDay: { attempts: 1180, successRate: 0.93, avgLatencyMs: 155 },
                sevenDays: { attempts: 7420, successRate: 0.91, avgLatencyMs: 163 },
              },
            },
            {
              key: 'direct',
              source: 'direct',
              displayName: 'Direct',
              endpointUrl: null,
              weight: 1,
              penalized: false,
              primaryAssignmentCount: 0,
              secondaryAssignmentCount: 2,
              stats: {
                oneMinute: { attempts: 0, successRate: null, avgLatencyMs: null },
                fifteenMinutes: { attempts: 0, successRate: null, avgLatencyMs: null },
                oneHour: { attempts: 4, successRate: 1, avgLatencyMs: 210 },
                oneDay: { attempts: 10, successRate: 1, avgLatencyMs: 205 },
                sevenDays: { attempts: 12, successRate: 1, avgLatencyMs: 207 },
              },
            },
          ],
        }}
        stats={{
          rangeStart: '2026-03-12T00:00:00Z',
          rangeEnd: '2026-03-13T00:00:00Z',
          bucketSeconds: 3600,
          nodes: [
            {
              key: 'node-a',
              source: 'subscription',
              displayName: 'Tokyo-A',
              endpointUrl: 'socks5h://127.0.0.1:30001',
              weight: 0.91,
              penalized: false,
              primaryAssignmentCount: 3,
              secondaryAssignmentCount: 1,
              stats: {
                oneMinute: { attempts: 5, successRate: 1, avgLatencyMs: 121 },
                fifteenMinutes: { attempts: 22, successRate: 0.95, avgLatencyMs: 132 },
                oneHour: { attempts: 96, successRate: 0.94, avgLatencyMs: 141 },
                oneDay: { attempts: 1180, successRate: 0.93, avgLatencyMs: 155 },
                sevenDays: { attempts: 7420, successRate: 0.91, avgLatencyMs: 163 },
              },
              last24h: [
                {
                  bucketStart: '2026-03-12T00:00:00Z',
                  bucketEnd: '2026-03-12T01:00:00Z',
                  successCount: 22,
                  failureCount: 1,
                },
                {
                  bucketStart: '2026-03-12T01:00:00Z',
                  bucketEnd: '2026-03-12T02:00:00Z',
                  successCount: 18,
                  failureCount: 2,
                },
              ],
              weight24h: [
                {
                  bucketStart: '2026-03-12T00:00:00Z',
                  bucketEnd: '2026-03-12T01:00:00Z',
                  sampleCount: 1,
                  minWeight: 0.86,
                  maxWeight: 0.93,
                  avgWeight: 0.9,
                  lastWeight: 0.91,
                },
              ],
            },
            {
              key: 'direct',
              source: 'direct',
              displayName: 'Direct',
              endpointUrl: null,
              weight: 1,
              penalized: false,
              primaryAssignmentCount: 0,
              secondaryAssignmentCount: 2,
              stats: {
                oneMinute: { attempts: 0, successRate: null, avgLatencyMs: null },
                fifteenMinutes: { attempts: 0, successRate: null, avgLatencyMs: null },
                oneHour: { attempts: 4, successRate: 1, avgLatencyMs: 210 },
                oneDay: { attempts: 10, successRate: 1, avgLatencyMs: 205 },
                sevenDays: { attempts: 12, successRate: 1, avgLatencyMs: 207 },
              },
              last24h: [
                {
                  bucketStart: '2026-03-12T00:00:00Z',
                  bucketEnd: '2026-03-12T01:00:00Z',
                  successCount: 2,
                  failureCount: 0,
                },
              ],
              weight24h: [
                {
                  bucketStart: '2026-03-12T00:00:00Z',
                  bucketEnd: '2026-03-12T01:00:00Z',
                  sampleCount: 1,
                  minWeight: 1,
                  maxWeight: 1,
                  avgWeight: 1,
                  lastWeight: 1,
                },
              ],
            },
          ],
        }}
        onProxyUrlsTextChange={() => {}}
        onSubscriptionUrlsTextChange={() => {}}
        onIntervalChange={() => {}}
        onInsertDirectChange={() => {}}
        onSave={() => {}}
        onValidateSubscriptions={() => {}}
        onValidateManual={() => {}}
        onRefresh={() => {}}
      />
    </div>
  )
}

const meta = {
  title: 'Admin/ForwardProxySettingsModule',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <LanguageProvider>
        <Story />
      </LanguageProvider>
    ),
  ],
} satisfies Meta<typeof ForwardProxySettingsModule>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <StoryCanvas />,
}
