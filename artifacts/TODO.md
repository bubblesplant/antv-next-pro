# antv-next-pro TODO

状态：待办。记录组件开发规范与视图层封装的后续事项。

## 待办事项

- [ ] **组件编写尽量不使用 TSX**
  - 优先使用 Vue SFC（`.vue` + `<template>`）编写组件；需要编程式渲染时使用 `h()` 渲染函数。
  - 除确有必要的动态场景外，不新增 `.tsx` 组件文件；存量 TSX 写法（如 `SchemaFormField.ts`、`ValueTypeControl.ts` 中的渲染逻辑）择机收敛为 SFC 或 `h()`。

- [ ] **对每个 view 内的组件做一层中间封装**
  - 在业务视图与组件库之间增加中间层，将 SchemaForm（Form 及各布局别名）、ProTable / EditableProTable 以及 antdv-next 基础组件进行统一的二次封装。
  - 中间层收敛各 view 的通用配置（如 `columns` 约定、`request` 接入、分页/查询/筛选默认行为、主题与尺寸），view 只声明业务差异，避免页面内重复拼装基础组件。
