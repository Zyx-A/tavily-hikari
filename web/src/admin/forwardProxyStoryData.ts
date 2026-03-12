import type { ForwardProxySettings, ForwardProxyStatsResponse } from '../api'

import type { ForwardProxyDraft, ForwardProxyValidationEntry } from './ForwardProxySettingsModule'

const STORY_TIME_MS = Date.parse('2026-03-13T02:55:00Z')

export const forwardProxyStorySavedAt = STORY_TIME_MS

export const forwardProxyStoryDraft: ForwardProxyDraft = {
  proxyUrlsText: 'http://127.0.0.1:8080\nsocks5h://127.0.0.1:1080\nss://demo-node',
  subscriptionUrlsText: 'https://example.com/subscription.base64\nhttps://mirror.example.com/proxy-feed.txt',
  subscriptionUpdateIntervalSecs: '3600',
  insertDirect: true,
}

export const forwardProxyStoryValidationEntries: ForwardProxyValidationEntry[] = [
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
    id: 'subscription-2',
    kind: 'subscriptionUrl',
    value: 'https://mirror.example.com/proxy-feed.txt',
    result: {
      ok: true,
      message: 'subscription mirror reachable',
      normalizedValue: 'https://mirror.example.com/proxy-feed.txt',
      discoveredNodes: 2,
      latencyMs: 96.2,
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
]

export const forwardProxyStorySettings: ForwardProxySettings = {
  proxyUrls: ['http://127.0.0.1:8080', 'socks5h://127.0.0.1:1080', 'ss://demo-node'],
  subscriptionUrls: ['https://example.com/subscription.base64', 'https://mirror.example.com/proxy-feed.txt'],
  subscriptionUpdateIntervalSecs: 3600,
  insertDirect: true,
  nodes: [
    {
      key: 'node-tokyo-a',
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
      key: 'node-frankfurt-b',
      source: 'manual',
      displayName: 'Frankfurt-B',
      endpointUrl: 'http://127.0.0.1:8080',
      weight: 0.37,
      penalized: true,
      primaryAssignmentCount: 1,
      secondaryAssignmentCount: 2,
      stats: {
        oneMinute: { attempts: 1, successRate: 0, avgLatencyMs: 820 },
        fifteenMinutes: { attempts: 8, successRate: 0.5, avgLatencyMs: 466 },
        oneHour: { attempts: 31, successRate: 0.58, avgLatencyMs: 338 },
        oneDay: { attempts: 202, successRate: 0.61, avgLatencyMs: 305 },
        sevenDays: { attempts: 1390, successRate: 0.67, avgLatencyMs: 284 },
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
}

export const forwardProxyStoryStats: ForwardProxyStatsResponse = {
  rangeStart: '2026-03-12T00:00:00Z',
  rangeEnd: '2026-03-13T00:00:00Z',
  bucketSeconds: 3600,
  nodes: [
    {
      key: 'node-tokyo-a',
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
      key: 'node-frankfurt-b',
      source: 'manual',
      displayName: 'Frankfurt-B',
      endpointUrl: 'http://127.0.0.1:8080',
      weight: 0.37,
      penalized: true,
      primaryAssignmentCount: 1,
      secondaryAssignmentCount: 2,
      stats: {
        oneMinute: { attempts: 1, successRate: 0, avgLatencyMs: 820 },
        fifteenMinutes: { attempts: 8, successRate: 0.5, avgLatencyMs: 466 },
        oneHour: { attempts: 31, successRate: 0.58, avgLatencyMs: 338 },
        oneDay: { attempts: 202, successRate: 0.61, avgLatencyMs: 305 },
        sevenDays: { attempts: 1390, successRate: 0.67, avgLatencyMs: 284 },
      },
      last24h: [
        {
          bucketStart: '2026-03-12T00:00:00Z',
          bucketEnd: '2026-03-12T01:00:00Z',
          successCount: 3,
          failureCount: 4,
        },
        {
          bucketStart: '2026-03-12T01:00:00Z',
          bucketEnd: '2026-03-12T02:00:00Z',
          successCount: 5,
          failureCount: 3,
        },
      ],
      weight24h: [
        {
          bucketStart: '2026-03-12T00:00:00Z',
          bucketEnd: '2026-03-12T01:00:00Z',
          sampleCount: 2,
          minWeight: 0.28,
          maxWeight: 0.55,
          avgWeight: 0.41,
          lastWeight: 0.37,
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
}
