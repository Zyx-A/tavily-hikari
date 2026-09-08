import { describe, expect, it } from 'bun:test'

import {
  buildRequestLogsCatalogPlan,
  buildRequestLogsListPlan,
  createEmptyRequestLogsListPage,
} from './requestLogsUi'

describe('requestLogsUi helpers', () => {
  it('builds filtered request log list queries and preserves cursor navigation params', () => {
    expect(
      buildRequestLogsListPlan({
        limit: 20,
        cursor: '300:3',
        direction: 'older',
        requestKinds: ['api:search'],
        result: 'error',
        keyEffect: 'quarantined',
        keyId: 'K001',
      }),
    ).toEqual({
      kind: 'fetch',
      query: {
        limit: 20,
        cursor: '300:3',
        direction: 'older',
        requestKinds: ['api:search'],
        result: 'error',
        keyEffect: 'quarantined',
        keyId: 'K001',
      },
    })
  })

  it('short-circuits only the list fetch when the current request-type selection has no match', () => {
    expect(buildRequestLogsListPlan({ limit: 20, hasEmptyMatch: true })).toEqual({ kind: 'empty' })
    expect(buildRequestLogsCatalogPlan({ requestKinds: ['api:search'] })).toEqual({
      kind: 'fetch',
      query: {},
    })
  })

  it('builds scope-only catalog queries without pagination or active filters', () => {
    expect(
      buildRequestLogsCatalogPlan({
        requestKinds: ['mcp:search'],
        result: 'quota_exhausted',
        tokenId: 'T001',
        keyId: 'K001',
        sinceIso: '2026-04-01T00:00:00+08:00',
        untilIso: '2026-04-02T00:00:00+08:00',
      }),
    ).toEqual({
      kind: 'fetch',
      query: {
        sinceIso: '2026-04-01T00:00:00+08:00',
        untilIso: '2026-04-02T00:00:00+08:00',
      },
    })
  })

  it('builds an empty cursor page shell with stable pagination defaults', () => {
    expect(createEmptyRequestLogsListPage(50)).toEqual({
      items: [],
      pageSize: 50,
      nextCursor: null,
      prevCursor: null,
      hasOlder: false,
      hasNewer: false,
    })
  })
})
