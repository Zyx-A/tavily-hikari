import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Table } from '../components/ui/table'
import AdminLoadingRegion from '../components/AdminLoadingRegion'
import type {
  ForwardProxySettings,
  ForwardProxyStatsNode,
  ForwardProxyStatsResponse,
  ForwardProxyValidationKind,
  ForwardProxyValidationResponse,
  ForwardProxyWeightBucket,
  ForwardProxyWindowStats,
} from '../api'
import type { AdminTranslations } from '../i18n'
import type { QueryLoadState } from './queryLoadState'

const numberFormatter = new Intl.NumberFormat()
const decimalFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})
const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type NodeWindowKey = 'oneMinute' | 'fifteenMinutes' | 'oneHour' | 'oneDay' | 'sevenDays'

const WINDOW_KEYS: Array<{ key: NodeWindowKey; translationKey: keyof AdminTranslations['proxySettings']['windows'] }> = [
  { key: 'oneMinute', translationKey: 'oneMinute' },
  { key: 'fifteenMinutes', translationKey: 'fifteenMinutes' },
  { key: 'oneHour', translationKey: 'oneHour' },
  { key: 'oneDay', translationKey: 'oneDay' },
  { key: 'sevenDays', translationKey: 'sevenDays' },
]

export interface ForwardProxyDraft {
  proxyUrlsText: string
  subscriptionUrlsText: string
  subscriptionUpdateIntervalSecs: string
  insertDirect: boolean
}

export interface ForwardProxyValidationEntry {
  id: string
  kind: ForwardProxyValidationKind
  value: string
  result: ForwardProxyValidationResponse
}

interface ForwardProxySettingsModuleProps {
  strings: AdminTranslations['proxySettings']
  draft: ForwardProxyDraft
  settings: ForwardProxySettings | null
  stats: ForwardProxyStatsResponse | null
  settingsLoadState: QueryLoadState
  statsLoadState: QueryLoadState
  settingsError: string | null
  statsError: string | null
  saveError: string | null
  validationError: string | null
  saving: boolean
  validatingKind: ForwardProxyValidationKind | null
  savedAt: number | null
  validationEntries: ForwardProxyValidationEntry[]
  onProxyUrlsTextChange: (value: string) => void
  onSubscriptionUrlsTextChange: (value: string) => void
  onIntervalChange: (value: string) => void
  onInsertDirectChange: (value: boolean) => void
  onSave: () => void
  onValidateSubscriptions: () => void
  onValidateManual: () => void
  onRefresh: () => void
}

function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return numberFormatter.format(value)
}

function formatDecimal(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return decimalFormatter.format(value)
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  const normalized = value > 1 ? value / 100 : value
  return percentFormatter.format(Math.max(0, normalized))
}

function formatLatency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${decimalFormatter.format(value)} ms`
}

function formatTimeRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start || !end) return '—'
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '—'
  return `${dateTimeFormatter.format(startDate)} - ${dateTimeFormatter.format(endDate)}`
}

function computeSuccessRate(stats: ForwardProxyWindowStats): number | null {
  if (typeof stats.successRate === 'number') {
    return stats.successRate
  }
  const success = stats.successCount ?? null
  const failure = stats.failureCount ?? null
  if (success == null || failure == null) {
    return null
  }
  const total = success + failure
  return total > 0 ? success / total : null
}

function buildMergedNodes(
  settings: ForwardProxySettings | null,
  stats: ForwardProxyStatsResponse | null,
): ForwardProxyStatsNode[] {
  const nodeMap = new Map<string, ForwardProxyStatsNode>()

  for (const node of settings?.nodes ?? []) {
    nodeMap.set(node.key, {
      ...node,
      last24h: [],
      weight24h: [],
    })
  }

  for (const node of stats?.nodes ?? []) {
    const previous = nodeMap.get(node.key)
    nodeMap.set(node.key, {
      ...(previous ?? node),
      ...node,
      stats: node.stats ?? previous?.stats ?? {
        oneMinute: { attempts: 0 },
        fifteenMinutes: { attempts: 0 },
        oneHour: { attempts: 0 },
        oneDay: { attempts: 0 },
        sevenDays: { attempts: 0 },
      },
      last24h: node.last24h ?? previous?.last24h ?? [],
      weight24h: node.weight24h ?? previous?.weight24h ?? [],
    })
  }

  return Array.from(nodeMap.values()).sort((left, right) => {
    if (left.source === 'direct' && right.source !== 'direct') return 1
    if (left.source !== 'direct' && right.source === 'direct') return -1
    if (left.penalized !== right.penalized) return left.penalized ? 1 : -1
    return right.weight - left.weight || left.displayName.localeCompare(right.displayName)
  })
}

function summarizeActivity(node: ForwardProxyStatsNode): { success: number; failure: number } {
  return node.last24h.reduce(
    (accumulator, bucket) => {
      accumulator.success += bucket.successCount
      accumulator.failure += bucket.failureCount
      return accumulator
    },
    { success: 0, failure: 0 },
  )
}

function summarizeWeight(weight24h: ForwardProxyWeightBucket[]): {
  avgWeight: number | null
  minWeight: number | null
  maxWeight: number | null
  lastWeight: number | null
} {
  if (weight24h.length === 0) {
    return {
      avgWeight: null,
      minWeight: null,
      maxWeight: null,
      lastWeight: null,
    }
  }

  let totalSamples = 0
  let weightedTotal = 0
  let minWeight = Number.POSITIVE_INFINITY
  let maxWeight = Number.NEGATIVE_INFINITY

  for (const bucket of weight24h) {
    const sampleCount = Math.max(1, bucket.sampleCount)
    totalSamples += sampleCount
    weightedTotal += bucket.avgWeight * sampleCount
    minWeight = Math.min(minWeight, bucket.minWeight)
    maxWeight = Math.max(maxWeight, bucket.maxWeight)
  }

  const lastBucket = weight24h[weight24h.length - 1]
  return {
    avgWeight: totalSamples > 0 ? weightedTotal / totalSamples : null,
    minWeight: Number.isFinite(minWeight) ? minWeight : null,
    maxWeight: Number.isFinite(maxWeight) ? maxWeight : null,
    lastWeight: lastBucket?.lastWeight ?? null,
  }
}

function getSourceLabel(strings: AdminTranslations['proxySettings'], source: string): string {
  if (source === 'manual') return strings.sources.manual
  if (source === 'subscription') return strings.sources.subscription
  if (source === 'direct') return strings.sources.direct
  return strings.sources.unknown
}

function getNodeStateBadge(
  strings: AdminTranslations['proxySettings'],
  node: ForwardProxyStatsNode,
): { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' } {
  if (node.source === 'direct') {
    return { label: strings.states.direct, variant: 'info' }
  }
  if (node.penalized) {
    return { label: strings.states.penalized, variant: 'warning' }
  }
  return { label: strings.states.ready, variant: 'success' }
}

export default function ForwardProxySettingsModule({
  strings,
  draft,
  settings,
  stats,
  settingsLoadState,
  statsLoadState,
  settingsError,
  statsError,
  saveError,
  validationError,
  saving,
  validatingKind,
  savedAt,
  validationEntries,
  onProxyUrlsTextChange,
  onSubscriptionUrlsTextChange,
  onIntervalChange,
  onInsertDirectChange,
  onSave,
  onValidateSubscriptions,
  onValidateManual,
  onRefresh,
}: ForwardProxySettingsModuleProps): JSX.Element {
  const mergedNodes = buildMergedNodes(settings, stats)
  const totalPrimaryAssignments = mergedNodes.reduce((sum, node) => sum + node.primaryAssignmentCount, 0)
  const totalSecondaryAssignments = mergedNodes.reduce((sum, node) => sum + node.secondaryAssignmentCount, 0)
  const penalizedCount = mergedNodes.filter((node) => node.penalized).length
  const readyCount = mergedNodes.length - penalizedCount
  const validatingSubscriptions = validatingKind === 'subscriptionUrl'
  const validatingManual = validatingKind === 'proxyUrl'

  const summaryCards = [
    {
      key: 'nodes',
      label: strings.summary.configuredNodes,
      value: formatNumber(mergedNodes.length),
      hint: strings.summary.configuredNodesHint,
    },
    {
      key: 'ready',
      label: strings.summary.readyNodes,
      value: formatNumber(readyCount),
      hint: strings.summary.readyNodesHint,
    },
    {
      key: 'penalized',
      label: strings.summary.penalizedNodes,
      value: formatNumber(penalizedCount),
      hint: strings.summary.penalizedNodesHint,
    },
    {
      key: 'subscriptions',
      label: strings.summary.subscriptions,
      value: formatNumber(settings?.subscriptionUrls.length ?? 0),
      hint: strings.summary.subscriptionsHint,
    },
    {
      key: 'manual',
      label: strings.summary.manualNodes,
      value: formatNumber(settings?.proxyUrls.length ?? 0),
      hint: strings.summary.manualNodesHint,
    },
    {
      key: 'assignments',
      label: strings.summary.assignmentSpread,
      value: `${formatNumber(totalPrimaryAssignments)} / ${formatNumber(totalSecondaryAssignments)}`,
      hint: strings.summary.assignmentSpreadHint,
    },
  ]

  return (
    <>
      <section className="surface panel">
        <div className="panel-header" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2>{strings.title}</h2>
            <p className="panel-description">{strings.description}</p>
          </div>
          <div className="forward-proxy-toolbar">
            <Button type="button" variant="outline" onClick={onRefresh}>
              {strings.actions.refresh}
            </Button>
            <Button type="button" onClick={onSave} disabled={saving}>
              {saving ? strings.actions.saving : strings.actions.save}
            </Button>
          </div>
        </div>

        <div className="forward-proxy-summary-grid">
          {summaryCards.map((card) => (
            <article key={card.key} className="forward-proxy-summary-card">
              <span className="forward-proxy-summary-label">{card.label}</span>
              <strong className="forward-proxy-summary-value">{card.value}</strong>
              <span className="forward-proxy-summary-hint">{card.hint}</span>
            </article>
          ))}
        </div>

        <div className="forward-proxy-range-row">
          <Badge variant="outline">{strings.summary.range}</Badge>
          <span className="panel-description">{formatTimeRange(stats?.rangeStart, stats?.rangeEnd)}</span>
          {savedAt != null && (
            <span className="panel-description">
              {strings.summary.savedAt.replace('{time}', dateTimeFormatter.format(new Date(savedAt)))}
            </span>
          )}
        </div>
      </section>

      <section className="surface panel">
        <div className="panel-header" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2>{strings.config.title}</h2>
            <p className="panel-description">{strings.config.description}</p>
          </div>
          <div className="forward-proxy-toolbar">
            <Button type="button" variant="outline" onClick={onValidateSubscriptions} disabled={validatingSubscriptions}>
              {validatingSubscriptions ? strings.actions.validatingSubscriptions : strings.actions.validateSubscriptions}
            </Button>
            <Button type="button" variant="outline" onClick={onValidateManual} disabled={validatingManual}>
              {validatingManual ? strings.actions.validatingManual : strings.actions.validateManual}
            </Button>
          </div>
        </div>

        {saveError && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 12 }}>
            {saveError}
          </div>
        )}
        {settingsError && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 12 }}>
            {settingsError}
          </div>
        )}

        <AdminLoadingRegion
          loadState={settingsLoadState}
          loadingLabel={strings.config.loading}
          errorLabel={settingsError || undefined}
          minHeight={220}
        >
          <div className="forward-proxy-config-grid">
            <article className="forward-proxy-editor-card">
              <div className="forward-proxy-editor-head">
                <div>
                  <h3>{strings.config.subscriptionsTitle}</h3>
                  <p className="panel-description">{strings.config.subscriptionsDescription}</p>
                </div>
                <Badge variant="info">{strings.sources.subscription}</Badge>
              </div>
              <Textarea
                rows={8}
                value={draft.subscriptionUrlsText}
                onChange={(event) => onSubscriptionUrlsTextChange(event.target.value)}
                placeholder={strings.config.subscriptionsPlaceholder}
                className="forward-proxy-textarea"
              />
            </article>

            <article className="forward-proxy-editor-card">
              <div className="forward-proxy-editor-head">
                <div>
                  <h3>{strings.config.manualTitle}</h3>
                  <p className="panel-description">{strings.config.manualDescription}</p>
                </div>
                <Badge variant="outline">{strings.sources.manual}</Badge>
              </div>
              <Textarea
                rows={8}
                value={draft.proxyUrlsText}
                onChange={(event) => onProxyUrlsTextChange(event.target.value)}
                placeholder={strings.config.manualPlaceholder}
                className="forward-proxy-textarea"
              />
            </article>
          </div>

          <div className="forward-proxy-form-footer">
            <label className="forward-proxy-field">
              <span className="forward-proxy-field-label">{strings.config.subscriptionIntervalLabel}</span>
              <Input
                type="number"
                inputMode="numeric"
                min={60}
                step={60}
                value={draft.subscriptionUpdateIntervalSecs}
                onChange={(event) => onIntervalChange(event.target.value)}
              />
              <span className="panel-description">{strings.config.subscriptionIntervalHint}</span>
            </label>

            <label className="forward-proxy-checkbox" htmlFor="forward-proxy-insert-direct">
              <input
                id="forward-proxy-insert-direct"
                type="checkbox"
                checked={draft.insertDirect}
                onChange={(event) => onInsertDirectChange(event.target.checked)}
              />
              <div>
                <strong>{strings.config.insertDirectLabel}</strong>
                <p className="panel-description">{strings.config.insertDirectHint}</p>
              </div>
            </label>
          </div>
        </AdminLoadingRegion>
      </section>

      <section className="surface panel">
        <div className="panel-header">
          <div>
            <h2>{strings.validation.title}</h2>
            <p className="panel-description">{strings.validation.description}</p>
          </div>
        </div>

        {validationError && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 12 }}>
            {validationError}
          </div>
        )}

        {validationEntries.length === 0 ? (
          <div className="empty-state alert">{strings.validation.empty}</div>
        ) : (
          <div className="forward-proxy-validation-grid">
            {validationEntries.map((entry) => {
              const resultTone = entry.result.ok ? 'success' : 'destructive'
              return (
                <article className="forward-proxy-validation-card" key={entry.id}>
                  <div className="forward-proxy-validation-head">
                    <Badge variant={resultTone}>
                      {entry.result.ok ? strings.validation.ok : strings.validation.failed}
                    </Badge>
                    <Badge variant="outline">
                      {entry.kind === 'subscriptionUrl'
                        ? strings.validation.subscriptionKind
                        : strings.validation.proxyKind}
                    </Badge>
                  </div>
                  <code className="forward-proxy-code-block">{entry.result.normalizedValue ?? entry.value}</code>
                  <p className="forward-proxy-validation-message">{entry.result.message}</p>
                  <div className="forward-proxy-validation-meta">
                    <span>
                      {strings.validation.discoveredNodes}: {formatNumber(entry.result.discoveredNodes ?? 0)}
                    </span>
                    <span>
                      {strings.validation.latency}: {formatLatency(entry.result.latencyMs)}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="surface panel">
        <div className="panel-header">
          <div>
            <h2>{strings.nodes.title}</h2>
            <p className="panel-description">{strings.nodes.description}</p>
          </div>
        </div>

        {statsError && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 12 }}>
            {statsError}
          </div>
        )}

        <AdminLoadingRegion
          loadState={statsLoadState}
          loadingLabel={strings.nodes.loading}
          errorLabel={statsError || undefined}
          minHeight={240}
        >
          {mergedNodes.length === 0 ? (
            <div className="empty-state alert">{strings.nodes.empty}</div>
          ) : (
            <div className="table-wrapper jobs-table-wrapper forward-proxy-table-wrapper">
              <Table className="jobs-table forward-proxy-table">
                <thead>
                  <tr>
                    <th>{strings.nodes.table.node}</th>
                    <th>{strings.nodes.table.source}</th>
                    <th>{strings.nodes.table.endpoint}</th>
                    <th>{strings.nodes.table.state}</th>
                    <th>{strings.nodes.table.assignments}</th>
                    <th>{strings.nodes.table.windows}</th>
                    <th>{strings.nodes.table.activity24h}</th>
                    <th>{strings.nodes.table.weight24h}</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedNodes.map((node) => {
                    const activity = summarizeActivity(node)
                    const weight = summarizeWeight(node.weight24h)
                    const stateBadge = getNodeStateBadge(strings, node)
                    return (
                      <tr key={node.key}>
                        <td>
                          <div className="forward-proxy-cell-stack">
                            <strong>{node.displayName}</strong>
                            <code className="forward-proxy-code-inline">{node.key}</code>
                          </div>
                        </td>
                        <td>
                          <Badge variant={node.source === 'subscription' ? 'info' : node.source === 'manual' ? 'outline' : 'neutral'}>
                            {getSourceLabel(strings, node.source)}
                          </Badge>
                        </td>
                        <td>
                          <div className="forward-proxy-cell-stack">
                            <code className="forward-proxy-code-inline forward-proxy-endpoint">
                              {node.endpointUrl ?? '—'}
                            </code>
                            <span className="panel-description">
                              {strings.nodes.weightLabel}: {formatDecimal(node.weight)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="forward-proxy-cell-stack">
                            <Badge variant={stateBadge.variant}>{stateBadge.label}</Badge>
                            <span className="panel-description">
                              {node.penalized ? strings.states.penalizedHint : strings.states.readyHint}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="forward-proxy-cell-stack">
                            <span>
                              {strings.nodes.primary}: <strong>{formatNumber(node.primaryAssignmentCount)}</strong>
                            </span>
                            <span>
                              {strings.nodes.secondary}: <strong>{formatNumber(node.secondaryAssignmentCount)}</strong>
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="forward-proxy-window-grid">
                            {WINDOW_KEYS.map((windowDefinition) => {
                              const statsForWindow = node.stats[windowDefinition.key]
                              return (
                                <div className="forward-proxy-window-card" key={`${node.key}-${windowDefinition.key}`}>
                                  <span className="forward-proxy-window-label">
                                    {strings.windows[windowDefinition.translationKey]}
                                  </span>
                                  <strong>{formatNumber(statsForWindow.attempts)}</strong>
                                  <span>{strings.nodes.successRateLabel}: {formatPercent(computeSuccessRate(statsForWindow))}</span>
                                  <span>{strings.nodes.latencyLabel}: {formatLatency(statsForWindow.avgLatencyMs)}</span>
                                </div>
                              )
                            })}
                          </div>
                        </td>
                        <td>
                          <div className="forward-proxy-cell-stack">
                            <span>
                              {strings.nodes.successCountLabel}: <strong>{formatNumber(activity.success)}</strong>
                            </span>
                            <span>
                              {strings.nodes.failureCountLabel}: <strong>{formatNumber(activity.failure)}</strong>
                            </span>
                            <span className="panel-description">
                              {node.last24h.length > 0
                                ? formatTimeRange(node.last24h[0]?.bucketStart, node.last24h[node.last24h.length - 1]?.bucketEnd)
                                : '—'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="forward-proxy-cell-stack">
                            <span>
                              {strings.nodes.lastWeightLabel}: <strong>{formatDecimal(weight.lastWeight)}</strong>
                            </span>
                            <span>
                              {strings.nodes.avgWeightLabel}: <strong>{formatDecimal(weight.avgWeight)}</strong>
                            </span>
                            <span>
                              {strings.nodes.minMaxWeightLabel}: <strong>{`${formatDecimal(weight.minWeight)} / ${formatDecimal(weight.maxWeight)}`}</strong>
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </AdminLoadingRegion>
      </section>
    </>
  )
}
