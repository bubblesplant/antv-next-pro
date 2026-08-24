---
layout: home

hero:
  name: Antdv Next Pro
  text: 一套 columns，贯穿数据工作流
  tagline: 为 Vue 3 与 Antdv Next 提供 ProTable、EditableProTable 和 SchemaForm。
  image:
    src: /antv-next-pro/mark.svg
    alt: Antdv Next Pro
  actions:
    - theme: brand
      text: 5 分钟开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 ProTable
      link: /components/pro-table

features:
  - title: ProTable
    details: 把搜索、分页、排序、筛选、列设置与远程请求收束进一个可预测的数据流。
  - title: EditableProTable
    details: 面向整表编辑，提供受控 value、新建行、多行编辑和异步保存状态机。
  - title: SchemaForm
    details: 用同一列模型生成普通、查询、轻量、弹层和步骤表单，并保持 Vue 式双向绑定。
---

## 为 Vue 重写交互，而不是移植 React 运行时

Antdv Next Pro 参考 `@ant-design/pro-components@2.8.10` 的主要 Props 与请求契约，使用 Vue 的组件 `ref`、事件、插槽和 `v-model` 表达同样的工作流。底层组件来自 `antdv-next@^1.5.2`。

```vue
<ProTable :columns="columns" :request="request" />
<EditableProTable v-model:value="rows" :columns="columns" />
<SchemaForm v-model="form" :columns="columns" />
```

[查看 React → Vue 兼容矩阵](/guide/compatibility)
