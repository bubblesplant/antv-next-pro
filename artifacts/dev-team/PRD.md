# ProFormFields 与上层组件统一改造 PRD

状态：已确认
日期：2026-09-14
范围来源：`artifacts/TODO.md` 中除“统一优先使用模板组件”外的剩余三项。

## 1. 背景

项目已经完成组件视图优先迁移到 Vue SFC 与 `<template>` 的基础工作。当前 ProTable 与 SchemaForm 各自维护字段控件映射、选项加载、只读展示和表单项组合逻辑，存在重复实现；EditableProTable 则通过 ProTable 间接复用这些能力。

目前 19 个目标 ProFormFields 均未形成独立、可公开使用的组件：其中 13 项只有内部控件能力可复用，Captcha、TreeSelect、Slider、UploadButton、UploadDragger、Segmented 6 项完全缺失。项目也没有对应的公开导出、统一类型、专项测试和文档。

## 2. 目标

1. 提供 19 个可独立使用的 ProFormFields，并统一表单项、字段属性、双向绑定、只读、禁用、选项与异步请求行为。
2. 建立共享字段核心，收敛 ProTable、SchemaForm 和 EditableProTable 的重复字段渲染逻辑。
3. 同时支持“带 FormItem 的表单项模式”和“不嵌套 FormItem 的裸控件模式”。
4. 保持现有 props、事件、插槽、公开 API 和关键交互行为兼容。
5. 补齐中英文文档、示例、导航、README、自动化测试和包导出验证。
6. 所有新增组件视图采用 `.vue`、`<template>` 与 `<script setup lang="ts">`。

## 3. 非目标

- 不开发验证码发送、文件上传或选项查询的后端接口；组件只提供前端交互契约与回调/透传能力。
- 不引入或绑定特定请求库。
- 不要求 19 个组件与 `valueType` 一一对应；仅为适合 Schema 驱动的字段增加映射。
- 不借本次改造重命名或删除现有公开 API，也不改变现有表格、表单的数据协议。
- 不对 Ant Design Pro Components 做逐像素或内部实现复制，仅参考其产品能力与命名。
- 不回退或覆盖当前工作区已经完成但尚未提交的模板化改造。

## 4. 用户故事

1. 业务开发者可以直接使用任一 `ProForm*` 组件，通过统一 API 完成绑定、校验、重置和属性透传。
2. 业务开发者可以只使用字段控件而不重复嵌套 `FormItem`，适配表格单元格和自定义布局。
3. SchemaForm 用户可以继续使用现有 Schema、字段插槽、嵌套路径、依赖联动和 FormList，并获得新增字段能力。
4. ProTable 用户可以在搜索表单和可编辑单元格中获得一致的字段行为。
5. EditableProTable 用户可以保持新增、编辑、校验、保存、取消和草稿同步流程不变。
6. 组件维护者可以在一个共享字段核心中修复映射、选项、只读或绑定问题，而不必同步修改多套实现。
7. 文档读者可以从中英文文档中查到 19 个组件的 API、默认行为、插槽和可运行示例。

## 5. ProFormFields 产品范围

| #   | 组件                         | 必须具备的核心能力                                                             |
| --- | ---------------------------- | ------------------------------------------------------------------------------ |
| 1   | `ProFormText`                | 单行文本输入、清空、只读展示、通用输入属性透传。                               |
| 2   | `ProFormDigit`               | 数字输入；默认最小值 0、精度 2，且两项均可覆盖或显式关闭。                     |
| 3   | `ProFormText.Password`       | 密码输入、显隐切换透传，并提供适合 Vue 模板的具名导出。                        |
| 4   | `ProFormTextArea`            | 多行文本、行数/自适应高度等属性透传。                                          |
| 5   | `ProFormCaptcha`             | 验证码输入、发送按钮、异步发送状态、倒计时、失败后恢复；发送逻辑由使用者提供。 |
| 6   | `ProFormDatePicker`          | 日期选择与现有日期值协议兼容。                                                 |
| 7   | `ProFormDateTimePicker`      | 日期时间选择与现有日期时间值协议兼容。                                         |
| 8   | `ProFormDateRangePicker`     | 日期区间选择与重置。                                                           |
| 9   | `ProFormDateTimeRangePicker` | 日期时间区间选择与重置。                                                       |
| 10  | `ProFormSelect`              | `options`、`valueEnum`、`request`、加载态、单选/多选及只读标签。               |
| 11  | `ProFormTreeSelect`          | 树形选择、异步树数据、`valueEnum`/树数据映射及只读标签。                       |
| 12  | `ProFormCheckbox`            | 单个复选与组选项模式、`layout`、异步选项及 `checked` 绑定差异。                |
| 13  | `ProFormRadio.Group`         | 单选组、异步选项，并提供适合 Vue 模板的具名导出。                              |
| 14  | `ProFormSlider`              | 连续/离散数值、范围模式、marks 等属性透传。                                    |
| 15  | `ProFormSwitch`              | `checked` 双向绑定、互斥状态、只读展示。                                       |
| 16  | `ProFormUploadButton`        | 按钮式上传入口、受控文件列表、上传属性/事件/插槽透传；不内置后端。             |
| 17  | `ProFormUploadDragger`       | 拖拽式上传入口、受控文件列表、拖拽区内容插槽；不内置后端。                     |
| 18  | `ProFormMoney`               | 金额输入、格式化/解析能力透传，并与现有 money 值语义兼容。                     |
| 19  | `ProFormSegmented`           | 分段选项、`options`/`valueEnum`、禁用项和只读展示。                            |

## 6. 统一行为要求

### 6.1 公共表单项 API

- 支持 `name`、`label`、`rules`、`formItemProps`。
- 支持字段自身的 `v-model`、`fieldProps`、`disabled`、`readonly`。
- 支持默认插槽及组件适用的前缀、后缀、选项、上传内容等具名插槽。
- 表单项模式由组件负责组合 `FormItem`；裸控件模式不得产生额外 `FormItem`。

### 6.2 同名属性优先级

产品层面的默认优先级为：

1. 组件顶层显式属性；
2. `fieldProps` 或 `formItemProps` 中的对应属性；
3. 组件默认值。

`name`、`label`、`rules` 等顶层表单项属性覆盖 `formItemProps` 中的同名值。事件与 class/style 的合并规则由技术契约明确，但不得无声丢弃使用者回调或样式。

### 6.3 选项来源

- 选项类组件统一支持 `options`、`valueEnum`、`request` 与加载状态。
- 明确多来源同时存在时的优先级，避免重复请求和结果相互覆盖。
- 异步请求必须采用“最后一次请求生效”，旧请求不得覆盖新参数结果。
- 请求失败不得清空仍有效的受控值；错误应可被使用者感知。
- 保留数值型 `valueEnum` 的值语义，不因对象键字符串化而悄然改变绑定值。

### 6.4 状态与展示

- `disabled` 阻止交互但保持控件形态；`readonly` 使用统一的只读展示逻辑。
- 空值、0、`false`、空数组必须被正确区分。
- Checkbox、Switch 等控件统一适配 `checked` 与普通字段 `value` 的差异。
- 表单重置后，字段值、校验状态、异步加载状态和倒计时状态应回到合理初始状态。

## 7. 共享字段架构的产品边界

实现应体现两层能力，但最终文件名和类型名由技术契约确定：

1. **FieldCore / 裸控件层**：负责控件选择、值/checked 归一、选项加载、只读展示和字段插槽，不创建 FormItem。
2. **ProFormField / 表单项层**：在裸控件之上组合 FormItem，处理 `name`、`label`、`rules`、校验和表单项插槽。

公开的 19 个组件应复用这两层能力，避免为每个组件复制异步选项、只读和绑定逻辑。

## 8. 上层组件集成

### 8.1 ProTable

- 搜索表单使用表单项模式，消费列级 `fieldProps`、`formItemProps`、选项、查询与重置配置。
- 可编辑单元格使用裸控件模式，避免重复嵌套 FormItem。
- 保留现有查询、筛选、排序、分页、`renderFormItem`、自定义渲染和事件行为。

### 8.2 SchemaForm

- 根据适用的 `valueType`/字段注册映射到共享字段能力。
- 保持嵌套字段路径、FormList、分组/布局、依赖联动、字段转换、异步选项、只读和动态 Schema 行为。
- 自定义字段插槽与 `renderFormItem` 的优先级、参数和直接子节点结构保持兼容。

### 8.3 EditableProTable

- 继续通过 ProTable 复用字段能力，保持新增、编辑、校验、保存、取消、删除与数据同步。
- 明确区分列级 `formItemProps` 和 EditableProTable 整表外层 `formItemProps`，不得产生重复 FormItem。
- 保持树形数据、草稿数据和异步保存流程兼容。

## 9. 兼容性红线

- 不改变现有 `renderFormItem`、动态字段插槽和默认字段渲染的优先级。
- 不改变 SchemaForm 中 FormItem 直接子节点、字段路径和 FormList 结构。
- 不改变依赖字段更新上下文、原地 mutation 后重新读取配置的行为。
- 不允许旧的异步选项请求覆盖新请求。
- 不改变 EditableProTable 草稿、保存、取消、新增、树形数据及整表 FormItem 行为。
- 不改变现有公共类型可接受的值；新增类型应保持向后兼容。
- 不引入 JSX/TSX 组件视图；确需渲染函数时必须记录原因。

## 10. 文档交付

- 在 `apps/docs` 中提供中英文 ProFormFields 文档；19 项均包含用途、API、默认行为和示例。
- 说明 `fieldProps`、`formItemProps`、双向绑定、事件、插槽、裸控件模式和属性优先级。
- 更新 ProTable、SchemaForm、EditableProTable 文档，展示共享字段、`valueType` 映射和自定义字段扩展。
- 更新中英文导航、组件索引、首页/快速开始中适用入口及兼容说明。
- 同步根 README 与包 README 的公共导出和使用示例。
- 示例统一采用 `.vue`、`<template>` 与 `<script setup lang="ts">`，并能被 docs 类型检查覆盖。

## 11. 产品级接口草案

以下仅描述能力形态，准确类型名与参数在技术契约中确定：

```ts
interface CommonProFormFieldProps<Value = unknown> {
  name?: string | number | Array<string | number>
  label?: unknown
  rules?: unknown[]
  modelValue?: Value
  fieldProps?: Record<string, unknown>
  formItemProps?: Record<string, unknown>
  disabled?: boolean
  readonly?: boolean
  fieldOnly?: boolean
}

interface OptionFieldProps<Value = unknown> {
  options?: Array<{ label: unknown; value: Value; disabled?: boolean }>
  valueEnum?: Record<string | number, unknown>
  request?: (params?: Record<string, unknown>) => Promise<unknown[]>
  params?: Record<string, unknown>
}
```

`fieldOnly` 仅为产品草案名，技术契约可选择更符合现有项目习惯的命名，但必须提供等价的裸控件能力。

## 12. 验收标准

- **AC-01**：19 个目标组件全部存在、可按需具名导入，并纳入 Vue 插件安装入口。
- **AC-02**：所有新增组件视图均采用 Vue SFC 模板实现，无新增 JSX/TSX 组件视图。
- **AC-03**：19 个组件共享字段核心，不复制维护选项请求、只读格式化和 value/checked 适配主逻辑。
- **AC-04**：每个适用组件均可在表单项模式和裸控件模式下工作，裸控件模式不创建 FormItem。
- **AC-05**：`name`、`label`、`rules`、`formItemProps`、`fieldProps` 和 `v-model` 行为统一且有类型声明。
- **AC-06**：同名属性优先级符合第 6.2 节，事件与 class/style 不被无声覆盖。
- **AC-07**：所有组件正确处理 disabled、readonly、空值、0、false 和重置。
- **AC-08**：Checkbox、Switch 等 checked 型控件的双向绑定和表单重置正确。
- **AC-09**：选项类组件支持 options、valueEnum、request、加载态和只读标签。
- **AC-10**：异步选项覆盖成功、空结果、失败、参数变化和竞态场景，只有最新请求可生效。
- **AC-11**：数值型 valueEnum 在选择、回显和只读展示中保持原值类型。
- **AC-12**：ProFormText、Password、TextArea 的输入、清空、只读和属性/插槽透传通过验证。
- **AC-13**：ProFormDigit 默认 precision=2、min=0，且默认限制可分别覆盖或关闭。
- **AC-14**：ProFormMoney 的输入、格式化、解析、空值和只读语义与现有 money 行为兼容。
- **AC-15**：四个日期组件的单值/区间值更新、清空、重置和只读展示通过验证。
- **AC-16**：ProFormCaptcha 的发送中状态、成功倒计时、失败恢复和重复点击防护通过验证。
- **AC-17**：ProFormSelect 与 ProFormTreeSelect 的普通/异步选项、单多选及树数据映射通过验证。
- **AC-18**：ProFormCheckbox 支持单个/组选项及 layout；ProFormRadio.Group 支持异步选项。
- **AC-19**：ProFormSlider、Switch、Segmented 的值更新、禁用、只读和属性透传通过验证。
- **AC-20**：两个上传组件支持受控文件列表、上传事件和内容插槽，且不依赖内置后端。
- **AC-21**：Password 与 Radio.Group 均提供可在 Vue 模板直接使用的具名导出，并记录与参考命名的对应关系。
- **AC-22**：ProTable 搜索表单复用 ProFormFields，查询、重置、异步选项和列级表单属性回归通过。
- **AC-23**：ProTable 可编辑单元格复用裸控件能力，编辑、校验和保存流程回归通过。
- **AC-24**：SchemaForm 复用共享字段能力，现有布局、嵌套路径、FormList、依赖、转换和只读流程回归通过。
- **AC-25**：SchemaForm 的 renderFormItem、动态字段插槽和 FormItem 子节点兼容测试通过。
- **AC-26**：EditableProTable 新增、编辑、校验、保存、取消、树形数据和外层 formItemProps 回归通过。
- **AC-27**：适用的新字段完成 valueType/字段注册映射；未映射组件仍可独立使用，且文档明确边界。
- **AC-28**：中英文文档覆盖 19 项组件及三类上层组件集成，导航、索引、README 和链接同步更新。
- **AC-29**：新增单元测试覆盖公共 API、双模式、优先级、重置、插槽、异步竞态、只读和错误路径。
- **AC-30**：类型检查、单元测试/覆盖率、Vue lint、全构建、docs 构建及 ESM/CJS/types/CSS/npm-pack 消费验证全部通过。
- **AC-31**：浏览器环境可用时，ProFormFields 核心交互及三类上层组件主流程 Browser Mode 测试通过；环境不可用时必须记录为无法验证，不擅自安装浏览器。
- **AC-32**：所有验收通过后，`artifacts/TODO.md` 中剩余三项和 19 项组件清单均更新为完成状态。

## 13. 风险与开放问题

1. `antdv-next` 各基础控件的实际 props、事件与插槽可能与 Ant Design React 文档存在差异，技术契约必须以已安装版本为准。
2. Captcha 的倒计时长度、暴露方法和发送回调签名需要在技术契约中固定；默认不持有业务手机号或验证码状态。
3. 上传组件的 `fileList` 受控协议、默认上传行为和错误透传需与 `antdv-next` Upload 实际能力对齐。
4. TreeSelect、Slider、Segmented、Upload 等是否新增 valueType，应按 Schema/表格实际使用价值逐项决定，不为追求数量强行扩展。
5. 当前本机 Playwright 缓存的 Chromium revision 与项目要求不匹配；未经用户明确允许不得安装，Browser Mode 可能在本机标记为无法验证。
6. 当前工作区存在未提交的模板化改动，后续实现必须按文件逐项检查并在其基础上增量修改。

## 14. 参考依据

- 项目 `artifacts/TODO.md`。
- Ant Design 与 Ant Design Pro Components 官方组件文档。
- 当前仓库公开 API、现有单元测试、Browser Mode 测试和兼容性文档。
