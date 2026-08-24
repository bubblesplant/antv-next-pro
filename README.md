# Antdv Next Pro

[![CI](https://github.com/bubblesplant/antv-next-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/bubblesplant/antv-next-pro/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/antdv-next-pro.svg)](https://www.npmjs.com/package/antdv-next-pro)
[![license](https://img.shields.io/badge/license-MIT-1768d3.svg)](./LICENSE)

面向 Vue 3 与 Antdv Next 的高阶数据组件库。参考 `@ant-design/pro-components@2.8.10` 的主要 Props 和工作流，以 Vue 的 `v-model`、事件、插槽和组件 `ref` 提供：

- `ProTable`：搜索、分页、排序、筛选、列设置、远程请求与可编辑行。
- `EditableProTable`：整表受控编辑、新建记录、单行/多行编辑与异步保存。
- `SchemaForm`：通过 `columns` 生成普通、查询、轻量、弹层和步骤表单。

[中文文档](https://bubblesplant.github.io/antv-next-pro/) · [English docs](https://bubblesplant.github.io/antv-next-pro/en/)

## 安装

```bash
pnpm add antdv-next-pro antdv-next vue
```

```ts
import { createApp } from 'vue'
import Antd from 'antdv-next'
import AntdvNextPro from 'antdv-next-pro'

import 'antdv-next/dist/reset.css'
import 'antdv-next-pro/style.css'

createApp(App).use(Antd).use(AntdvNextPro).mount('#app')
```

也可以按需具名导入：

```ts
import { EditableProTable, ProTable, SchemaForm, type ProColumns } from 'antdv-next-pro'
```

## 快速示例

```vue
<script setup lang="ts">
import { ProTable, type ProColumns, type ProRequest } from 'antdv-next-pro'

type User = Record<string, unknown> & {
  id: number
  name: string
  status: 'active' | 'disabled'
}

const columns: ProColumns<User>[] = [
  { title: '姓名', dataIndex: 'name', valueType: 'text' },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: { active: '启用', disabled: '停用' },
  },
]

const request: ProRequest<User, Record<string, unknown>> = async (params, sort, filter) => {
  const result = await api.users({ ...params, sort, filter })
  return { data: result.items, total: result.total, success: true }
}
</script>

<template>
  <ProTable :columns="columns" :request="request" row-key="id" />
</template>
```

请求契约不绑定特定请求库，并发请求只接纳最后一次结果：

```ts
request(params, sort, filter): Promise<{
  data: T[]
  total?: number
  success?: boolean
}>
```

## Monorepo

```text
apps/
  docs/                 中英双语 VitePress 文档
  playground/           三个组件的交互演练场
packages/
  antdv-next-pro/       npm 组件包
```

工程固定 Node.js 24、pnpm 11，并使用 Vite+ 统一运行 Vite、Oxlint、Oxfmt、Vitest、任务编排与组件打包。Vue SFC 额外由 `@antfu/eslint-config` 检查。

```bash
pnpm install
pnpm dev                # Playground
pnpm docs:dev           # VitePress
pnpm format:check
pnpm lint:ox
pnpm lint:vue
pnpm typecheck
pnpm test:coverage
pnpm test:browser
pnpm build
```

## 发布

用户可见变更需要执行 `pnpm changeset`。合并到 `main` 后，GitHub Actions 自动维护版本 PR；版本 PR 合并且仓库已配置 `NPM_TOKEN` 时发布 npm provenance。文档独立部署到 GitHub Pages。

## Compatibility

The API follows the main workflows of Ant Design Pro Components while remaining idiomatic Vue. ReactNode and React refs map to Vue slots, events, models, and component refs. This project does not ship a React compatibility runtime.

See the full [compatibility matrix](https://bubblesplant.github.io/antv-next-pro/en/guide/compatibility).

## License

[MIT](./LICENSE) © bubblesplant
