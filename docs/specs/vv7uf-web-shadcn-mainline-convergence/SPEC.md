# Web 前端 shadcn/ui 剩余主通路收敛与 Storybook 补档（#vv7uf）

## 状态

- Status: 待实现
- Created: 2026-03-09
- Last: 2026-03-09

## 背景 / 问题陈述

- 仓库已经具备 shadcn/ui primitives，但 `PublicHome`、`TokenDetail`、`ApiKeysValidationDialog`、`AdminShell`、`AdminDashboard` 仍有多处生产主通路依赖原生控件与 DaisyUI 兼容类。
- 当前 Storybook 仍只有 stories，没有自动生成的 docs entries，也缺少本轮受影响 primitives / wrappers / 页面场景的覆盖。
- 若不继续收敛，后续页面演进会继续扩散 `.btn/.input/.modal/.table` 兼容层使用面，降低一致性与可维护性。

## 目标 / 非目标

### Goals

- 将本轮仍然存在问题的主交互优先迁移到现有 shadcn/ui primitives 或受控 wrapper。
- 保持业务逻辑、接口协议、路由语义、复制/显隐/分页/过滤/SSE/导入等交互行为不变。
- 为本轮受影响组件与页面补齐 Storybook stories 与 Autodocs，让 docs entries 出现在构建产物中。
- 保留当前兼容类作为过渡层，但不再让其承担这批页面的主交互骨架。

### Non-goals

- 不修改 Rust 后端、数据库结构、鉴权逻辑或接口协议。
- 不做品牌视觉重设计，不重写业务文案。
- 不全站清理 DaisyUI 兼容类。
- 不引入仓库中不存在的 slider primitive。

## 范围（Scope）

### In scope

- `web/src/PublicHome.tsx`
- `web/src/pages/TokenDetail.tsx`
- `web/src/components/ApiKeysValidationDialog.tsx`
- `web/src/admin/AdminShell.tsx`
- `web/src/AdminDashboard.tsx`
- 与上述页面直接耦合、且为完成收敛必须触达的支持组件 / wrappers / Storybook 文件
- `docs/specs/vv7uf-web-shadcn-mainline-convergence/SPEC.md`

### Out of scope

- `web/src/pages/AdminLogin.tsx`
- Rust 后端代码
- 与本轮未直接相关的 Storybook 大规模重构
- 删除仍有生产消费者的全局兼容类

## 需求（Requirements）

### MUST

- `PublicHome` 的 token 输入切到 `Input`，复制/显隐/主操作切到 `Button` 或 wrapper，token access 切到受控 `Dialog`。
- `TokenDetail` 的 period/per-page 使用 `Select`，日期/周/月输入使用 `Input`，分页使用 `Button`，桌面日志使用 `Table`，两个原生 dialog 切到 `Dialog`。
- `ApiKeysValidationDialog` 保持移动端 `Drawer`，将桌面端改为 `Dialog`，底部主次操作与行内 retry 统一收敛到 `Button`，桌面表格切到 `Table` 体系或轻量 wrapper。
- `AdminShell` 新增统一导航按钮 wrapper，并用 `buttonVariants` 管理 active/hover/focus/mobile 语义。
- `AdminDashboard` 将本轮仍明显承担主交互骨架的按钮、输入、文本域、主弹层与被触达的桌面表格区域切到 shadcn 主通路；slider 保留原生 range，但必须通过受控 wrapper 暴露。
- Storybook 必须补齐 primitives / wrappers / 页面关键状态 stories，并开启 Autodocs，使 `build-storybook` 产物出现 docs entries。

### SHOULD

- 复用现有 primitives：`Button`、`Input`、`Textarea`、`Dialog`、`Table`、`Select`、`Drawer`。
- 仅新增必要 wrapper，不复制一套新的 DaisyUI 兼容层。
- 浏览器验收覆盖桌面/移动断点、Dialog 键盘交互与 Select 键盘可达性。

### COULD

- 在不扩大范围的前提下，为本轮新增 wrapper 提供最小 docs description 与 story controls。

## 功能与行为规格（Functional/Behavior Spec）

### Core flows

- `PublicHome`
  - token 输入继续保留密码管理器规避属性、显隐遮罩、复制结果提示、hash 归一化、本地持久化与 LinuxDo 登录串联行为。
  - token access 以受控 `Dialog` 管理打开/关闭与敏感状态重置。
- `TokenDetail`
  - period 切换、start 输入 sanitize/debounce、分页切换、日志展开、rotate/copy token、SSE 在线状态保持现有行为。
- `ApiKeysValidationDialog`
  - 校验进度、状态筛选、导入、批量重试、单条重试与导入 warning/error 展示行为保持不变。
  - 仅视口适配策略调整：移动端 `Drawer`，桌面端 `Dialog`。
- `AdminShell` / `AdminDashboard`
  - 侧边导航语义与当前 active module 映射不变。
  - 本轮触达的表单、弹层、列表与筛选区只更换交互骨架，不改数据来源与提交行为。

### Edge cases / errors

- token / key / secret 为空、无效、导入中、重试中、分页边界、空日志、无筛选结果、Dialog ESC/backdrop 关闭都要保持现有用户语义。
- slider 对应 shadcn primitive 不存在时，允许继续使用原生 range，但业务页不能继续直接依赖 `.range`。

## 接口契约（Interfaces & Contracts）

### 接口清单（Inventory）

| 接口（Name）                        | 类型（Kind） | 范围（Scope） | 变更（Change） | 契约文档（Contract Doc） | 负责人（Owner） | 使用方（Consumers）   | 备注（Notes）    |
| ----------------------------------- | ------------ | ------------- | -------------- | ------------------------ | --------------- | --------------------- | ---------------- |
| 前端页面与组件 props / state wiring | internal     | internal      | Modify         | None                     | frontend        | web pages / Storybook | 仅 UI 主通路收敛 |
| 后端 HTTP API                       | HTTP API     | external      | None           | None                     | backend         | web pages             | 本计划不变更     |

### 契约文档（按 Kind 拆分）

- None

## 验收标准（Acceptance Criteria）

- Given `PublicHome` token 输入区与 token access 弹层
  When 用户输入、复制、显隐、确认 token 或走 LinuxDo 登录
  Then 主通路使用 `Input` / `Button` / `Dialog`，且原有持久化与交互语义保持不变。
- Given `TokenDetail` 的 period/filter/pagination/table/dialog
  When 用户切换 period、修改 start、翻页、展开日志、rotate/copy token
  Then 主通路使用 `Select` / `Input` / `Button` / `Table` / `Dialog`，且原有筛选、分页、日志展开与 rotate 行为不回归。
- Given `ApiKeysValidationDialog`
  When 桌面端打开、过滤、重试、导入、关闭
  Then 桌面端使用 `Dialog` + `Button` + `Table`，移动端仍为 `Drawer`，行为保持不变。
- Given `AdminShell` 与 `AdminDashboard` 本轮触达区域
  When 用户导航、打开主弹层、提交主要输入、查看关键表格或调整 quota slider
  Then 侧边导航统一经过 wrapper，主要输入/按钮/文本域/弹层不再走 `.btn/.input/.textarea/.modal` 主通路，range 通过 wrapper 暴露。
- Given Storybook 构建
  When 执行 `cd web && bun run build-storybook`
  Then 构建通过，且产物里 docs entries 不再缺失。

## 实现前置条件（Definition of Ready / Preconditions）

- 目标与范围已冻结为“仅处理当前仍然存在的问题”
- P0 / P1 优先级已明确
- Storybook docs 方案已确定为 Storybook 10 Autodocs，不新增独立 MDX
- slider 的替代策略已确定为原生 range wrapper

## 非功能性验收 / 质量门槛（Quality Gates）

### Testing

- Type/build: `cd web && bun run build`
- Storybook build: `cd web && bun run build-storybook`

### UI / Storybook (if applicable)

- Stories to add/update:
  - primitives: `Button`、`Input`、`Textarea`、`Dialog`、`Table`、`Drawer`
  - wrappers: `AdminNavButton`、quota range wrapper
  - pages/components: `PublicHome`、`TokenDetail`、`ApiKeysValidationDialog`、`AdminShell`
- Visual regression baseline changes (if any): 以 Storybook 与浏览器人工复核为准，不引入新工具。

### Quality checks

- `cargo` 相关检查：None
- 前端类型/构建：沿用现有 `bun run build` / `bun run build-storybook`

## 文档更新（Docs to Update）

- `docs/specs/README.md`: 新增本 spec 索引并在完成后同步状态

## 计划资产（Plan assets）

- Directory: `docs/specs/vv7uf-web-shadcn-mainline-convergence/assets/`
- In-plan references: `![...](./assets/<file>.png)`
- PR visual evidence source: maintain `## Visual Evidence (PR)` in this spec when PR screenshots are needed.
- If an asset must be used in impl (runtime/test/official docs), list it in `资产晋升（Asset promotion）` and promote it to a stable project path during implementation.

## Visual Evidence (PR)

- 暂无；如 PR 需要图片证据，仅放最终页面或 Storybook 截图。

## 资产晋升（Asset promotion）

- None

## 实现里程碑（Milestones / Delivery checklist）

- [ ] M1: 收敛 `PublicHome`、`TokenDetail`、`ApiKeysValidationDialog` 的 shadcn 主通路
- [ ] M2: 收敛 `AdminShell`、`AdminDashboard` 剩余主交互入口与 range wrapper
- [ ] M3: 补齐 Storybook stories/autodocs，并完成 build + browser 验收
- [ ] M4: 完成 review-loop、PR 与 checks 收敛

## 方案概述（Approach, high-level）

- 以现有 shadcn primitives 为唯一主入口，必要时增加轻量 wrapper 收敛样式与语义。
- 兼容层继续保留，但只作为未迁移区域的过渡层，不在本轮继续扩散。
- Storybook 与浏览器验收同时覆盖桌面/移动断点与关键可访问性路径。

## 风险 / 开放问题 / 假设（Risks, Open Questions, Assumptions）

- 风险：视觉回归存在；键盘可达性回归存在；兼容类消费者仍存在。
- 需要决策的问题：None
- 假设（需主人确认）：None

## 变更记录（Change log）

- 2026-03-09: 创建本 spec，冻结“仅处理当前仍然存在的问题 + Storybook docs 补档”的范围。

## 参考（References）

- `docs/specs/rqbqk-shadcn-ui-rebuild/SPEC.md`
- `docs/specs/3rb68-public-home-token-access-modal/SPEC.md`
- `docs/specs/kgakn-admin-api-keys-validation-dialog/SPEC.md`
- `docs/specs/m4n7x-admin-path-routing-modular-dashboard/SPEC.md`
- `docs/specs/pv69t-admin-user-quota-slider-stability/SPEC.md`
