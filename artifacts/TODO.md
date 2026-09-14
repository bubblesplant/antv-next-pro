# antv-next-pro TODO

状态：已完成。记录面向 Vue Vapor 的组件编写规范、ProFormFields 表单项封装、上层组件改造与 docs 更新结果。

## 待办事项

- [x] **统一优先使用模板组件，为后续兼容 Vue Vapor 做准备**
  - 所有组件凡是能用模板表达的，均采用 Vue SFC（`.vue` + `<template>`）实现，逻辑使用 `<script setup lang="ts">`，不使用 JSX / TSX 编写组件视图。
  - 条件渲染、列表、插槽与动态组件优先使用模板语法；确实无法用模板实现的场景才保留必要的渲染函数，并说明原因。
  - 梳理现有组件中的 JSX / TSX 与 `h()` 渲染逻辑，逐步迁移可模板化的部分；重点包括 `schema-form/SchemaFormField.ts`、`table/ValueTypeControl.ts` 和 `schema-form/SchemaFormBody.vue`。前两个文件当前使用的是 `h()` 渲染函数，并非 TSX。
  - 保持现有 props、事件、插槽和公开 API 的行为兼容；此次调整用于减少未来迁移成本，后续结合 Vue Vapor 与 `antdv-next` 的实际支持情况验证兼容性。
  - 验收：可模板化的组件视图已改为 `<template>`，保留的渲染函数有明确理由，现有组件功能与类型检查通过。

- [x] **参考 Pro Components 的 ProFormFields，二次封装基础控件与 Form.Item**
  - 参考 Ant Design Pro Components 的 ProFormFields 表单项设计，将 `antdv-next` 基础控件与 `Form.Item`（项目中的 `FormItem`）组合为可独立使用的 `ProForm*` 组件，并统一采用 `.vue` + `<template>` 实现。
  - 以下方组件清单中的 19 项作为完整封装目标；先梳理现有 `valueType` 与表单控件的对应关系，优先复用已有能力，再补齐缺失组件及适用的 Schema 映射。
  - 统一表单项 API：支持 `name`、`label`、`rules` 等常用配置，通过 `formItemProps` 透传表单项属性，通过 `fieldProps` 透传基础控件属性，并明确同名配置的优先级。
  - 按 Vue 使用习惯设计双向绑定、事件和插槽；适配基础控件的 `value` / `checked` 差异，统一处理禁用、只读与校验展示；选项类组件复用 `valueEnum`、`options`、`request` 与加载状态处理。
  - 区分控件层与表单项层，支持只需要控件的场景，避免重复嵌套 `FormItem`，为后续上层组件改造提供统一能力。
  - 补齐组件导出与 TypeScript 类型，支持独立使用及 Schema 配置复用；使用文档与示例纳入后续 docs 更新。
  - 为 `ProFormText.Password`、`ProFormRadio.Group` 提供适合 Vue 模板使用的导出方式，并在文档中说明与参考组件命名的对应关系。
  - 验收：独立使用与上层组件复用均可正常工作，覆盖值更新、校验、重置、属性与插槽透传、异步选项和只读场景，并通过现有功能回归验证。

- [x] **基于二次封装的 ProFormFields 改造 ProTable、SchemaForm 与 EditableProTable**
  - 在所需 ProFormFields 组件封装完成后推进改造，统一复用字段控件、表单项与 `valueType` 映射，收敛三个组件中的重复实现。
  - ProTable：搜索表单接入 ProFormFields，统一处理 `fieldProps`、`formItemProps`、选项加载、查询与重置；可编辑单元格复用对应控件能力。
  - SchemaForm：根据 Schema 配置渲染对应 ProFormFields，统一值绑定、字段路径、校验、联动与只读行为，保持分组、列表和自定义表单项能力。
  - EditableProTable：编辑表单与可编辑单元格接入 ProFormFields，保持新增、编辑、校验、保存、取消及数据同步行为。
  - 保持现有 props、事件、插槽与公开 API 的行为兼容，避免重复嵌套 `FormItem`；新增和调整的组件视图继续优先使用 `<template>`。
  - 验收：三个组件均复用 ProFormFields，查询、表单提交和行编辑等核心流程回归通过，类型检查通过。

- [x] **同步更新 docs 文档与示例**
  - 更新 `apps/docs`，补齐上述 19 项 ProFormFields 的组件说明、API、默认行为与使用示例，说明 `fieldProps`、`formItemProps`、双向绑定、事件和插槽的使用方式。
  - 同步修改 ProTable、SchemaForm 与 EditableProTable 文档，展示基于 ProFormFields 的用法、`valueType` 映射及自定义表单项扩展方式。
  - 示例统一优先使用 `.vue` + `<template>`，补充独立表单项、Schema 表单、表格搜索与行编辑示例，并更新导航、组件索引和相关链接。
  - 验收：文档与最终实现一致，示例可正常运行，相关链接可访问，docs 构建通过。

## ProFormFields 组件清单

以下为参考 Pro Components 的目标组件与能力要求，均已实现。链接指向对应的 Ant Design 基础组件文档，实际封装使用 `antdv-next`。

| 状态 | 组件                                                                           | 使用场景与能力要求                                                                       |
| ---- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 完成 | [ProFormText](https://ant.design/components/input-cn/)                         | 输入各类文本。                                                                           |
| 完成 | [ProFormDigit](https://ant.design/components/input-number-cn/)                 | 输入数字；默认保留 2 位小数、最小值为 0，支持覆盖或关闭这些默认限制。                    |
| 完成 | [ProFormText.Password](https://ant.design/components/input-cn/#Input.Password) | 输入密码。                                                                               |
| 完成 | [ProFormTextArea](https://ant.design/components/input-cn/)                     | 输入多行文本。                                                                           |
| 完成 | ProFormCaptcha                                                                 | 输入验证码，支持与发送验证码接口配合使用。                                               |
| 完成 | [ProFormDatePicker](https://ant.design/components/date-picker-cn/)             | 选择日期。                                                                               |
| 完成 | [ProFormDateTimePicker](https://ant.design/components/date-picker-cn/)         | 选择日期和时间。                                                                         |
| 完成 | [ProFormDateRangePicker](https://ant.design/components/date-picker-cn/)        | 选择日期区间。                                                                           |
| 完成 | [ProFormDateTimeRangePicker](https://ant.design/components/date-picker-cn/)    | 选择日期和时间区间。                                                                     |
| 完成 | [ProFormSelect](https://ant.design/components/select-cn/)                      | 从多个选项中选择；支持通过 `request` 和 `valueEnum` 生成选项。                           |
| 完成 | [ProFormTreeSelect](https://ant.design/components/tree-select-cn/)             | 从树形选项中选择；支持通过 `request` 和 `valueEnum` 生成选项，并明确树形数据的映射方式。 |
| 完成 | [ProFormCheckbox](https://ant.design/components/checkbox-cn/)                  | 复选控件；在 Checkbox 基础上支持 `layout`，支持通过 `request` 和 `valueEnum` 生成选项。  |
| 完成 | [ProFormRadio.Group](https://ant.design/components/radio-cn/)                  | 展示全部选项并单选；支持通过 `request` 和 `valueEnum` 生成选项。                         |
| 完成 | [ProFormSlider](https://ant.design/components/slider-cn/)                      | 在数值区间或自定义区间内选择，支持连续值或离散值。                                       |
| 完成 | [ProFormSwitch](https://ant.design/components/switch-cn/)                      | 输入两个互斥状态，通常为 `true` / `false`。                                              |
| 完成 | [ProFormUploadButton](https://ant.design/components/upload-cn/)                | 按钮样式的文件上传。                                                                     |
| 完成 | [ProFormUploadDragger](https://ant.design/components/upload-cn/)               | 拖拽区域样式的文件上传，适用于需要突出上传入口的表单。                                   |
| 完成 | ProFormMoney                                                                   | 通用金额输入。                                                                           |
| 完成 | [ProFormSegmented](https://ant.design/components/segmented-cn/)                | 分段控制器，用于在一组选项中进行选择。                                                   |
