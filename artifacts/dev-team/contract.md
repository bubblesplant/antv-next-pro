# ProFormFields 与上层组件统一改造技术契约

状态：已实施
日期：2026-09-14
上游文档：`artifacts/dev-team/PRD.md`

本文档是后续实现、联调和测试的唯一真相源。发现缺失或矛盾时必须先更新本文档，再同步给各实现角色，不得通过口头约定新增接口。

## 1. 基线与硬约束

- 运行时基线：Vue `^3.5.0`、`antdv-next` `^1.5.2`，以当前安装包的类型声明和运行时代码为准。
- 保留 `ProValueType`、`ProColumns`、`ProRenderContext`、三个上层组件的全部现有 props、事件、插槽和实例方法。
- 保留当前工作区尚未提交的模板化改造，所有变更必须增量落在其上。
- 新增视图必须使用 `.vue`、`<template>`、`<script setup lang="ts">`；内部纯算法可使用 `.ts`。
- 不增加后端端点，不绑定请求库，不内置验证码、文件存储或选项查询服务。
- 不新增运行时依赖；优先复用 Vue 与 `antdv-next`。

## 2. 已核实的 antdv-next 组件契约

| 基础控件                         | 受控值 prop | 更新入口          | 备注                                                                 |
| -------------------------------- | ----------- | ----------------- | -------------------------------------------------------------------- |
| Input / InputPassword / TextArea | `value`     | `update:value`    | Input/TextArea 使用小写 `readonly`。                                 |
| InputNumber                      | `value`     | `update:value`    | 使用驼峰 `readOnly`；支持 precision/min/max/formatter/parser。       |
| DatePicker / DateRangePicker     | `value`     | `update:value`    | 值为 Dayjs；日期时间通过 `showTime`，不存在独立基础 DateTimePicker。 |
| Select / TreeSelect              | `value`     | `update:value`    | Select mode 仅 `multiple`/`tags`；优先使用新版 popup 相关 API。      |
| Checkbox                         | `checked`   | `update:checked`  | 单 Checkbox 不使用 value 作为主绑定。                                |
| CheckboxGroup / RadioGroup       | `value`     | `onUpdate:value`  | 包装层必须主动桥接，不依赖 emits 类型推断。                          |
| Slider / Segmented               | `value`     | `update:value`    | Slider 为 number/number[]；Segmented 为 string/number。              |
| Switch                           | `checked`   | `update:checked`  | 底层也支持 value，但 Pro 层统一使用 checked。                        |
| Upload / UploadDragger           | `fileList`  | `update:fileList` | 同时透传 change/drop；Dragger 需要包装层补足类型桥接。               |

`FormItem` 没有 React 风格的 `valuePropName` 或 `getValueFromEvent`。Checkbox、Switch、Upload 的值适配必须在字段核心完成；字段核心必须保持为 FormItem 的直接子节点。

## 3. 目标目录与职责

```text
packages/antdv-next-pro/src/pro-form-fields/
  types.ts                 # 公共字段类型、组件专属类型、实例类型
  options.ts               # options/valueEnum/request 归一化
  readonly.ts              # 统一只读格式化
  useFieldOptions.ts       # 异步选项、加载、竞态和错误状态
  fieldRegistry.ts         # valueType 到字段描述的注册表
  ReadonlyField.vue        # 统一只读输出
  FieldControl.vue         # 裸控件层，不创建 FormItem
  ProFormField.vue         # FormItem/裸控件模式编排
  ProFormText.vue
  ProFormTextPassword.vue
  ProFormDigit.vue
  ProFormTextArea.vue
  ProFormCaptcha.vue
  ProFormDatePicker.vue
  ProFormDateTimePicker.vue
  ProFormDateRangePicker.vue
  ProFormDateTimeRangePicker.vue
  ProFormSelect.vue
  ProFormTreeSelect.vue
  ProFormCheckbox.vue
  ProFormRadioGroup.vue
  ProFormSlider.vue
  ProFormSwitch.vue
  ProFormUploadButton.vue
  ProFormUploadDragger.vue
  ProFormMoney.vue
  ProFormSegmented.vue
  index.ts                 # 公开导出与组件集合
```

允许多个公开组件复用内部基础 SFC，但上述 19 个公开入口必须分别存在且可独立导入。

## 4. 公共名称与导出

公开的模板友好具名导出如下：

1. `ProFormText`
2. `ProFormDigit`
3. `ProFormTextPassword`
4. `ProFormTextArea`
5. `ProFormCaptcha`
6. `ProFormDatePicker`
7. `ProFormDateTimePicker`
8. `ProFormDateRangePicker`
9. `ProFormDateTimeRangePicker`
10. `ProFormSelect`
11. `ProFormTreeSelect`
12. `ProFormCheckbox`
13. `ProFormRadioGroup`
14. `ProFormSlider`
15. `ProFormSwitch`
16. `ProFormUploadButton`
17. `ProFormUploadDragger`
18. `ProFormMoney`
19. `ProFormSegmented`

同时提供以下命名关系：

```ts
ProFormText.Password === ProFormTextPassword
ProFormRadio.Group === ProFormRadioGroup
```

- `ProFormText` 通过带 `Password` 静态成员的组件交叉类型导出。
- `ProFormRadio` 是只读命名空间对象 `{ Group: ProFormRadioGroup }`，不作为独立表单控件计数。
- Vue 插件全局注册使用合法模板名 `ProFormTextPassword`、`ProFormRadioGroup`，不注册带点字符串。
- 根 `src/index.ts` 具名导出全部组件、`ProFormRadio`、公共类型，并将 19 个模板友好组件加入现有插件安装数组。

## 5. 公共类型

准确实现可从基础控件 `$props` 推导 `fieldProps`，不得退化为所有组件共用的无约束 `any`。若 `antdv-next` 未导出某个 Props 类型，使用 `InstanceType<typeof Component>['$props']` 或等价内部辅助类型。

```ts
export type ProFormFieldMode = 'form-item' | 'field'
export type ProFormFieldName = ProDataIndex
export type ProFormFieldValue = unknown

export type ProFormOptionValue<ModelValue> = ModelValue extends null | undefined
  ? never
  : ModelValue extends readonly (infer OptionValue)[]
    ? OptionValue
    : ModelValue

export interface ProFormFieldOption<Value = unknown> {
  label: VNodeChild
  value: Value
  disabled?: boolean
  [key: string]: unknown
}

export interface ProFormValueEnumItem<Value = unknown> extends ProValueEnumItem {
  value?: Value
}

export type ProFormValueEnum<Value = unknown> =
  | Record<string, string | ProFormValueEnumItem<Value>>
  | ReadonlyMap<Value, string | ProFormValueEnumItem<Value>>

export type ProFormFieldRequest<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
> = (
  params?: Params,
) => Promise<Array<ProFormFieldOption<OptionValue> | Record<string, unknown> | OptionValue>>

export interface ProFormBaseFieldProps<
  Value = unknown,
  FieldProps extends Record<string, unknown> = Record<string, unknown>,
> {
  modelValue?: Value
  name?: ProFormFieldName
  label?: VNodeChild
  rules?: unknown[]
  fieldMode?: ProFormFieldMode
  fieldProps?: FieldProps
  formItemProps?: Record<string, unknown>
  disabled?: boolean
  readonly?: boolean
  emptyText?: VNodeChild
  readonlyRender?: (value: Value) => VNodeChild
}

export interface ProFormOptionFieldProps<
  OptionValue = unknown,
  Params extends Record<string, unknown> = Record<string, unknown>,
> {
  options?: ProFormFieldOption<OptionValue>[]
  valueEnum?: ProFormValueEnum<OptionValue>
  request?: ProFormFieldRequest<OptionValue, Params>
  params?: Params
}
```

选项类字段将整个 `modelValue` 与单个 option 的值分别建模为 `ModelValue`、`OptionValue`。例如多选 Select 使用 `ProFormSelectProps<string[], string>`；只传 `ModelValue` 时，数组元素类型会作为默认 `OptionValue`。`name` 直接复用 `ProDataIndex`，因此接受字符串、数字和 readonly 路径数组。

### 5.1 公共 emits

除特别说明外，字段组件公开：

```ts
update: modelValue(value)
change(...nativeArgs)
requestError(error) // 仅选项类组件
```

- `update:modelValue` 始终传规范化后的字段值。
- `change` 原样转发底层控件的 change 参数，不把事件对象擅自改造成值。
- `fieldProps.onChange` 与组件级 `@change` 可以同时存在，各调用一次。

### 5.2 公共 slots

- `label`、`extra`、`help`、`tooltip` 作为 FormItem 插槽。
- 其他具名插槽和默认插槽原样转发给基础控件。
- `fieldMode='field'` 时忽略 FormItem 专属插槽；不得额外创建包装 FormItem。

## 6. 模式、属性与事件合并规则

### 6.1 字段模式

- `fieldMode` 默认值为 `'form-item'`。
- `'form-item'`：渲染一个 FormItem，FieldControl 是其直接子节点。
- `'field'`：只渲染 FieldControl，适用于表格单元格、SchemaForm 已有 FormItem 和自定义布局。
- `'field'` 模式下 `name`、`label`、`rules`、`formItemProps` 不参与渲染，但保留在类型中便于模式切换。

### 6.2 普通属性优先级

1. 组件顶层语义属性；
2. `fieldProps`/`formItemProps` 同名属性；
3. 组件默认值。

例外：内部受控绑定 prop 和更新监听器永远由 FieldControl 最终写入，使用者监听器通过组合函数调用，不能覆盖内部更新。

- 顶层 `name`、`label`、`rules` 覆盖 `formItemProps` 同名项。
- 顶层 `disabled`、`readonly`、`options` 等覆盖 `fieldProps` 同名项。
- 未显式提供顶层值时，允许 `fieldProps` 覆盖组件默认值。

### 6.3 class、style 与 attrs

- `fieldProps.class/style` 只作用于基础控件。
- `formItemProps.class/style` 只作用于 FormItem。
- 组件 `$attrs.class/style` 在 `'form-item'` 模式合并到 FormItem，在 `'field'` 模式合并到基础控件；合并顺序为内部默认、对应 props、`$attrs`。
- `data-*`、`aria-*` 和未识别普通 attrs 采用相同目标规则。

### 6.4 事件组合

同一个底层事件按以下顺序执行：

1. 内部模型与状态更新；
2. `fieldProps` 中的处理器；
3. 包装组件 emit。

每个处理器每次事件只调用一次。内部更新监听器、`fieldProps['onUpdate:*']` 和 `update:modelValue` 必须组合，不能因对象展开顺序丢失。

## 7. 选项与异步请求协议

### 7.1 数据归一化

选项对象按 `label ?? text ?? title ?? name ?? value` 解析标签，按 `value ?? key ?? id` 解析值，并保留 disabled 与其他扩展字段。原始 string/number 转为 `{ label: item, value: item }`。

### 7.2 来源优先级

1. 存在 `request` 时启动请求；首次完成前可展示本地回退选项。
2. 请求成功后，远程结果成为权威来源；空数组也是有效结果，不回退到本地数据。
3. 没有 `request` 时，顶层 `options` 优先于 `fieldProps.options`，随后是 `valueEnum`。
4. 请求失败时保留最后一次成功结果；从未成功时保留本地回退选项，并 emit `requestError`。

### 7.3 竞态与刷新

- 监听 request 函数引用与 params 的稳定序列化值。
- 每次请求递增 sequence；仅最新 sequence 可更新 options、error 和 loading。
- 旧请求的成功或失败都不得覆盖新请求状态。
- 组件卸载后不得更新响应式状态。

### 7.4 数值值语义

- `options`、`request` 和 `ReadonlyMap` 中的 value 原样保留。
- JavaScript 普通对象键天然字符串化；需要严格数值 valueEnum 时，使用 `ReadonlyMap`，或在 `ProFormValueEnumItem.value` 中显式给出数值。
- 为兼容旧数据，只读匹配允许在 Object.is 失败后做字符串比较，但不得因此修改当前 modelValue 的类型。

## 8. 组件专属契约

### 8.1 文本与数字

- `ProFormText`：string/undefined，基础 Input。
- `ProFormTextPassword`：string/undefined，基础 InputPassword；只读时固定输出 `••••••`，空值仍输出 emptyText。
- `ProFormTextArea`：string/undefined，基础 TextArea。
- `ProFormDigit`：number|string|null；顶层 `precision?: number | false`、`min?: number | false`。未在顶层或 fieldProps 指定时默认 precision=2、min=0；false 表示不向 InputNumber 传该限制。
- `ProFormMoney`：number|string|null；默认 prefix 为 `¥`，可由顶层/fieldProps 覆盖或关闭；formatter/parser/stringMode 原样透传。

### 8.2 日期

- 四个日期公开组件直接保留 Dayjs 值，不自动转 string/Date。
- DateTime 两项强制默认 `showTime=true`，使用者可通过顶层显式配置覆盖具体 showTime 对象，但不能切换为错误的基础控件。
- Range 组件值为 Dayjs 二元组或 null；清空时不合成空字符串。

### 8.3 选项组件

- Select、TreeSelect、CheckboxGroup、RadioGroup、Segmented 共用第 7 节协议。
- `ProFormCheckbox`：有选项来源时渲染 CheckboxGroup；无选项来源时渲染单 Checkbox。
- `ProFormCheckbox.layout?: 'horizontal' | 'vertical'`，由 Pro 层使用 Space/CSS 实现，不向 CheckboxGroup 透传不存在的 layout prop。
- `ProFormRadioGroup` 优先使用底层 orientation/vertical 能力，不重复实现方向状态。
- TreeSelect 将标准 option 映射为 `{ title: label, label, value, disabled, children }`，保留调用者提供的 treeData/fieldNames。
- Segmented 在无选项时传空数组，避免底层必填 options 造成运行时错误。

### 8.4 Slider 与 Switch

- Slider modelValue 为 number/number[]；range、marks、min/max/step/tooltip 透传。
- Switch 对外仍使用 modelValue，对内只使用 checked/update:checked；checkedValue/unCheckedValue 原样保留，不强制 Boolean 化非布尔值。

### 8.5 Captcha

```ts
interface ProFormCaptchaProps extends ProFormBaseFieldProps<string | undefined> {
  onGetCaptcha: () => void | boolean | Promise<void | boolean>
  countDown?: number // 默认 60 秒
  captchaText?: VNodeChild // 默认“获取验证码”
  countDownText?: (seconds: number) => VNodeChild
  buttonProps?: Record<string, unknown>
}
```

- 由 Input 与 Button 组合；不接收或持久化手机号，不发起内置网络请求。
- 点击后进入 loading；回调 resolve 且结果不为 false 时开始倒计时。
- reject 或返回 false 时不开始倒计时，恢复按钮并 emit `captchaError(error)`；false 使用可识别的取消结果，不伪造 Error。
- loading、倒计时、disabled、readonly 任一成立时禁止重复发送。
- 暴露 `resetCountdown()`；普通表单值重置不会自动取消防重复倒计时。

### 8.6 UploadButton 与 UploadDragger

- 对外 modelValue 为 UploadFile[]，对内映射 fileList/update:fileList。
- 公开 `change(info)`、`drop(event)`、`update:modelValue(fileList)`。
- action、customRequest、beforeUpload、headers、data、multiple、accept、maxCount、itemRender 等通过 fieldProps 透传。
- 包装层不提供 action 或 customRequest。两者均未提供时，内部 beforeUpload 默认返回 false，避免向未知地址发送；使用者 beforeUpload 仍按事件合并规则执行。
- UploadButton 默认槽为上传按钮内容；UploadDragger 默认槽为拖拽区内容，均允许完全覆盖。
- readonly 时显示文件名列表，不展示上传入口；disabled 时保留入口但不可操作。

## 9. 只读与重置

- `readonly=true` 使用统一 ReadonlyField，不依赖各基础控件不一致的 readonly 支持。
- 默认 emptyText 为 `-`；0、false、空数组与空字符串分别处理，只有 undefined/null/空字符串视为空。
- options 字段显示 label；数组以 `, ` 连接；日期区间以 `~` 连接；Dayjs 按现有 date/time 类型格式化。
- Password 使用掩码；Money 默认带前缀；Upload 显示文件名。
- `readonlyRender` 最优先，返回 null/undefined 时才回退默认格式化。
- 字段是受控组件；父层重置并传入新 modelValue 后必须立即更新。异步选项缓存不因值重置而清空，Captcha 倒计时仅由 `resetCountdown()` 显式取消。

## 10. valueType 与字段注册表

保留全部既有 `ProValueType` 字面量，只新增：

```ts
| 'treeSelect'
| 'slider'
| 'segmented'
```

映射如下：

| valueType                                                          | 字段核心                                  |
| ------------------------------------------------------------------ | ----------------------------------------- |
| text/未指定                                                        | ProFormText 的 FieldControl 描述          |
| textarea                                                           | ProFormTextArea                           |
| password                                                           | ProFormTextPassword                       |
| digit                                                              | ProFormDigit                              |
| money                                                              | ProFormMoney                              |
| percent                                                            | 现有 InputNumber 百分比描述，保留现有行为 |
| select                                                             | ProFormSelect                             |
| treeSelect                                                         | ProFormTreeSelect                         |
| radio                                                              | ProFormRadioGroup                         |
| checkbox                                                           | ProFormCheckbox                           |
| switch                                                             | ProFormSwitch                             |
| slider                                                             | ProFormSlider                             |
| segmented                                                          | ProFormSegmented                          |
| date/dateTime/dateRange/dateTimeRange                              | 对应四个日期字段                          |
| time/timeRange                                                     | 保留现有 TimePicker/TimeRangePicker 描述  |
| index/indexBorder/option/group/formList/formSet/divider/dependency | 结构类型，不进入 FieldControl             |

Captcha、UploadButton、UploadDragger 本期只提供独立组件，不新增 valueType。自定义 `column.component` 仍优先于注册表默认控件。

## 11. 上层组件迁移契约

### 11.1 兼容适配层

- 保留 `table/ValueTypeControl.ts` 和 `ValueTypeControl.vue` 的现有导出路径，内部改为调用新 FieldControl。
- `resolveFieldOptions`、`normalizeFieldOption`、`formatProValue` 继续从旧模块导出，允许内部实现转发到新 options/readonly 工具。
- 不删除现有测试可访问的名称。

### 11.2 ProTable

- 搜索区使用 ProFormField 的 `fieldMode='form-item'`，接收解析后的列级 fieldProps/formItemProps、完整字段名、标题和选项状态。
- 保留当前搜索 `<form>` 的提交/重置、折叠和布局行为；新增 FormItem DOM 后必须保持现有测试选择器和 CSS 语义可用。
- 搜索字段的顶层 name/label 由列 dataIndex/title 生成，覆盖 formItemProps 同名值。
- 可编辑单元格使用 `fieldMode='field'` 或直接 FieldControl；继续由现有 editable 校验器执行 rules，不嵌套 FormItem。
- 保留 ProTable 全部事件、暴露方法和请求行为；将已实际暴露的 getRowData/getRowsData/setRowData 补入 ProTableInstance 类型。

### 11.3 SchemaForm

- `SchemaFormField.vue` 保持结构类型、slot、renderFormItem 和自定义 component 的现有分支。
- 仅默认控件分支改用 FieldControl，固定 `fieldMode='field'`；现有 SchemaFormItem/FormItem 仍是唯一表单项层。
- 完整数组路径继续作为 FormItem name；FieldControl 必须是直接子节点。
- 每次渲染仍调用字段 slot 与 renderFormItem，并按字段 slot → renderFormItem → 默认 FieldControl 的空值优先级选择结果。
- 保留依赖 values/update 上下文、动态 field-${path}/路径/key 插槽、原地 mutation 后重读 fieldProps/formItemProps、最新异步请求等行为。
- 新增 treeSelect/slider/segmented 映射；补齐现有 timeRange 在 SchemaForm 中错误回退为 Input 的缺口。

### 11.4 EditableProTable

- 继续通过 ProTable 间接复用字段核心，不建立第三套字段映射。
- 根级 `formItemProps` 继续只控制整张 EditableProTable 外层 FormItem。
- 列级 `formItemProps` 仅用于单元格校验/字段配置，不创建第二层 FormItem。
- 新增、编辑、草稿、保存、取消、删除、树形数据和 dataSource/value 同步协议不变。

### 11.5 错误回调扩展

为 `ProColumns` 增加可选、向后兼容的：

```ts
onFieldRequestError?: (error: unknown) => void
```

公共 ProForm 选项组件使用 `requestError` emit；ProTable/SchemaForm 的字段请求错误调用列级回调。未提供回调时保持现有不抛出到渲染流程的行为。

## 12. 文档契约

- 新增中英文 ProFormFields 文档入口；可按类别分页面，但 19 项必须各有锚点、API、默认值和 live demo。
- 文档必须说明：fieldMode、fieldProps/formItemProps、属性优先级、事件合并、slots、options/valueEnum/request、readonly、数值 valueEnum、Captcha、Upload 无后端约束。
- 更新中英文 ProTable、SchemaForm、EditableProTable 文档，标明字段复用和 valueType 新增项。
- 更新 VitePress 导航/组件索引、根 README、包 README、快速开始和兼容矩阵中的公开组件清单。
- 示例使用 Vue SFC 模板并纳入 apps/docs 的 vue-tsc 范围。

## 13. 测试契约

### 13.1 单元测试

- `pro-form-fields-options.test.ts`：归一化、优先级、空远程结果、失败保留、竞态、卸载、数值 Map/item.value。
- `pro-form-fields.test.ts`：19 个组件的 modelValue、fieldMode、FormItem、props 优先级、事件合并、slots、disabled、readonly、emptyText、重置回显。
- Captcha：loading、成功倒计时、false、reject、重复点击、resetCountdown。
- Upload：fileList 桥接、change/drop、无 transport 时 beforeUpload=false、readonly 文件名。
- 上层现有测试：全部保留，并新增 ProTable 搜索/编辑、SchemaForm 三个新 valueType/timeRange、Editable 外层 FormItem 回归。
- 覆盖率 include 必须纳入 `src/pro-form-fields/**/*.ts` 与关键 SFC 可测逻辑；全局门槛不下降。

### 13.2 Browser Mode

- 覆盖文本、checked、选项异步、日期、上传入口、Captcha 倒计时的代表性真实交互。
- 覆盖 ProTable 查询/重置、SchemaForm 校验/异步选项、EditableProTable 行编辑主流程。
- 当前机器浏览器 revision 不匹配时不得擅自安装；在 test-report 标记无法验证，并继续执行非浏览器检查。

### 13.3 必跑命令

```text
pnpm typecheck
pnpm test:coverage
pnpm lint:vue
pnpm build
pnpm docs:build
pnpm --filter antdv-next-pro verify:package
pnpm test:browser  # 仅浏览器环境可用时
```

## 14. 并行实施边界

确认本文档后，阶段 3 按同一契约并行：

- **核心/后端角色（无服务器端）**：`types.ts`、`options.ts`、`readonly.ts`、`useFieldOptions.ts`、根公共类型扩展及纯逻辑测试；不得修改 Vue 组件和 docs。
- **前端角色**：19 个公开 SFC、FieldControl、ProFormField、fieldRegistry、目录/根导出和组件专项测试；不得修改核心角色负责的纯逻辑文件。

并行完成后再由独立集成角色修改 ProTable、SchemaForm、EditableProTable、兼容适配层和文档。任何契约冲突先回写本文档。

## 15. 无后端接口声明

本功能没有 HTTP 端点、状态码、数据库模型或持久化迁移：

- `request(params)` 由组件消费者提供并返回选项数组。
- `onGetCaptcha()` 由消费者提供并决定是否开始倒计时。
- Upload 的 action/customRequest 由消费者提供；组件库不保存文件。

因此“后端角色”仅负责框架无关的类型、选项归一化、竞态和只读格式化核心，不创建服务器代码。

## 16. 契约确认项

本契约已经固定以下决策：

1. 裸控件模式命名为 `fieldMode='field'`，默认表单项模式为 `'form-item'`。
2. Vue 模板友好别名为 `ProFormTextPassword`、`ProFormRadioGroup`。
3. 本期只新增 `treeSelect`、`slider`、`segmented` 三个 valueType。
4. Captcha 和两个 Upload 组件不映射 valueType，也不内置后端。
5. 日期值保持 Dayjs，Upload 值保持 fileList 数组，checked 型字段由 FieldControl 桥接。
6. 数值 valueEnum 通过 ReadonlyMap 或 item.value 保证类型，不对普通对象键做危险猜测。
