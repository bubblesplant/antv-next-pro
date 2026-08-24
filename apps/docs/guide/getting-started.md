# 快速开始

`antdv-next-pro` 为 Vue 3 提供 `ProTable`、`EditableProTable` 与 `SchemaForm`。三个组件共享同一套 `columns` 模型，可连续描述查询、展示、编辑和提交。

## 环境要求

- Node.js 24.x（仓库约束为 `>=24 <25`）
- pnpm 11.22.0
- Vue 3.5+
- `antdv-next` `^1.5.2`

## 安装

```bash
pnpm add antdv-next-pro antdv-next vue
```

在应用入口安装 Vue 插件，并加载 Antdv Next reset 与组件库样式：

```ts
import { createApp } from 'vue'
import Antd from 'antdv-next'
import AntdvNextPro from 'antdv-next-pro'

import 'antdv-next/dist/reset.css'
import 'antdv-next-pro/style.css'

import App from './App.vue'

createApp(App).use(Antd).use(AntdvNextPro).mount('#app')
```

安装插件后，可直接使用全局组件名 `ProTable`、`EditableProTable`、`SchemaForm`、`Form`、`Embed`、`ModalForm`、`DrawerForm`、`QueryFilter`、`LightFilter`、`StepForm` 和 `StepsForm`。

组件也支持具名导入，无需安装 `AntdvNextPro` 插件。样式入口仍需加载一次：

```vue
<script setup lang="ts">
import { ProTable, type ProColumns } from 'antdv-next-pro'

type User = Record<string, unknown> & {
  id: number
  name: string
}

const columns: ProColumns<User>[] = [{ title: '姓名', dataIndex: 'name', valueType: 'text' }]
</script>

<template>
  <ProTable :columns="columns" :data-source="[{ id: 1, name: 'Ada' }]" row-key="id" />
</template>
```

## 从三个组件开始

- [ProTable](/components/pro-table)：本地/远程数据、搜索、分页、列状态和行编辑。
- [EditableProTable](/components/editable-pro-table)：将完整表格作为一个受控可编辑字段。
- [SchemaForm](/components/schema-form)：从 `columns` 生成普通、弹层、筛选和步骤表单。

## Vue API 约定

React Pro Components 的工作流会以 Vue 惯用方式表达：

| React 模式                                | Vue 模式                                  |
| ----------------------------------------- | ----------------------------------------- |
| `actionRef`、`formRef`、`editableFormRef` | 组件 `ref` 与实例方法                     |
| `value` + `onChange`                      | `v-model` / `v-model:value`               |
| `editableKeys`                            | `v-model:editable-keys`                   |
| ReactNode Props                           | 具名插槽，必要时使用 `render` 回调        |
| 回调事件                                  | Vue kebab-case 事件，例如 `request-error` |

## 统一列模型

三个组件共享 `ProColumns<T>`；`SchemaFormColumn<T>` 在此基础上增加表单布局字段。

| 字段                                       | 用途                           |
| ------------------------------------------ | ------------------------------ |
| `title` / `dataIndex` / `key`              | 字段标题、数据路径和稳定标识   |
| `valueType` / `valueEnum`                  | 选择只读展示、搜索项与编辑控件 |
| `search` / `hideInSearch`                  | 查询区配置和参数转换           |
| `hideInTable` / `hideInForm`               | 按使用场景控制可见性           |
| `fieldProps` / `formItemProps`             | 透传控件与校验配置             |
| `render` / `renderText` / `renderFormItem` | 自定义展示或编辑               |
| `convertValue` / `transform`               | 分别转换进入表单的值与提交结果 |

常用 `valueType` 分组如下：

| 场景        | `valueType`                                                           |
| ----------- | --------------------------------------------------------------------- |
| 文本与数字  | `text`、`textarea`、`password`、`digit`、`money`、`percent`           |
| 选择与状态  | `select`、`radio`、`checkbox`、`switch`                               |
| 日期与时间  | `date`、`dateTime`、`dateRange`、`dateTimeRange`、`time`、`timeRange` |
| 表格专用    | `index`、`indexBorder`、`option`                                      |
| Schema 组合 | `group`、`formList`、`formSet`、`divider`、`dependency`               |

## 本仓库开发

```bash
pnpm install
pnpm dev          # 启动交互 Playground
pnpm docs:dev     # 启动中英文 VitePress 文档
pnpm typecheck    # 全工作区类型检查
pnpm test         # Vitest 单元测试
pnpm check        # 格式、Lint、类型、测试与构建
```

工程由 Vite+ 统一编排 Oxlint、Oxfmt、Vitest、Browser Mode 与打包任务；`@antfu/eslint-config` 只补充 Vue SFC 检查。提交信息必须符合 Conventional Commits。

## Changesets 与发布

每个会影响 npm 包的变更都应附带 changeset：

```bash
pnpm changeset
```

选择 `antdv-next-pro`、版本级别并填写面向使用者的变更说明，然后将生成的 `.changeset/*.md` 一并提交。当前仓库采用公开发布、`main` 基线、GitHub changelog 和内部依赖 patch 更新。

初始包版本为 `0.0.0`，仓库已包含一个 minor changeset，因此首次正式版本目标为 `0.1.0`。`main` 的 CI 通过后，Release 工作流会：

1. 通过 Changesets 创建或更新版本 PR。
2. 版本 PR 合并后再次构建发布产物。
3. 配置 `NPM_TOKEN` 时发布到 npm，并生成 provenance。
4. 未配置 `NPM_TOKEN` 时仍可维护版本 PR，但不会执行 npm 发布。
