---
pageClass: component-doc
---

<script setup>
import ProFormFieldsDemo from '../../examples/ProFormFieldsDemo.vue'
</script>

# ProFormFields

Nineteen standalone field components give regular forms, custom layouts, ProTable search and inline editing, and SchemaForm one value-binding, option-request, and readonly-display protocol. A field includes an Antdv Next `FormItem` by default; use `fieldMode="field"` when only the control should render.

## Complete field demo

This Vue SFC renders all 19 public fields and demonstrates readonly state, async options, the captcha callback, upload entry points, and bare-control mode.

<ClientOnly>
  <ProFormFieldsDemo />
</ClientOnly>

<details class="demo-source">
<summary>View complete source</summary>

<<< ../../examples/ProFormFieldsDemo.vue

</details>

## Imports and names

All 19 template-friendly names support named imports. Installing the default plugin also registers them globally under the same names.

```ts
import {
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormMoney,
  ProFormRadioGroup,
  ProFormSegmented,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTextPassword,
  ProFormTreeSelect,
  ProFormUploadButton,
  ProFormUploadDragger,
} from 'antdv-next-pro'
```

The package also provides names matching the composed Ant Design Pro Components API:

```ts
ProFormText.Password === ProFormTextPassword
ProFormRadio.Group === ProFormRadioGroup
```

Prefer `ProFormTextPassword` and `ProFormRadioGroup` in Vue templates. `ProFormRadio` is a readonly namespace object, not a twentieth field, and no dotted global component name is registered.

## Common API

### Props

| Prop             | Type                                                | Default       | Description                                                     |
| ---------------- | --------------------------------------------------- | ------------- | --------------------------------------------------------------- |
| `modelValue`     | Component-specific                                  | `undefined`   | Standard `v-model` value                                        |
| `name`           | `string \| number \| readonly (string \| number)[]` | —             | FormItem name, including nested paths                           |
| `label`          | `VNodeChild`                                        | —             | FormItem label                                                  |
| `rules`          | Antdv Next FormItem rules                           | —             | Validation rules                                                |
| `fieldMode`      | `'form-item' \| 'field'`                            | `'form-item'` | Render a form item or a bare control                            |
| `fieldProps`     | Matching base-control props                         | —             | Passed to Input, Select, and other base controls                |
| `formItemProps`  | Antdv Next FormItem props                           | —             | Passed only to FormItem                                         |
| `disabled`       | `boolean`                                           | `false`       | Preserve the control shape while disabling interaction          |
| `readonly`       | `boolean`                                           | `false`       | Use the shared readonly renderer                                |
| `emptyText`      | `VNodeChild`                                        | `'-'`         | Placeholder for `undefined`, `null`, and empty strings          |
| `readonlyRender` | `(value) => VNodeChild`                             | —             | Custom readonly output; nullish output falls back to formatting |

### Form-item and bare-control modes

`fieldMode="form-item"` is the default. `name`, `label`, `rules`, and `formItemProps` apply to the FormItem created by the component.

```vue
<ProFormText
  v-model="form.title"
  name="title"
  label="Title"
  :rules="[{ required: true, message: 'Enter a title' }]"
/>
```

Use bare-control mode when a parent already owns the FormItem, or when the field lives in a table cell or custom grid. It creates no FormItem, and `name`, `label`, `rules`, and `formItemProps` do not participate in rendering.

```vue
<ProFormText v-model="keyword" field-mode="field" placeholder="Only Input is rendered" />
```

### Prop precedence and attrs

Ordinary properties resolve in this order:

1. Explicit top-level component prop.
2. The same key in `fieldProps` or `formItemProps`.
3. Component default.

Top-level `disabled` therefore overrides `fieldProps.disabled`, and top-level `label` overrides `formItemProps.label`. The field core always owns controlled value props and update listeners; consumer handlers are composed with, not substituted for, `v-model` updates.

`fieldProps.class/style` targets the base control, while `formItemProps.class/style` targets FormItem. Plain `class`, `style`, `data-*`, and `aria-*` attrs target FormItem in form-item mode and the base control in `field` mode.

### `v-model` bridges

Every public component exposes `modelValue / update:modelValue`. The field core adapts the base-control protocol:

| Field kind                                                 | Base-control protocol        | Public protocol |
| ---------------------------------------------------------- | ---------------------------- | --------------- |
| Input, InputNumber, date, Select, Radio, Slider, Segmented | `value / update:value`       | `v-model`       |
| Single Checkbox, Switch                                    | `checked / update:checked`   | `v-model`       |
| Upload, UploadDragger                                      | `fileList / update:fileList` | `v-model`       |

`fieldProps['onUpdate:value']`, `fieldProps['onUpdate:checked']`, or `fieldProps['onUpdate:fileList']` can coexist with component `v-model` and are each called once per update.

### Events

| Event               | Components                                                | Description                                                                          |
| ------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `update:modelValue` | All                                                       | Normalized field value                                                               |
| `change`            | All                                                       | Original base-control change arguments                                               |
| `requestError`      | Select, TreeSelect, Checkbox group, RadioGroup, Segmented | Option request failed; valid existing options remain                                 |
| `captchaError`      | Captcha                                                   | Callback rejected or returned `false`; `false` stays an explicit cancellation result |
| `drop`              | Both Upload fields                                        | Original drop event                                                                  |

The base event order is internal model update → `fieldProps` handler → wrapper emit.

### Slots and instance methods

`label`, `extra`, `help`, and `tooltip` are FormItem slots. Other named slots and the default slot are forwarded to the base control. FormItem-only slots are not rendered in `fieldMode="field"`.

- Captcha adds a `captcha` slot with `{ seconds }`.
- UploadButton's default slot replaces the upload-button content.
- UploadDragger's default slot replaces the drag area.
- Option fields expose `refresh(): Promise<void>` through a component ref.
- Captcha exposes `resetCountdown(): void`.

## Options, requests, and readonly display

### `options`, `valueEnum`, and `request`

Select, TreeSelect, Checkbox groups, RadioGroup, and Segmented share one protocol:

```vue
<ProFormSelect
  ref="selectRef"
  v-model="owner"
  :options="fallbackOptions"
  :params="{ teamId }"
  :request="loadOwners"
  @request-error="reportError"
/>
```

- When `request` exists, it starts immediately. Local options may be shown before its first success.
- After a successful request, the remote result is authoritative. An empty array is valid and does not fall back.
- Without `request`, precedence is top-level `options` → `fieldProps.options` (or `treeData` for TreeSelect) → `valueEnum`.
- A failure preserves the last successful result. Before any success, it preserves the local fallback and emits `requestError`.
- Changing `request` or `params` refreshes options. Only the newest concurrent request may update state.

Options use `label ?? text ?? title ?? name ?? value` as the label and `value ?? key ?? id` as the value. To preserve numeric `valueEnum` keys strictly, use a `ReadonlyMap` or set `value` explicitly:

```ts
const levels = new Map([
  [1, { text: 'Level 1' }],
  [2, { text: 'Level 2' }],
])

const alternate = {
  1: { text: 'Level 1', value: 1 },
}
```

### Readonly and reset

`readonly` uses one `ReadonlyField` instead of relying on inconsistent native readonly support. Choice fields show labels, arrays use commas, date ranges use `~`, passwords are masked, money keeps its prefix, and uploads show file names. `0` and `false` are not considered empty.

Fields are controlled: when the parent resets and passes a new `modelValue`, the display updates immediately. Resetting the value does not clear the option cache. Captcha countdowns are cancelled explicitly with `resetCountdown()`.

## The 19 components

Every component below is interactive in the [complete field demo](#complete-field-demo).

### ProFormText

A single-line text field with `string | undefined` model values and an Input base control. It adds no Pro-specific default. Pass `allowClear`, `prefix`, `suffix`, `maxlength`, and other Input props through `fieldProps`.

### ProFormDigit

A numeric field with `number | string | null` values. It defaults to `min=0` and `precision=2`. Top-level `min` / `precision` win over `fieldProps`; pass `false` to omit either constraint.

```vue
<ProFormDigit v-model="count" :min="false" :precision="0" />
```

### ProFormTextPassword

A password field with `string | undefined` values and InputPassword underneath. Non-empty readonly values render as `••••••`. Use template-friendly `ProFormTextPassword` or the composed `ProFormText.Password` name.

### ProFormTextArea

A multiline `string | undefined` field. Pass `rows`, `autoSize`, `maxlength`, and other TextArea props through `fieldProps`.

### ProFormCaptcha

An Input and send-button composition. `onGetCaptcha` is required, `countDown` defaults to 60 seconds, and the default button text is “获取验证码”. A resolved result other than `false` starts the countdown; rejection or `false` restores the button and emits `captchaError`.

The component does not read phone numbers, send a built-in request, or persist codes. The consumer must implement `onGetCaptcha`. Loading, countdown, disabled, and readonly states all prevent repeated sends.

### ProFormDatePicker

A date picker that preserves Antdv Next's Dayjs value protocol. It does not convert to strings or native Date values. Pass formatting, disabled dates, and panel props through `fieldProps`.

### ProFormDateTimePicker

A Dayjs date-time picker with `showTime=true` by default. Override it with top-level `showTime` or a concrete `fieldProps.showTime` configuration.

### ProFormDateRangePicker

A Dayjs range value or `null`. Clearing does not synthesize an empty string. Range presets, disabled dates, and related props pass through `fieldProps`.

### ProFormDateTimeRangePicker

A Dayjs date-time range with `showTime=true` by default.

### ProFormSelect

Supports `options`, `valueEnum`, `request`, `params`, and `requestError`. Use `fieldProps` for `mode="multiple"` / `"tags"` and other Select capabilities. Its ref exposes `refresh()`.

### ProFormTreeSelect

Uses the shared option-request protocol. Standard options map to tree nodes with `title`, `label`, `value`, `disabled`, and `children`. Consumer-supplied `treeData`, `fieldNames`, and related props remain available through `fieldProps`.

### ProFormCheckbox

Without an option source, it renders a single Checkbox and bridges native `checked` to `v-model`. With `options`, `valueEnum`, `request`, or `fieldProps.options`, it renders CheckboxGroup. `layout` defaults to `horizontal` and also accepts `vertical`.

### ProFormRadioGroup

A RadioGroup using the shared option-request protocol. Native orientation and button-style capabilities pass through `fieldProps`. Prefer `ProFormRadioGroup` in templates; `ProFormRadio.Group` is also exported.

### ProFormSlider

Uses `number | number[] | undefined` model values. `range`, `marks`, `min`, `max`, `step`, and `tooltip` pass through `fieldProps`.

### ProFormSwitch

Exposes `v-model` while bridging to native `checked / update:checked`. `checkedValue` and `unCheckedValue` are preserved instead of being forced to Boolean.

### ProFormUploadButton

A button upload entry point with an `UploadFile[]` model bridged to `fileList`. Its default slot replaces the button content. Pass `action`, `customRequest`, `beforeUpload`, `headers`, `data`, `multiple`, `accept`, `maxCount`, `itemRender`, and other Upload props through `fieldProps`.

The library supplies no upload backend. Without `action` or `customRequest`, its internal `beforeUpload` returns `false` to prevent requests to an unknown destination, while still running a consumer `beforeUpload` handler.

### ProFormUploadDragger

A drag-and-drop upload entry point with the same `UploadFile[]`, `fileList`, and no-backend contract as UploadButton. Its default slot replaces the drag area and `drop` forwards the native event.

### ProFormMoney

A `number | string | null` amount field. The prefix defaults to `¥`; top-level `prefix` or `fieldProps.prefix` can override it, and `false` disables it. `formatter`, `parser`, and `stringMode` pass to InputNumber.

### ProFormSegmented

A segmented `string | number` field using the shared option-request protocol. It supplies an empty options array when no source exists, and preserves `disabled` plus other option metadata.

## Shared field core in higher-level components

Standalone fields and higher-level components use the same registry and FieldControl:

- ProTable search items use form-item mode; editable cells use bare-control mode.
- SchemaForm keeps its own FormItem, nested paths, dynamic slots, and composition fields while its default-control branch uses the bare field core.
- EditableProTable reuses the core through ProTable instead of maintaining a third field map.

This release adds `treeSelect`, `slider`, and `segmented` to `valueType`. Captcha, UploadButton, and UploadDragger remain standalone-only components: they have no `valueType` mapping and no built-in backend.
