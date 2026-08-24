<script setup>
import SchemaFormDemo from '../examples/SchemaFormDemo.vue'
</script>

# SchemaForm

`SchemaForm` 使用唯一的 `columns` Schema 生成字段，并以 Vue `v-model` 管理表单模型。它与表格组件共享 `dataIndex`、`valueType`、`valueEnum`、校验和转换约定。

<ClientOnly>
  <SchemaFormDemo />
</ClientOnly>

## 基础用法

```vue
<SchemaForm ref="formRef" v-model="form" :columns="columns" @finish="save" />
```

`initialValues`、异步 `request(params)`、URL 与受控值会按以下优先级合并，右侧覆盖左侧：

```text
initialValues < request result < URL values < modelValue
```

合并后的快照也是 `reset()` 的目标。`params`、`request`、`initialValues` 或 `urlSync` 变化时会重新初始化；并发初始化只接纳最后一次结果。请求失败会回退到 `initialValues + modelValue`，并触发 `request-error` 与 `error`。

```ts
const loadInitialValues = async (params?: Record<string, unknown>) => {
  const project = await api.project(params?.projectId)
  return { owner: project.owner, channel: project.channel }
}
```

## 主要 Props

| Prop                      | 类型                                   | 说明                                       |
| ------------------------- | -------------------------------------- | ------------------------------------------ |
| `columns`                 | `SchemaFormColumn<T>[]`                | 唯一 Schema 入口                           |
| `modelValue`              | `Partial<T>`                           | 标准 `v-model` 值                          |
| `initialValues`           | `Partial<T>`                           | 初始化与重置基线                           |
| `request`                 | `(params?) => Promise<Partial<T>>`     | 异步初始值                                 |
| `params`                  | `Record<string, unknown>`              | 初始化请求参数                             |
| `layoutType`              | `SchemaFormLayoutType`                 | 表单布局，默认 `Form`                      |
| `open`                    | `boolean`                              | Modal/Drawer 打开状态，支持 `v-model:open` |
| `current`                 | `number`                               | 步骤索引，支持 `v-model:current`           |
| `title` / `width`         | 文本或尺寸                             | 弹层标题和宽度                             |
| `labelCol` / `wrapperCol` | Antdv Next Form 配置                   | 标签与控件布局                             |
| `grid`                    | `boolean`                              | 使用响应式 Row/Col 网格                    |
| `readonly`                | `boolean`                              | 全表单只读                                 |
| `urlSync`                 | `boolean \| { key?, mode? }`           | query/hash 同步                            |
| `submitter`               | `false \| { submitText?, resetText? }` | 默认操作区                                 |
| `style`                   | `CSSProperties`                        | 根容器样式                                 |

列还支持 `component`、`colProps`、`rowProps`、`tooltip` 和 `extra`。

## `valueType` 与异步选项

| 类型                             | 生成控件/结构               |
| -------------------------------- | --------------------------- |
| `text` / `textarea` / `password` | Input / Textarea / Password |
| `digit` / `money` / `percent`    | InputNumber                 |
| `select` / `radio`               | Select / RadioGroup         |
| `checkbox` / `switch`            | Checkbox(Group) / Switch    |
| `date` / `dateTime`              | DatePicker                  |
| `dateRange` / `dateTimeRange`    | DateRangePicker             |
| `time`                           | TimePicker                  |
| `group` / `formSet`              | 字段分组                    |
| `formList`                       | 可新增、删除的动态列表      |
| `divider`                        | 分隔线                      |
| `dependency`                     | 依赖字段或自定义联动区域    |

`select`、`radio` 和 `checkbox` 可使用 `valueEnum`、`fieldProps.options`，或列级异步 `request`：

```ts
const channelColumn: SchemaFormColumn<Brief> = {
  title: '发布渠道',
  dataIndex: 'channel',
  valueType: 'select',
  params: { enabled: true },
  request: async (params) => {
    const items = await api.channels(params)
    return items.map((item) => ({
      label: item.name,
      value: item.code,
      disabled: !item.available,
    }))
  },
}
```

异步选项会在 `request` 或 `params` 变化时重载，并同样只接纳最后一次结果。

## 布局类型

| `layoutType`  | 场景                               |
| ------------- | ---------------------------------- |
| `Form`        | 标准表单                           |
| `Embed`       | 无额外弹层的嵌入式表单             |
| `ModalForm`   | Modal，使用 `v-model:open`         |
| `DrawerForm`  | Drawer，使用 `v-model:open`        |
| `QueryFilter` | 网格化行内查询表单                 |
| `LightFilter` | 轻量行内筛选                       |
| `StepForm`    | 单步骤视图，使用 `v-model:current` |
| `StepsForm`   | 带 Steps 导航的多步骤表单          |

既可以设置 `layout-type`，也可直接导入同名组件：

```vue
<script setup lang="ts">
import { ModalForm, StepsForm } from 'antdv-next-pro'
</script>

<template>
  <ModalForm v-model="form" v-model:open="open" :columns="columns" />
  <StepsForm v-model="form" v-model:current="current" :columns="stepColumns" />
</template>
```

多步骤 Schema 要求顶层列全部是带子列的 `group` 或 `formSet`；每个顶层分组成为一步。`next()` 会先校验当前步骤，最后一步提交完整结果。Steps 标题允许直接点击返回已访问的前序步骤；点击后续步骤只会触发一次 `next()`，校验成功后前进一步，不能绕过当前步骤校验。

## 组合字段与动态 Schema

```ts
const columns: SchemaFormColumn<Project>[] = [
  {
    title: '基本信息',
    valueType: 'group',
    columns: [
      { title: '名称', dataIndex: 'name', valueType: 'text' },
      { title: '类型', dataIndex: 'kind', valueType: 'select', valueEnum: kinds },
    ],
  },
  {
    title: '联系人',
    dataIndex: 'contacts',
    valueType: 'formList',
    fieldProps: {
      creatorButtonText: '添加联系人',
      removeText: '移除',
      initialValue: { name: '', email: '' },
    },
    columns: [
      { title: '姓名', dataIndex: 'name', valueType: 'text' },
      { title: '邮箱', dataIndex: 'email', valueType: 'text' },
    ],
  },
]
```

`columns` 可以是 computed 结果；依赖外部状态增删列即可生成动态字段。`dependencies` 会把依赖值传给字段插槽，`dependency` 搭配 `renderFormItem` 可渲染联动区域。

## 值转换

`convertValue` 只处理进入表单的数据，包括初始化、外部 `v-model` 更新和 `setFieldsValue`；`transform` 只在 `submit()` 时处理提交输出。`validate()` 仅校验并返回表单中的原始值，不执行 `transform`。

```ts
const columns = [
  {
    title: '时间范围',
    dataIndex: 'range',
    valueType: 'dateRange',
    convertValue: (value) => value?.map(dayjs),
    transform: (value) => ({
      startedAt: value?.[0]?.toISOString(),
      endedAt: value?.[1]?.toISOString(),
    }),
  },
]
```

`transform` 返回对象时会合并到 `submit()` 的最终结果；返回普通值时保留原 `dataIndex`。因此可以先用 `validate()` 读取校验后的原始表单值，再用 `submit()` 获取面向接口的转换结果。

## 命名插槽

字段路径以点连接，例如 `['profile', 'name']` 对应 `profile.name`。

```vue
<SchemaForm ref="formRef" v-model="form" :columns="columns">
  <template #label-project="{ column }">
    {{ column.title }} *
  </template>

  <template #field-owner="{ value, update, dependencies }">
    <OwnerPicker
      :model-value="value"
      :channel="dependencies[0]"
      @update:model-value="update"
    />
  </template>

  <template #submitter="{ values, current }">
    <button @click="formRef?.prev()">上一步</button>
    <button @click="formRef?.submit()">提交第 {{ current + 1 }} 步</button>
  </template>
</SchemaForm>
```

| 插槽                                  | 参数                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `field-${path}`、`${path}` 或列 `key` | `{ value, record, column, dependencies, update }`                                               |
| `label-${path}`                       | `{ column, record }`                                                                            |
| `submitter`                           | `{ values, current }`                                                                           |
| `trigger`                             | `{ open, openForm, closeForm }`                                                                 |
| `title`                               | `{ title, open, values, close }`                                                                |
| `footer`                              | `{ values, submitting, submit, reset, close }`                                                  |
| `step-title`                          | `{ title, index, current, step, steps, values }`                                                |
| `step-content`                        | `{ current, step, steps, columns, values, content }`                                            |
| `step-actions`                        | `{ current, step, steps, values, hasPrevious, hasNext, submitting, next, prev, submit, reset }` |

字段插槽中的 `update(nextValue)` 会更新表单、`v-model`、URL 和相关事件。
`trigger`、`title`、`footer` 用于 `ModalForm` / `DrawerForm`；`step-title`、`step-content`、`step-actions` 用于 `StepForm` / `StepsForm`。`step-content` 的 `content()` 可渲染当前步骤的默认字段。

## URL 同步

```vue
<!-- 每个字段写入 query -->
<SchemaForm :url-sync="true" />

<!-- 完整模型以 JSON 写入 filters 参数 -->
<SchemaForm :url-sync="{ key: 'filters' }" />

<!-- 每个字段写入 hash -->
<SchemaForm :url-sync="{ mode: 'hash' }" />
```

字段模式会删除 URL 中的空值；命名 key 模式存储完整模型。组件监听 `popstate` / `hashchange` 并回填表单，适合可分享的筛选条件。URL 值在初始化时覆盖 `request` 结果，但仍会被显式 `modelValue` 覆盖。

## 事件

| 事件                 | 参数              | 说明                           |
| -------------------- | ----------------- | ------------------------------ |
| `update:model-value` | `values`          | 默认 `v-model` 更新            |
| `update:open`        | `open`            | 弹层双向绑定                   |
| `update:current`     | `current`         | 步骤双向绑定                   |
| `change`             | `values`          | 任意字段变化                   |
| `values-change`      | `changed, values` | `changed` 含 `path` 与 `value` |
| `submit` / `finish`  | `values`          | 校验与 transform 后的结果      |
| `reset`              | `values`          | 恢复初始化快照                 |
| `open` / `close`     | 无                | 组件方法或弹层交互             |
| `current-change`     | `current`         | 当前步骤变化                   |
| `request-error`      | `error`           | 异步初始值失败                 |
| `error`              | `error`           | 初始化或校验失败               |

## 组件 ref

```ts
const formRef = ref<SchemaFormInstance<Brief>>()

formRef.value?.setFieldsValue({ owner: 'Ada' })
const raw = formRef.value?.getFieldsValue()
const output = await formRef.value?.submit()
await formRef.value?.next()
```

| 方法                     | 说明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| `validate()`             | 校验并返回原始表单值，不执行 transform                       |
| `reset()`                | 恢复初始化快照                                               |
| `getFieldsValue()`       | 获取当前表单原始值                                           |
| `setFieldsValue(values)` | 浅层/嵌套合并传入字段                                        |
| `submit()`               | 校验、执行 transform，触发 `submit`、`finish` 并返回转换结果 |
| `open()` / `close()`     | 控制 Modal/Drawer                                            |
| `next()` / `prev()`      | 控制步骤；`next` 返回是否成功前进                            |
