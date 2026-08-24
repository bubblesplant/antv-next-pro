<script setup>
import SchemaFormDemo from '../../examples/SchemaFormDemo.vue'
</script>

# SchemaForm

`SchemaForm` generates fields from the single `columns` schema and manages its model with Vue `v-model`. It shares `dataIndex`, `valueType`, `valueEnum`, validation, and transforms with the table components.

<ClientOnly>
  <SchemaFormDemo />
</ClientOnly>

## Basic usage

```vue
<SchemaForm ref="formRef" v-model="form" :columns="columns" @finish="save" />
```

`initialValues`, asynchronous `request(params)`, URL values, and the controlled value merge in this precedence order, with the right side winning:

```text
initialValues < request result < URL values < modelValue
```

The merged snapshot is also the target of `reset()`. Changes to `params`, `request`, `initialValues`, or `urlSync` initialize again. Concurrent initializations use the latest request only. A failure falls back to `initialValues + modelValue` and emits both `request-error` and `error`.

```ts
const loadInitialValues = async (params?: Record<string, unknown>) => {
  const project = await api.project(params?.projectId)
  return { owner: project.owner, channel: project.channel }
}
```

## Main props

| Prop                      | Type                                   | Description                                 |
| ------------------------- | -------------------------------------- | ------------------------------------------- |
| `columns`                 | `SchemaFormColumn<T>[]`                | The single schema entry point               |
| `modelValue`              | `Partial<T>`                           | Standard `v-model` value                    |
| `initialValues`           | `Partial<T>`                           | Initialization and reset baseline           |
| `request`                 | `(params?) => Promise<Partial<T>>`     | Asynchronous initial values                 |
| `params`                  | `Record<string, unknown>`              | Initialization request params               |
| `layoutType`              | `SchemaFormLayoutType`                 | Form layout; defaults to `Form`             |
| `open`                    | `boolean`                              | Modal/Drawer state; supports `v-model:open` |
| `current`                 | `number`                               | Step index; supports `v-model:current`      |
| `title` / `width`         | Text or size                           | Overlay title and width                     |
| `labelCol` / `wrapperCol` | Antdv Next Form config                 | Label and control layout                    |
| `grid`                    | `boolean`                              | Responsive Row/Col grid                     |
| `readonly`                | `boolean`                              | Whole-form readonly mode                    |
| `urlSync`                 | `boolean \| { key?, mode? }`           | Query/hash synchronization                  |
| `submitter`               | `false \| { submitText?, resetText? }` | Default action area                         |
| `style`                   | `CSSProperties`                        | Root style                                  |

Columns also accept `component`, `colProps`, `rowProps`, `tooltip`, and `extra`.

## `valueType` and async options

| Type                             | Generated control/structure          |
| -------------------------------- | ------------------------------------ |
| `text` / `textarea` / `password` | Input / Textarea / Password          |
| `digit` / `money` / `percent`    | InputNumber                          |
| `select` / `radio`               | Select / RadioGroup                  |
| `checkbox` / `switch`            | Checkbox(Group) / Switch             |
| `date` / `dateTime`              | DatePicker                           |
| `dateRange` / `dateTimeRange`    | DateRangePicker                      |
| `time`                           | TimePicker                           |
| `group` / `formSet`              | Field groups                         |
| `formList`                       | Dynamic add/remove list              |
| `divider`                        | Divider                              |
| `dependency`                     | Dependency or custom reactive region |

`select`, `radio`, and `checkbox` can use `valueEnum`, `fieldProps.options`, or a column-level async `request`:

```ts
const channelColumn: SchemaFormColumn<Brief> = {
  title: 'Channel',
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

Options reload when `request` or `params` changes, and only the latest concurrent result is accepted.

## Layout types

| `layoutType`  | Scenario                                |
| ------------- | --------------------------------------- |
| `Form`        | Standard form                           |
| `Embed`       | Embedded form without an overlay        |
| `ModalForm`   | Modal with `v-model:open`               |
| `DrawerForm`  | Drawer with `v-model:open`              |
| `QueryFilter` | Grid-based inline query form            |
| `LightFilter` | Lightweight inline filter               |
| `StepForm`    | Single step view with `v-model:current` |
| `StepsForm`   | Multi-step form with Steps navigation   |

Set `layout-type` or import a named layout component:

```vue
<script setup lang="ts">
import { ModalForm, StepsForm } from 'antdv-next-pro'
</script>

<template>
  <ModalForm v-model="form" v-model:open="open" :columns="columns" />
  <StepsForm v-model="form" v-model:current="current" :columns="stepColumns" />
</template>
```

For multiple steps, every top-level column must be a `group` or `formSet` with child columns. Each top-level group becomes one step. `next()` validates the current step before advancing; the last step submits the complete result. A Steps title may navigate directly to an earlier step. Clicking a later step invokes one validated `next()` transition and cannot bypass the current step.

## Composition and dynamic schemas

```ts
const columns: SchemaFormColumn<Project>[] = [
  {
    title: 'Basics',
    valueType: 'group',
    columns: [
      { title: 'Name', dataIndex: 'name', valueType: 'text' },
      { title: 'Kind', dataIndex: 'kind', valueType: 'select', valueEnum: kinds },
    ],
  },
  {
    title: 'Contacts',
    dataIndex: 'contacts',
    valueType: 'formList',
    fieldProps: {
      creatorButtonText: 'Add contact',
      removeText: 'Remove',
      initialValue: { name: '', email: '' },
    },
    columns: [
      { title: 'Name', dataIndex: 'name', valueType: 'text' },
      { title: 'Email', dataIndex: 'email', valueType: 'text' },
    ],
  },
]
```

`columns` may be computed; adding or removing columns from external state creates dynamic fields. `dependencies` passes dependency values to field slots. A `dependency` column with `renderFormItem` creates a custom reactive region.

## Value transforms

`convertValue` only processes values entering the form, including initialization, external `v-model` updates, and `setFieldsValue`. `transform` only processes submission output when `submit()` runs. `validate()` validates and returns the raw form values without applying `transform`.

```ts
const columns = [
  {
    title: 'Window',
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

An object returned by `transform` merges into the final `submit()` result. A scalar remains under the original `dataIndex`. Use `validate()` when you need validated raw form values and `submit()` when you need the transformed API payload.

## Named slots

Field paths are dot-joined, so `['profile', 'name']` becomes `profile.name`.

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

  <template #submitter="{ current }">
    <button @click="formRef?.prev()">Previous</button>
    <button @click="formRef?.submit()">Submit step {{ current + 1 }}</button>
  </template>
</SchemaForm>
```

| Slot                                        | Props                                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `field-${path}`, `${path}`, or column `key` | `{ value, record, column, dependencies, update }`                                               |
| `label-${path}`                             | `{ column, record }`                                                                            |
| `submitter`                                 | `{ values, current }`                                                                           |
| `trigger`                                   | `{ open, openForm, closeForm }`                                                                 |
| `title`                                     | `{ title, open, values, close }`                                                                |
| `footer`                                    | `{ values, submitting, submit, reset, close }`                                                  |
| `step-title`                                | `{ title, index, current, step, steps, values }`                                                |
| `step-content`                              | `{ current, step, steps, columns, values, content }`                                            |
| `step-actions`                              | `{ current, step, steps, values, hasPrevious, hasNext, submitting, next, prev, submit, reset }` |

`update(nextValue)` inside a field slot updates the form, `v-model`, URL, and related events.
`trigger`, `title`, and `footer` apply to `ModalForm` / `DrawerForm`. `step-title`, `step-content`, and `step-actions` apply to `StepForm` / `StepsForm`. Call `content()` from `step-content` to render the current step's default fields.

## URL synchronization

```vue
<!-- one query parameter per field -->
<SchemaForm :url-sync="true" />

<!-- complete model JSON in the filters parameter -->
<SchemaForm :url-sync="{ key: 'filters' }" />

<!-- one hash parameter per field -->
<SchemaForm :url-sync="{ mode: 'hash' }" />
```

Per-field mode removes empty URL values; named-key mode stores the complete model. The component listens to `popstate` / `hashchange` and hydrates again, which is useful for shareable filters. URL values override the request result during initialization but are still overridden by explicit `modelValue`.

## Events

| Event                | Arguments         | Description                             |
| -------------------- | ----------------- | --------------------------------------- |
| `update:model-value` | `values`          | Default `v-model` update                |
| `update:open`        | `open`            | Overlay two-way binding                 |
| `update:current`     | `current`         | Step two-way binding                    |
| `change`             | `values`          | Any field change                        |
| `values-change`      | `changed, values` | `changed` contains `path` and `value`   |
| `submit` / `finish`  | `values`          | Validated, transformed result           |
| `reset`              | `values`          | Restored initialization snapshot        |
| `open` / `close`     | none              | Component method or overlay interaction |
| `current-change`     | `current`         | Active step change                      |
| `request-error`      | `error`           | Async initial value failure             |
| `error`              | `error`           | Initialization or validation failure    |

## Component ref

```ts
const formRef = ref<SchemaFormInstance<Brief>>()

formRef.value?.setFieldsValue({ owner: 'Ada' })
const raw = formRef.value?.getFieldsValue()
const output = await formRef.value?.submit()
await formRef.value?.next()
```

| Method                   | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `validate()`             | Validate and return raw form values without transforms                           |
| `reset()`                | Restore the initialization snapshot                                              |
| `getFieldsValue()`       | Read current raw form values                                                     |
| `setFieldsValue(values)` | Merge incoming nested values                                                     |
| `submit()`               | Validate, transform, emit `submit` / `finish`, and return the transformed result |
| `open()` / `close()`     | Control Modal/Drawer                                                             |
| `next()` / `prev()`      | Control steps; `next` returns whether it advanced                                |
