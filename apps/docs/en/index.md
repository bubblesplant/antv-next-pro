---
layout: home

hero:
  name: Antdv Next Pro
  text: One columns model for the whole data workflow
  tagline: ProTable, EditableProTable, and SchemaForm for Vue 3 and Antdv Next.
  image:
    src: /antv-next-pro/mark.svg
    alt: Antdv Next Pro
  actions:
    - theme: brand
      text: Get started
      link: /en/guide/getting-started
    - theme: alt
      text: Explore ProTable
      link: /en/components/pro-table

features:
  - title: ProTable
    details: Search, pagination, sorting, filtering, column settings, and remote requests in one predictable flow.
  - title: EditableProTable
    details: A controlled table value with row creation, multi-row editing, validation, and async persistence.
  - title: SchemaForm
    details: Generate standard, query, light, overlay, and stepped forms from the same field model.
---

## Vue interactions, not a React runtime port

Antdv Next Pro follows the major props and request contract from `@ant-design/pro-components@2.8.10`, expressed through Vue component refs, events, slots, and `v-model`. Its UI primitives come from `antdv-next@^1.5.2`.

```vue
<ProTable :columns="columns" :request="request" />
<EditableProTable v-model:value="rows" :columns="columns" />
<SchemaForm v-model="form" :columns="columns" />
```

[See the React → Vue compatibility matrix](/en/guide/compatibility)
