# 1:1 上游 Credits 计费（MCP + HTTP）（#72uuc）

## 状态

- Status: 进行中（快车道）
- Created: 2026-03-06
- Last: 2026-03-06

## 背景 / 问题陈述

- 现状：下游“业务配额”（hour/day/month）按 requests 计数，而上游 Tavily 计费按 credits（不同操作/深度对应不同 credits）。
- 问题：当前口径会导致下游扣减与上游实际成本不一致（例如某些操作 0 credits、某些操作 4 credits），进而引发超卖/误拦截/对账困难。

## 目标 / 非目标

### Goals

- 将下游“业务配额”从 requests 切换为 Tavily API credits，并按上游实际消耗 **1:1** 扣减。
- 覆盖入口：HTTP `/api/tavily/*` 与 MCP `/mcp`（tavily tools）。
- 采用“混合”策略：
  - **可预测成本**（Search / Research 最小成本）：先检查再放行；
  - **不可预测成本**（Extract / Map / Crawl）：先放行，回包前按实际扣费（允许“最后一单超额”，下一次阻断）。
- 全面补齐测试：全部使用本地 mock upstream，确保不触达 Tavily 生产端点。

### Non-goals

- 不实现/调整任何 Tavily 上游定价策略（以下游解析到的 usage 为准）。
- 不引入新的外部 API（仅对现有转发行为做兼容增强，新增/透传 usage 字段）。

## 范围（Scope）

### In scope

- 注入 `include_usage=true` 以确保上游返回 usage（Search/Extract/Crawl/Map）。
- 解析上游响应中的 `usage.credits`（含 MCP 返回的嵌套结构）。
- Quota 子系统改为按 credits 增量写入 buckets 与 monthly quota。
- Research：使用 `/usage` 的 `research_usage` 差分作为本次 credits 成本。

### Out of scope

- 对非 Tavily 业务的 MCP 方法计费（tools/list、resources/* 等维持 0 成本）。

## 需求（Requirements）

### MUST

- Search / Extract / Crawl / Map：上游请求体注入 `include_usage=true`。
- Search：
  - 前置检查：按 `search_depth` 计算 expected_cost（basic/fast/ultra-fast=1，advanced=2）；
  - 若 `used + expected_cost > limit`，返回 429 且不命中 upstream。
  - 回包扣费：优先使用 `usage.credits`；缺失时 fallback 到 expected_cost。
- Extract/Map/Crawl：
  - 仅在 `used >= limit` 时阻断；否则放行；
  - 回包扣费：仅当上游返回 `usage.credits` 时扣费（缺失不猜）。
- MCP `tools/call`（tavily-*）：
  - 注入 `include_usage=true`；
  - tavily-search 做 expected_cost 前置阻断；
  - 回包按 credits 扣费（递归解析 usage.credits；search 缺失 fallback expected_cost）。
- Research：
  - 前置阻断：按模型最小成本（mini=4、pro=15、auto=4）；
  - 回包按 `/usage` `research_usage` 差分扣费；
  - `/usage` 失败时降级：按最小值扣费并记录 error log（避免静默漏扣）。

### SHOULD

- 若 `usage.credits` 未来返回小数：向上取整写入（避免漏扣）。
- 兼容性：不删除/改名任何现有字段；仅新增/透传 usage 信息。

## 验收标准（Acceptance Criteria）

- 单元/集成测试覆盖：
  - HTTP Search 1/2 credits 扣费与先验阻断；
  - HTTP Extract/Map/Crawl 注入 include_usage 与按 credits 扣费；
  - MCP 非工具调用 0 成本保持；
  - MCP tavily-search 扣费与先验阻断（包含嵌套 usage.credits）；
  - Research `/usage` 差分扣费 + 前置阻断；
  - bound token 口径仍只写 account counters（不回退）。
- `cargo test` 通过；`cargo clippy -- -D warnings` 通过。

## 非功能性验收 / 质量门槛（Quality Gates）

### Testing

- Rust: `cargo test`

### Quality checks

- `cargo fmt`
- `cargo clippy -- -D warnings`

## 文档更新（Docs to Update）

- `docs/quota-design.md`: 补充“按 credits 计数”的口径说明（如需要）。

## 实现里程碑（Milestones / Delivery checklist）

- [ ] M1: credits 采集与注入（HTTP Search/Extract/Crawl/Map + MCP tools/call）
- [ ] M2: quota 子系统支持按 credits 增量扣费（token/account buckets + monthly）
- [ ] M3: handler/proxy 更新（mixed enforcement + Research /usage diff）
- [ ] M4: 测试补齐 + 本地验证（cargo test + clippy）

## 风险 / 开放问题 / 假设（Risks, Open Questions, Assumptions）

- 风险：Research `/usage` 差分在并发下可能发生“归因误差”；本设计仅对 Research 使用差分，尽量降低影响面。
- 假设：上游 `usage.credits` 默认返回整数；若变更为小数，下游统一向上取整写入。
