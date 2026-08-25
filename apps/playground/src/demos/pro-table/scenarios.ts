export type ProTableDemoImplementation = 'native' | 'vue-map'

export type ProTableDemoGroupId =
  | 'basic'
  | 'search-bar-type'
  | 'search-and-filter'
  | 'custom-search-form'
  | 'table-features'
  | 'custom-toolbar'
  | 'card-table'
  | 'no-search-table'
  | 'value-types'
  | 'internationalization'
  | 'rtl'
  | 'theme'
  | 'error-boundary'
  | 'other-examples'
  | 'list-toolbar'

export type ProTableDemoValidationPoints =
  | readonly [string, string]
  | readonly [string, string, string]
  | readonly [string, string, string, string]

export interface ProTableDemoScenario {
  order: number
  id: string
  title: string
  group: ProTableDemoGroupId
  description: string
  validationPoints: ProTableDemoValidationPoints
  implementation: ProTableDemoImplementation
  mode: string
}

type ProTableDemoScenarioDefinition = Omit<ProTableDemoScenario, 'order'>

export const proTableDemoGroups: ReadonlyArray<{
  id: ProTableDemoGroupId
  title: string
}> = [
  { id: 'basic', title: '基础用法' },
  { id: 'search-bar-type', title: '搜索栏类型切换' },
  { id: 'search-and-filter', title: '搜索与筛选' },
  { id: 'custom-search-form', title: '搜索表单自定义' },
  { id: 'table-features', title: '表格功能' },
  { id: 'custom-toolbar', title: 'Toolbar 自定义' },
  { id: 'card-table', title: '卡片表格' },
  { id: 'no-search-table', title: '无搜索表格' },
  { id: 'value-types', title: '值类型示例' },
  { id: 'internationalization', title: '国际化相关的配置' },
  { id: 'rtl', title: 'RTL (النسخة العربية)' },
  { id: 'theme', title: '主题' },
  { id: 'error-boundary', title: '自定义错误边界' },
  { id: 'other-examples', title: '其它示例' },
  { id: 'list-toolbar', title: '列表工具栏 / 代码演示' },
]

export const proTableDemoScenarios: readonly ProTableDemoScenario[] = (
  [
    {
      id: 'basic-query-table',
      title: '查询表格',
      group: 'basic',
      description: '用远程 request 串联查询、分页、排序和筛选的标准 ProTable。',
      validationPoints: [
        '首次进入自动请求数据',
        '查询后回到第一页',
        '分页、排序和筛选参数正确传入 request',
      ],
      implementation: 'native',
      mode: 'query-table',
    },
    {
      id: 'basic-no-query-form',
      title: '无查询表单',
      group: 'basic',
      description: '关闭查询区域，仅保留远程数据、表格操作和分页。',
      validationPoints: ['页面不渲染查询表单', '表格仍能正常请求和翻页'],
      implementation: 'native',
      mode: 'no-query-form',
    },
    {
      id: 'basic-card-bordered',
      title: '卡片边框',
      group: 'basic',
      description: '通过 Vue 外层卡片与样式映射参考示例的卡片、表格边框组合。',
      validationPoints: ['卡片容器边框和表格边框可独立辨识', '切换边框展示不影响查询和分页'],
      implementation: 'vue-map',
      mode: 'card-bordered',
    },
    {
      id: 'basic-data-source',
      title: '使用 DataSource',
      group: 'basic',
      description: '直接绑定本地 dataSource；该项存在于官方目录，但参考页未渲染独立 demo 卡。',
      validationPoints: ['不调用远程 request 即可展示数据', '更新受控 dataSource 后表格同步刷新'],
      implementation: 'native',
      mode: 'data-source',
    },
    {
      id: 'basic-no-toolbar',
      title: '无 ToolBar 的表格',
      group: 'basic',
      description: '关闭顶部工具栏，只展示需要的搜索、表格和分页区域。',
      validationPoints: ['顶部工具栏完全隐藏', '搜索、表格和分页功能保持可用'],
      implementation: 'native',
      mode: 'no-toolbar',
    },
    {
      id: 'search-bar-type-switch',
      title: '搜索栏类型切换',
      group: 'search-bar-type',
      description: '用 Vue 状态切换标准查询面板与替代筛选形态，不宣称兼容 React 表单类型 API。',
      validationPoints: ['切换后搜索字段值按预期保留或重置', '两种形态提交相同的业务查询参数'],
      implementation: 'vue-map',
      mode: 'search-bar-type-switch',
    },
    {
      id: 'search-no-options',
      title: '查询（无按钮）表格',
      group: 'search-and-filter',
      description: '隐藏默认查询操作按钮，由字段变化或外部控件触发查询。',
      validationPoints: ['查询区不显示默认查询和重置按钮', '外部触发后 request 收到最新条件'],
      implementation: 'vue-map',
      mode: 'search-without-options',
    },
    {
      id: 'search-light-filter',
      title: '轻量筛选替换查询表单',
      group: 'search-and-filter',
      description: '以 Vue LightFilter 风格控件替代默认查询面板，并把值映射给 ProTable。',
      validationPoints: ['轻量筛选值可添加和清除', '筛选条件变化后表格数据同步更新'],
      implementation: 'vue-map',
      mode: 'light-filter',
    },
    {
      id: 'search-keywords',
      title: '使用自带 keyWords 搜索的 table',
      group: 'search-and-filter',
      description: '通过 Vue 工具栏搜索框映射 keyWords 搜索，并合并进 request 参数。',
      validationPoints: [
        '输入关键词能够筛选结果',
        '清空关键词恢复完整数据',
        '关键词与分页参数可同时提交',
      ],
      implementation: 'vue-map',
      mode: 'keywords-search',
    },
    {
      id: 'search-custom-options',
      title: '搜索选项自定义',
      group: 'search-and-filter',
      description: '用 Vue 模板定制搜索操作区的按钮、文案和附加行为。',
      validationPoints: ['自定义按钮按指定顺序展示', '查询和重置仍分别执行正确动作'],
      implementation: 'vue-map',
      mode: 'custom-search-options',
    },
    {
      id: 'search-required-fields',
      title: '必填的查询表单',
      group: 'search-and-filter',
      description: '在 Vue 查询表单层执行必填校验，通过后再更新 ProTable 查询条件。',
      validationPoints: [
        '空值提交时显示必填提示',
        '校验失败时不发起数据请求',
        '填写必填项后可以正常查询',
      ],
      implementation: 'vue-map',
      mode: 'required-search-form',
    },
    {
      id: 'custom-search-linkage',
      title: '动态联动搜索栏',
      group: 'custom-search-form',
      description: '根据其它查询字段动态改变选项、可见性或可用状态。',
      validationPoints: [
        '上游字段变化会更新依赖字段',
        '失效的依赖值会被清理',
        '联动后的参数与界面一致',
      ],
      implementation: 'vue-map',
      mode: 'linked-search-form',
    },
    {
      id: 'custom-search-form-ref',
      title: '通过 formRef 来操作查询表单',
      group: 'custom-search-form',
      description: '以 Vue 组合式状态等价映射 formRef，用外部按钮读写、提交和重置查询条件。',
      validationPoints: [
        '外部操作可以设置和读取查询字段值',
        '外部提交会触发表格请求',
        '外部重置后字段与数据同时恢复',
      ],
      implementation: 'vue-map',
      mode: 'search-form-ref',
    },
    {
      id: 'feature-batch-actions',
      title: '表格批量操作',
      group: 'table-features',
      description: '通过行选择事件与 Vue 工具栏映射批量操作区。',
      validationPoints: [
        '勾选行后显示选中数量',
        '批量操作接收正确的行 key 和记录',
        '清空选择后批量区恢复',
      ],
      implementation: 'vue-map',
      mode: 'batch-actions',
    },
    {
      id: 'feature-nested-table',
      title: '嵌套表格',
      group: 'table-features',
      description: '在展开内容中组合子级 ProTable，映射官方嵌套表格结构。',
      validationPoints: ['父行可以展开和收起', '子表数据与父行正确关联', '父子表交互状态互不干扰'],
      implementation: 'vue-map',
      mode: 'nested-table',
    },
    {
      id: 'feature-split-layout',
      title: '左右结构',
      group: 'table-features',
      description: '以 Vue 布局组合左侧分类导航和右侧 ProTable。',
      validationPoints: [
        '左右区域在桌面端稳定排列',
        '选择左侧分类会刷新右侧参数',
        '窄屏下布局可以正常收缩',
      ],
      implementation: 'vue-map',
      mode: 'split-layout',
    },
    {
      id: 'feature-polling',
      title: '表格轮询',
      group: 'table-features',
      description: '使用 polling 周期性重新请求，并在页面隐藏时暂停提交。',
      validationPoints: [
        '启用后按间隔重复请求',
        '停止轮询后不再自动请求',
        '页面恢复可见后继续更新',
      ],
      implementation: 'native',
      mode: 'polling',
    },
    {
      id: 'feature-date-formatter',
      title: 'dateFormatter - 日期格式化',
      group: 'table-features',
      description:
        '通过 postData 派生格式化字段，并用 valueType 映射展示行为，不冒充 React dateFormatter Prop。',
      validationPoints: [
        'request 返回记录经 postData 生成格式化字段',
        '切换格式规则后生成约定展示值',
        '原始记录不会被意外改写',
      ],
      implementation: 'vue-map',
      mode: 'date-formatter',
    },
    {
      id: 'toolbar-custom',
      title: 'Toolbar 自定义',
      group: 'custom-toolbar',
      description: '使用 toolbar.title 和 toolbar.actions 的 Vue VNode 配置映射自定义工具栏。',
      validationPoints: [
        '自定义标题与操作区同时展示',
        '工具栏按钮可以调用表格 ref',
        '内建选项与自定义操作同时展示',
      ],
      implementation: 'vue-map',
      mode: 'custom-toolbar',
    },
    {
      id: 'toolbar-custom-table-body',
      title: '表格主体自定义',
      group: 'custom-toolbar',
      description: '通过 Vue 插槽和外层容器映射表格主体的自定义渲染。',
      validationPoints: [
        '自定义主体包裹结构正确渲染',
        '加载态、空态和数据态均可辨识',
        '分页与表格主体保持联动',
      ],
      implementation: 'vue-map',
      mode: 'custom-table-body',
    },
    {
      id: 'card-table',
      title: '卡片表格',
      group: 'card-table',
      description: '把标题、附加操作和 ProTable 组合在卡片容器中。',
      validationPoints: [
        '卡片标题和附加操作正确展示',
        '表格宽度适配卡片容器',
        '卡片操作不会破坏表格状态',
      ],
      implementation: 'vue-map',
      mode: 'card-table',
    },
    {
      id: 'no-search-table',
      title: '无搜索表格',
      group: 'no-search-table',
      description: '使用 search=false 关闭搜索区，保留表格和所需工具选项。',
      validationPoints: ['搜索区不渲染', '表格请求、刷新和分页仍正常'],
      implementation: 'native',
      mode: 'no-search-table',
    },
    {
      id: 'value-type-date',
      title: 'valueType - 日期类',
      group: 'value-types',
      description: '集中展示日期、日期时间、日期范围、时间和时间范围值类型。',
      validationPoints: [
        '各日期类只读值格式正确',
        '查询控件与列 valueType 对应',
        '范围值可以完整输入和清除',
      ],
      implementation: 'native',
      mode: 'date-value-types',
    },
    {
      id: 'value-type-number',
      title: 'valueType - 数字类',
      group: 'value-types',
      description: '集中展示 digit、money 和 percent 的输入与只读格式。',
      validationPoints: [
        '数字输入保持数值语义',
        '金额前缀和百分比后缀正确',
        '排序与查询使用未格式化的原始值',
      ],
      implementation: 'native',
      mode: 'number-value-types',
    },
    {
      id: 'value-type-style',
      title: 'valueType - 样式类',
      group: 'value-types',
      description: '以当前支持的 valueType、valueEnum 和 render 映射官方样式类展示。',
      validationPoints: [
        '支持的基础值类型逐项可见',
        '状态文本和颜色语义一致',
        '未原生支持的样式通过 render 明确映射',
      ],
      implementation: 'vue-map',
      mode: 'style-value-types',
    },
    {
      id: 'value-type-select',
      title: 'valueType - 选择类',
      group: 'value-types',
      description: '展示 select、radio、checkbox、switch 与异步选项。',
      validationPoints: [
        'valueEnum 文本正确映射',
        '选择控件更新正确值',
        '异步选项加载完成后可选择',
      ],
      implementation: 'native',
      mode: 'select-value-types',
    },
    {
      id: 'value-type-custom',
      title: '自定义 valueType',
      group: 'value-types',
      description: '通过 render、renderText 和 renderFormItem 映射自定义展示与编辑行为。',
      validationPoints: [
        '自定义只读内容正确渲染',
        '编辑控件通过 update 写回值',
        '查询、展示和编辑的转换边界清晰',
      ],
      implementation: 'vue-map',
      mode: 'custom-value-type',
    },
    {
      id: 'internationalization',
      title: '国际化相关的配置',
      group: 'internationalization',
      description: '通过 Antdv Next ConfigProvider 和 Vue 文案配置映射国际化示例。',
      validationPoints: [
        '表头、状态与查询文案按语言切换',
        '日期和分页控件使用对应语言',
        '切换语言不丢失表格状态',
      ],
      implementation: 'vue-map',
      mode: 'internationalization',
    },
    {
      id: 'rtl-arabic',
      title: 'RTL (النسخة العربية)',
      group: 'rtl',
      description: '使用 ConfigProvider 的 RTL 方向与阿拉伯语文案映射参考布局。',
      validationPoints: [
        '表格和操作区按 RTL 排列',
        '分页及方向性图标显示正确',
        '阿拉伯语内容不会溢出',
      ],
      implementation: 'vue-map',
      mode: 'rtl-arabic',
    },
    {
      id: 'theme-dark-compact',
      title: '黑色主题 / 紧凑主题',
      group: 'theme',
      description: '通过 Antdv Next 主题令牌、密度和容器样式映射黑色与紧凑主题。',
      validationPoints: [
        '深色主题下文本与边框对比可读',
        '紧凑模式会减小表格密度',
        '主题切换不重置查询和分页',
      ],
      implementation: 'vue-map',
      mode: 'dark-compact-theme',
    },
    {
      id: 'custom-error-boundary',
      title: '自定义错误边界',
      group: 'error-boundary',
      description: '使用 Vue errorCaptured 边界映射单元格渲染异常的降级界面。',
      validationPoints: [
        '渲染异常被局部边界捕获',
        '显示可理解的降级内容',
        '其它 demo 和页面导航保持可用',
      ],
      implementation: 'vue-map',
      mode: 'custom-error-boundary',
    },
    {
      id: 'disabled-error-boundary',
      title: '取消自定义错误边界',
      group: 'error-boundary',
      description: '展示未启用自定义降级层时的 Vue 错误传播行为，并限制影响范围。',
      validationPoints: [
        '示例明确显示边界关闭状态',
        '错误行为与自定义边界示例可对比',
        '测试容器隔离错误避免破坏整个 playground',
      ],
      implementation: 'vue-map',
      mode: 'disabled-error-boundary',
    },
    {
      id: 'other-columns-state',
      title: '列状态 columnsState',
      group: 'other-examples',
      description: '演示列显隐、顺序、固定位置以及浏览器存储持久化。',
      validationPoints: [
        '切换列显隐后表头即时更新',
        'order 和 fixed 配置正确生效',
        '刷新页面后持久化状态恢复',
      ],
      implementation: 'native',
      mode: 'columns-state',
    },
    {
      id: 'other-custom-setting-icon',
      title: '自定义列设置图标',
      group: 'other-examples',
      description: '以 Vue 工具栏按钮映射自定义列设置图标，并复用列状态逻辑。',
      validationPoints: ['自定义图标替代默认入口', '点击后可以控制列显隐', '图标具备可访问名称'],
      implementation: 'vue-map',
      mode: 'custom-column-setting-icon',
    },
    {
      id: 'other-content-query-item',
      title: '内容类查询项',
      group: 'other-examples',
      description: '通过 Vue 自定义查询控件映射非标准输入型查询项。',
      validationPoints: [
        '内容型查询项可以正常渲染',
        '交互结果能转换为请求参数',
        '重置后自定义控件同步清空',
      ],
      implementation: 'vue-map',
      mode: 'content-query-item',
    },
    {
      id: 'list-toolbar-basic',
      title: '列表工具栏-基本使用',
      group: 'list-toolbar',
      description: '用 toolbar.title 和 toolbar.actions 的 Vue VNode 组合标题、描述和操作按钮。',
      validationPoints: ['标题和描述层级清晰', '主次操作按顺序展示', '工具栏宽度变化时能够换行'],
      implementation: 'vue-map',
      mode: 'list-toolbar-basic',
    },
    {
      id: 'list-toolbar-no-title',
      title: '无标题',
      group: 'list-toolbar',
      description: '省略标题，仅保留列表工具栏操作区。',
      validationPoints: ['标题区域不显示可见内容', '操作区保持正确对齐'],
      implementation: 'vue-map',
      mode: 'list-toolbar-no-title',
    },
    {
      id: 'list-toolbar-multiple-line',
      title: '双行布局',
      group: 'list-toolbar',
      description: '以 Vue VNode 将标题信息组织为两行，并保留独立操作区。',
      validationPoints: ['两行内容顺序符合参考结构', '长标题不会挤压主要操作', '窄屏下布局仍可读'],
      implementation: 'vue-map',
      mode: 'list-toolbar-multiple-line',
    },
    {
      id: 'list-toolbar-tabs',
      title: '带标签',
      group: 'list-toolbar',
      description: '在工具栏中加入 Vue 受控标签，并用当前标签驱动数据。',
      validationPoints: [
        '标签切换状态受控',
        '切换标签后表格参数同步变化',
        '工具栏其它操作仍可使用',
      ],
      implementation: 'vue-map',
      mode: 'list-toolbar-tabs',
    },
    {
      id: 'list-toolbar-title-menu',
      title: '列表工具栏-标题下拉菜单',
      group: 'list-toolbar',
      description: '在标题区域组合受控选择菜单，映射标题菜单的数据联动与键盘交互。',
      validationPoints: [
        '标题区域提供可访问的受控选择菜单',
        '选择菜单项后标题或数据更新',
        '键盘可以访问菜单项',
      ],
      implementation: 'vue-map',
      mode: 'list-toolbar-title-menu',
    },
    {
      id: 'editable-pro-form-validation',
      title: 'ProForm 内 EditableProTable（列校验）',
      group: 'list-toolbar',
      description:
        '用 SchemaForm 字段插槽承载 EditableProTable，映射 ProForm 的受控表格字段与列校验；该项存在于官方目录，但参考页未渲染独立 demo 卡。',
      validationPoints: [
        '可编辑表格作为外层表单字段同步值',
        '列校验失败时阻止保存和表单提交',
        '修正数据后行保存与外层提交均成功',
        '新增和删除行保持完整模型一致',
      ],
      implementation: 'vue-map',
      mode: 'editable-pro-form-validation',
    },
  ] satisfies readonly ProTableDemoScenarioDefinition[]
).map((scenario, index) => ({
  ...scenario,
  order: index + 1,
}))
