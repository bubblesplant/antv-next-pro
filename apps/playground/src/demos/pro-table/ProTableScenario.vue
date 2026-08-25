<script setup lang="ts">
import type {
  EditableConfig,
  EditableProTableInstance,
  ProColumns,
  ProColumnsState,
  ProKey,
  SchemaFormColumn,
  SchemaFormInstance,
  ProTableInstance,
  ProTableProps,
  RecordCreatorProps,
} from 'antdv-next-pro'

import { ConfigProvider, InputNumber, SpaceAddon, SpaceCompact, theme } from 'antdv-next'
import arEG from 'antdv-next/locale/ar_EG'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'
import { EditableProTable, ProTable, SchemaForm } from 'antdv-next-pro'
import { computed, h, nextTick, ref } from 'vue'

import { createDemoRequest, demoRows, type DemoQuery, type DemoRow } from './demoData'
import type { ProTableDemoScenario } from './scenarios'
import ScenarioErrorBoundary from './ScenarioErrorBoundary.vue'

const props = defineProps<{
  scenario: ProTableDemoScenario
}>()

const emit = defineEmits<{
  event: [message: string]
}>()

const mode = computed(() => props.scenario.mode)
const isMode = (...modes: string[]) => modes.includes(mode.value)

const statusEnum = {
  running: { text: '进行中', status: 'processing' },
  paused: { text: '已暂停', status: 'warning' },
  done: { text: '已完成', status: 'success' },
}

const englishStatusEnum = {
  running: { text: 'Running', status: 'processing' },
  paused: { text: 'Paused', status: 'warning' },
  done: { text: 'Completed', status: 'success' },
}

const categoryEnum = {
  growth: '增长',
  experience: '体验',
  efficiency: '效能',
}

const priorityEnum = {
  high: { text: '高', status: 'error' },
  medium: { text: '中', status: 'warning' },
  low: { text: '低', status: 'default' },
}

const tableRef = ref<ProTableInstance<DemoRow> | null>(null)
const requestCount = ref(0)
const lastRequest = ref('')
const loadedTotal = ref(0)
const externalQuery = ref<DemoQuery>({})
const requestFailure = ref('')
const localeMode = ref<'zh' | 'en'>('zh')

const requestLabels = computed(() => {
  if (isMode('rtl-arabic')) {
    return { requests: 'طلبات', matches: 'نتائج مطابقة', waiting: 'بانتظار الطلب' }
  }
  if (isMode('internationalization') && localeMode.value === 'en') {
    return { requests: 'requests', matches: 'matches', waiting: 'Waiting for request' }
  }
  return { requests: '次请求', matches: '条匹配', waiting: '等待请求' }
})

const request = createDemoRequest((params, sort, filter) => {
  requestCount.value += 1
  const visibleParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
  )
  lastRequest.value = JSON.stringify({ params: visibleParams, sort, filter })
})

function announce(message: string) {
  emit('event', `${props.scenario.title}：${message}`)
}

function applyQuery(next: DemoQuery, message: string) {
  externalQuery.value = { ...next }
  announce(message)
}

function handleLoad(_rows: DemoRow[], total: number) {
  loadedTotal.value = total
  requestFailure.value = ''
}

function handleRequestError(error: unknown) {
  requestFailure.value = error instanceof Error ? error.message : String(error)
  announce(`请求失败：${requestFailure.value}`)
}

const commonColumns = computed<ProColumns<DemoRow>[]>(() => {
  if (isMode('rtl-arabic')) {
    return [
      { title: 'المشروع', dataIndex: 'project', valueType: 'text', width: 210 },
      { title: 'المالك', dataIndex: 'owner', valueType: 'text', width: 110 },
      {
        title: 'الحالة',
        dataIndex: 'status',
        valueType: 'select',
        valueEnum: {
          running: 'قيد التنفيذ',
          paused: 'متوقف',
          done: 'مكتمل',
        },
        width: 120,
      },
      { title: 'التقدم', dataIndex: 'progress', valueType: 'percent', sorter: true, search: false },
      { title: 'آخر تحديث', dataIndex: 'updatedAt', valueType: 'dateTime', search: false },
    ]
  }

  const english = isMode('internationalization') && localeMode.value === 'en'
  return [
    {
      title: english ? 'Project' : '项目',
      dataIndex: 'project',
      valueType: 'text',
      width: 210,
      copyable: isMode('query-table', 'custom-toolbar'),
    },
    {
      title: english ? 'Owner' : '负责人',
      dataIndex: 'owner',
      valueType: 'text',
      width: 110,
    },
    {
      title: english ? 'Status' : '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: english ? englishStatusEnum : statusEnum,
      filters: english
        ? [
            { text: 'Running', value: 'running' },
            { text: 'Paused', value: 'paused' },
            { text: 'Completed', value: 'done' },
          ]
        : [
            { text: '进行中', value: 'running' },
            { text: '已暂停', value: 'paused' },
            { text: '已完成', value: 'done' },
          ],
      width: 115,
    },
    {
      title: english ? 'Progress' : '进度',
      dataIndex: 'progress',
      valueType: 'percent',
      sorter: true,
      search: false,
      width: 105,
    },
    {
      title: english ? 'Updated' : '最近更新',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      sorter: true,
      search: isMode('internationalization'),
      width: 175,
    },
  ]
})

const dateRows = demoRows.slice(0, 3).map((row, index) => ({
  ...row,
  dateRange: [`2026-08-${String(10 + index).padStart(2, '0')}`, `2026-08-${15 + index}`],
  dateTimeRange: [row.updatedAt, `2026-08-${20 + index} 18:00:00`],
  timeRange: [row.time, '20:30:00'],
}))

const numberRows = demoRows.slice(0, 5)
const selectRows = demoRows.slice(0, 5).map((row, index) => ({
  ...row,
  reviewer: ['lin', 'zhou', 'meng'][index % 3],
}))
const customRows = ref(
  demoRows.slice(0, 4).map((row) => ({ ...row, health: row.score, note: `健康度 ${row.score}` })),
)
const localRows = ref(demoRows.slice(0, 7).map((row) => ({ ...row })))

const dateFormat = ref<'date' | 'dateTime' | 'timestamp'>('date')

function formatUpdatedAt(value: string): string | number {
  if (dateFormat.value === 'date') return value.slice(0, 10)
  if (dateFormat.value === 'dateTime') return value.replaceAll('-', '/')
  return new Date(`${value.replace(' ', 'T')}+08:00`).getTime()
}

const errorTriggered = ref(false)
const errorResetKey = ref(0)

const tableColumns = computed<ProColumns<DemoRow>[]>(() => {
  if (isMode('date-value-types')) {
    return [
      { title: '#', valueType: 'indexBorder', width: 56, search: false },
      { title: '日期', dataIndex: 'createdAt', valueType: 'date', width: 130 },
      { title: '日期时间', dataIndex: 'updatedAt', valueType: 'dateTime', width: 190 },
      { title: '日期范围', dataIndex: 'dateRange', valueType: 'dateRange', width: 220 },
      { title: '日期时间范围', dataIndex: 'dateTimeRange', valueType: 'dateTimeRange', width: 280 },
      { title: '时间', dataIndex: 'time', valueType: 'time', width: 120 },
      { title: '时间范围', dataIndex: 'timeRange', valueType: 'timeRange', width: 210 },
    ]
  }

  if (isMode('number-value-types')) {
    return [
      { title: '项目', dataIndex: 'project', valueType: 'text', width: 210 },
      { title: '访问量', dataIndex: 'visits', valueType: 'digit', sorter: true },
      { title: '预算', dataIndex: 'budget', valueType: 'money', sorter: true },
      { title: '完成度', dataIndex: 'progress', valueType: 'percent', sorter: true },
      { title: '评分', dataIndex: 'score', valueType: 'digit', sorter: true },
    ]
  }

  if (isMode('style-value-types')) {
    return [
      { title: '序号', valueType: 'index', width: 65, search: false },
      { title: '边框序号', valueType: 'indexBorder', width: 85, search: false },
      { title: '项目', dataIndex: 'project', valueType: 'text', copyable: true },
      {
        title: '状态枚举',
        dataIndex: 'status',
        valueType: 'select',
        valueEnum: statusEnum,
      },
      {
        title: '标签组',
        dataIndex: 'tags',
        search: false,
        render(value) {
          return h(
            'span',
            { class: 'tag-cluster' },
            (Array.isArray(value) ? value : []).map((tag) =>
              h('i', { class: 'demo-tag' }, String(tag)),
            ),
          )
        },
      },
      { title: '长文本', dataIndex: 'address', valueType: 'text', ellipsis: true, search: false },
    ]
  }

  if (isMode('select-value-types')) {
    return [
      { title: '项目', dataIndex: 'project', valueType: 'text', width: 210 },
      { title: 'Select', dataIndex: 'category', valueType: 'select', valueEnum: categoryEnum },
      { title: 'Radio', dataIndex: 'priority', valueType: 'radio', valueEnum: priorityEnum },
      {
        title: 'Checkbox',
        dataIndex: 'tags',
        valueType: 'checkbox',
        valueEnum: { 分析: '分析', 增长: '增长', 渠道: '渠道', 体验: '体验' },
      },
      { title: 'Switch', dataIndex: 'enabled', valueType: 'switch' },
      {
        title: '异步选择',
        dataIndex: 'reviewer',
        valueType: 'select',
        request: async () => {
          await new Promise((resolve) => setTimeout(resolve, 180))
          return [
            { label: '林默', value: 'lin' },
            { label: '周芮', value: 'zhou' },
            { label: '孟晴', value: 'meng' },
          ]
        },
      },
    ]
  }

  if (isMode('custom-value-type')) {
    return [
      { title: '项目', dataIndex: 'project', valueType: 'text', editable: false, width: 210 },
      {
        title: '自定义健康度',
        dataIndex: 'health',
        valueType: 'digit',
        search: false,
        render(value) {
          const score = Number(value ?? 0)
          return h('span', { class: 'health-meter' }, [
            h('i', { style: { width: `${score}%` } }),
            h('b', `${score}`),
          ])
        },
        renderFormItem(_column, context) {
          return h('input', {
            type: 'range',
            min: 0,
            max: 100,
            value: Number(context.record.health ?? 0),
            onInput: (event: Event) =>
              context.update(Number((event.target as HTMLInputElement).value)),
          })
        },
      },
      {
        title: 'renderText 转换',
        dataIndex: 'score',
        valueType: 'text',
        search: false,
        renderText: (value) => `S-${String(value).padStart(3, '0')}`,
      },
      { title: '操作', valueType: 'option', search: false, width: 150 },
    ]
  }

  if (isMode('date-formatter')) {
    return [
      { title: '项目', dataIndex: 'project', valueType: 'text', width: 210 },
      { title: '原始日期', dataIndex: 'updatedAt', valueType: 'dateTime', search: false },
      { title: 'postData 格式化结果', dataIndex: 'formattedAt', valueType: 'text', search: false },
      { title: '负责人', dataIndex: 'owner', valueType: 'text' },
    ]
  }

  if (isMode('custom-error-boundary', 'disabled-error-boundary')) {
    return [
      {
        title: '风险单元格',
        dataIndex: 'project',
        valueType: 'text',
        render(value) {
          if (errorTriggered.value) throw new Error(`渲染「${String(value)}」时发生演示异常`)
          return h('strong', String(value))
        },
      },
      ...commonColumns.value.slice(1),
    ]
  }

  return commonColumns.value
})

const localModes = new Set([
  'data-source',
  'date-value-types',
  'number-value-types',
  'style-value-types',
  'select-value-types',
  'custom-value-type',
])

const usesLocalData = computed(() => localModes.has(mode.value))
const resolvedDataSource = computed<DemoRow[] | undefined>(() => {
  if (isMode('data-source')) return localRows.value
  if (isMode('date-value-types')) return dateRows
  if (isMode('number-value-types', 'style-value-types')) return numberRows
  if (isMode('select-value-types')) return selectRows
  if (isMode('custom-value-type')) return customRows.value
  return undefined
})

const externalSearchModes = new Set([
  'search-without-options',
  'light-filter',
  'keywords-search',
  'required-search-form',
  'linked-search-form',
  'search-form-ref',
  'batch-actions',
  'nested-table',
  'split-layout',
  'polling',
  'custom-table-body',
  'card-table',
  'no-search-table',
  'custom-error-boundary',
  'disabled-error-boundary',
  'custom-column-setting-icon',
  'content-query-item',
  'list-toolbar-basic',
  'list-toolbar-no-title',
  'list-toolbar-multiple-line',
  'list-toolbar-tabs',
  'list-toolbar-title-menu',
])

const searchMode = ref<'query' | 'light'>('query')
const draftProject = ref('')
const draftStatus = ref<DemoQuery['status']>()

function switchSearchMode(next: typeof searchMode.value) {
  if (searchMode.value === next) return
  searchMode.value = next
  draftProject.value = ''
  draftStatus.value = undefined
  externalQuery.value = {}
  announce(`搜索栏切换为 ${next === 'query' ? 'QueryFilter' : 'LightFilter'}，查询条件已重置`)
}

const searchConfig = computed<ProTableProps<DemoRow, DemoQuery>['search']>(() => {
  if (isMode('no-query-form', 'no-search-table')) return false
  if (isMode('search-bar-type-switch') && searchMode.value === 'light') return false
  if (externalSearchModes.has(mode.value)) return false
  if (isMode('custom-value-type')) return false
  if (isMode('internationalization')) {
    return { labelWidth: 'auto', span: 6 }
  }
  if (isMode('rtl-arabic')) {
    return { labelWidth: 'auto', span: 8 }
  }
  if (isMode('custom-search-options')) {
    return { labelWidth: 'auto', span: 12, searchText: '立即检索', resetText: '清空条件' }
  }
  return { labelWidth: 'auto', span: isMode('date-value-types') ? 12 : 8, defaultCollapsed: false }
})

const selectedKeys = ref<ProKey[]>([])
const selectedRows = ref<DemoRow[]>([])
const batchMessage = ref('尚未选择记录')

function handleSelection(keys: ProKey[], rows: DemoRow[]) {
  selectedKeys.value = keys
  selectedRows.value = rows
  batchMessage.value = keys.length ? `已选 ${keys.length} 项` : '尚未选择记录'
}

function runBatchAction() {
  if (!selectedKeys.value.length) return
  const names = selectedRows.value.map((row) => row.project).join('、')
  batchMessage.value = `已将 ${selectedKeys.value.length} 个项目标记为已审阅`
  announce(`批量操作：${names}`)
}

function clearBatchSelection() {
  tableRef.value?.clearSelected()
  selectedKeys.value = []
  selectedRows.value = []
  batchMessage.value = '选择已清空'
}

const columnState = ref<Record<string, ProColumnsState>>({})
const customColumnsOpen = ref(false)
const columnsStateStorageKey = 'antdv-next-pro-demo-columns-state-v2'
const columnsStateResetKey = ref(0)
const columnsStateDefaultValue: Record<string, ProColumnsState> = {
  project: { fixed: 'left', order: 0 },
  progress: { order: 1 },
  status: { order: 2 },
  owner: { show: false, order: 3 },
  updatedAt: { fixed: 'right', order: 4 },
}

const columnsStateConfig = computed<ProTableProps<DemoRow, DemoQuery>['columnsState']>(() => {
  if (isMode('columns-state')) {
    return {
      persistenceKey: columnsStateStorageKey,
      persistenceType: 'localStorage',
      defaultValue: columnsStateDefaultValue,
      onChange: (state) => announce(`列状态更新：${Object.keys(state).length} 项`),
    }
  }
  if (isMode('custom-column-setting-icon')) {
    return {
      value: columnState.value,
      onChange: (state) => {
        columnState.value = state
      },
    }
  }
  return undefined
})

function resetColumnsStateDemo() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(columnsStateStorageKey)
  } catch {
    announce('浏览器存储不可用，无法清除持久化列状态')
    return
  }
  columnsStateResetKey.value += 1
  announce('已恢复默认列顺序、固定位置与显隐')
}

const tableRenderKey = computed(() => {
  if (isMode('search-bar-type-switch')) return `${mode.value}-${searchMode.value}`
  if (isMode('columns-state')) return `${mode.value}-${columnsStateResetKey.value}`
  return mode.value
})

function updateColumnVisibility(key: string, show: boolean) {
  columnState.value = {
    ...columnState.value,
    [key]: { ...columnState.value[key], show },
  }
  announce(`${show ? '显示' : '隐藏'}列 ${key}`)
}

function handleColumnVisibilityChange(dataIndex: unknown, event: Event) {
  updateColumnVisibility(String(dataIndex), (event.target as HTMLInputElement).checked)
}

const borderEnabled = ref(true)
const pollEnabled = ref(false)
const compactTheme = ref(true)
const darkTheme = ref(true)

const providerLocale = computed(() => {
  if (isMode('rtl-arabic')) return arEG
  if (isMode('internationalization') && localeMode.value === 'en') return enUS
  return zhCN
})

const providerDirection = computed<'ltr' | 'rtl'>(() => (isMode('rtl-arabic') ? 'rtl' : 'ltr'))
const providerTheme = computed(() => {
  if (!isMode('dark-compact-theme')) return undefined
  const algorithms = []
  if (darkTheme.value) algorithms.push(theme.darkAlgorithm)
  if (compactTheme.value) algorithms.push(theme.compactAlgorithm)
  return { algorithm: algorithms.length === 1 ? algorithms[0] : algorithms }
})

const localeTextConfig = computed<ProTableProps<DemoRow, DemoQuery>['localeText']>(() => {
  if (isMode('internationalization') && localeMode.value === 'en') {
    return {
      search: 'Search',
      reset: 'Reset',
      expand: 'Expand',
      collapse: 'Collapse',
      densityDefault: 'Default density',
      densityCompact: 'Compact density',
      densityLoose: 'Loose density',
      fullScreen: 'Fullscreen',
      reload: 'Reload',
      setting: 'Column settings',
    }
  }
  if (isMode('rtl-arabic')) {
    return {
      search: 'بحث',
      reset: 'إعادة تعيين',
      expand: 'عرض المزيد',
      collapse: 'عرض أقل',
      densityDefault: 'الكثافة الافتراضية',
      densityCompact: 'كثافة مضغوطة',
      densityLoose: 'كثافة مريحة',
      fullScreen: 'ملء الشاشة',
      reload: 'تحديث',
      setting: 'إعدادات الأعمدة',
    }
  }
  return undefined
})

function toolbarButton(label: string, onClick: () => void, active = false) {
  return h('button', { type: 'button', class: ['toolbar-demo-button', { active }], onClick }, label)
}

const activeListTab = ref<'all' | 'running' | 'done'>('all')
const titleScope = ref<'all' | 'mine' | 'attention'>('all')
const titleScopeLabels = {
  all: '全部项目',
  mine: '我负责的',
  attention: '重点关注',
} as const

function setListTab(tab: 'all' | 'running' | 'done') {
  activeListTab.value = tab
  applyQuery(tab === 'all' ? {} : { status: tab }, `切换标签为 ${tab}`)
}

function setTitleScope(scope: typeof titleScope.value) {
  titleScope.value = scope
  applyQuery(
    scope === 'mine' ? { owner: '林默' } : scope === 'attention' ? { priority: 'high' } : {},
    `标题菜单切换为${titleScopeLabels[scope]}`,
  )
}

const toolbarConfig = computed<ProTableProps<DemoRow, DemoQuery>['toolbar']>(() => {
  if (isMode('no-toolbar')) return false
  if (isMode('custom-toolbar')) {
    return {
      title: h('span', { class: 'rich-toolbar-title' }, [
        h('strong', '增长项目清单'),
        h('small', `共 ${loadedTotal.value} 项 · request 驱动`),
      ]),
      actions: h('span', { class: 'toolbar-action-row' }, [
        toolbarButton('重置', () => void tableRef.value?.reset()),
        toolbarButton('刷新', () => void tableRef.value?.reload()),
        toolbarButton('新建项目', () => announce('点击自定义新建操作'), true),
      ]),
    }
  }
  if (isMode('list-toolbar-basic')) {
    return {
      title: h('span', { class: 'rich-toolbar-title' }, [
        h('strong', '营销活动'),
        h('small', '这里是标题描述，可随容器自动换行'),
      ]),
      actions: h('span', { class: 'toolbar-action-row' }, [
        toolbarButton('导出', () => announce('导出当前列表')),
        toolbarButton('创建活动', () => announce('创建活动'), true),
      ]),
    }
  }
  if (isMode('list-toolbar-no-title')) {
    return {
      actions: h('span', { class: 'toolbar-action-row' }, [
        toolbarButton('刷新', () => void tableRef.value?.reload()),
        toolbarButton('新增', () => announce('无标题工具栏新增'), true),
      ]),
    }
  }
  if (isMode('list-toolbar-multiple-line')) {
    return {
      title: h('span', { class: 'two-line-title' }, [
        h('span', [h('strong', '双行列表工具栏'), h('small', '标题信息独占第一行')]),
        h('span', { class: 'toolbar-breadcrumb' }, '全部项目 / 2026 年 / 第三季度'),
      ]),
      actions: h('span', { class: 'toolbar-action-row' }, [
        toolbarButton('下载报表', () => announce('下载双行布局报表')),
        toolbarButton('新建', () => announce('双行布局新建'), true),
      ]),
    }
  }
  if (isMode('list-toolbar-tabs')) {
    return {
      title: h('span', { class: 'toolbar-tabs', role: 'tablist' }, [
        toolbarButton('全部', () => setListTab('all'), activeListTab.value === 'all'),
        toolbarButton('进行中', () => setListTab('running'), activeListTab.value === 'running'),
        toolbarButton('已完成', () => setListTab('done'), activeListTab.value === 'done'),
      ]),
      actions: toolbarButton('新建任务', () => announce('标签工具栏新建任务'), true),
    }
  }
  if (isMode('list-toolbar-title-menu')) {
    return {
      title: h('label', { class: 'title-menu' }, [
        h('span', titleScopeLabels[titleScope.value]),
        h(
          'select',
          {
            value: titleScope.value,
            'aria-label': '切换标题视图',
            onChange: (event: Event) => {
              setTitleScope((event.target as HTMLSelectElement).value as typeof titleScope.value)
            },
          },
          [
            h('option', { value: 'all' }, '全部项目'),
            h('option', { value: 'mine' }, '我负责的'),
            h('option', { value: 'attention' }, '重点关注'),
          ],
        ),
      ]),
      actions: toolbarButton('刷新', () => void tableRef.value?.reload()),
    }
  }
  if (isMode('card-table')) return false
  if (isMode('custom-column-setting-icon')) return { title: '自定义列设置入口' }
  if (isMode('rtl-arabic')) return { title: 'قائمة المشاريع' }
  if (isMode('internationalization')) {
    return { title: localeMode.value === 'en' ? 'Project list' : '项目列表' }
  }
  return { title: isMode('data-source') ? '本地 DataSource' : '项目清单' }
})

const optionsConfig = computed<ProTableProps<DemoRow, DemoQuery>['options']>(() => {
  if (isMode('no-toolbar', 'card-table')) return false
  if (isMode('custom-column-setting-icon')) {
    return { density: true, fullScreen: true, reload: true, setting: false }
  }
  if (isMode('list-toolbar-no-title', 'list-toolbar-multiple-line', 'list-toolbar-tabs')) {
    return { density: false, fullScreen: false, reload: false, setting: false }
  }
  return { density: true, fullScreen: true, reload: true, setting: true }
})

const postData = computed<ProTableProps<DemoRow, DemoQuery>['postData']>(() => {
  if (!isMode('date-formatter')) return undefined
  return (rows) => rows.map((row) => ({ ...row, formattedAt: formatUpdatedAt(row.updatedAt) }))
})

const tableBindings = computed<ProTableProps<DemoRow, DemoQuery>>(() => ({
  columns: tableColumns.value,
  ...(usesLocalData.value
    ? { dataSource: resolvedDataSource.value }
    : { request, params: externalQuery.value }),
  rowKey: 'id',
  search: searchConfig.value,
  localeText: localeTextConfig.value,
  pagination: isMode(
    'date-value-types',
    'number-value-types',
    'style-value-types',
    'select-value-types',
    'custom-value-type',
  )
    ? false
    : { defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10, 20] },
  options: optionsConfig.value,
  toolbar: toolbarConfig.value,
  rowSelection: isMode('batch-actions') ? {} : false,
  polling: isMode('polling') && pollEnabled.value ? 1200 : undefined,
  revalidateOnFocus: isMode('polling'),
  manualRequest: isMode('required-search-form'),
  columnsState: columnsStateConfig.value,
  editable: isMode('custom-value-type')
    ? {
        type: 'single',
        onSave: (_key, row) => announce(`保存自定义健康度 ${String(row.health)}`),
      }
    : false,
  postData: postData.value,
  bordered: isMode('card-bordered') ? borderEnabled.value : false,
  size: isMode('dark-compact-theme') && compactTheme.value ? 'small' : 'middle',
  scroll: isMode('date-value-types', 'select-value-types')
    ? { x: 1150 }
    : isMode('columns-state')
      ? { x: 850 }
      : undefined,
}))

const keyword = ref('')
const requiredOwner = ref('')
const requiredError = ref('')
const linkedCategory = ref<DemoQuery['category']>()
const linkedOwner = ref('')

const linkedOwners = computed(() => {
  const source = linkedCategory.value
    ? demoRows.filter((row) => row.category === linkedCategory.value)
    : demoRows
  return [...new Set(source.map((row) => row.owner))]
})

function applyLiveQuery() {
  applyQuery({ project: draftProject.value, status: draftStatus.value }, '字段变化自动查询')
}

function applyLightFilter(category?: DemoQuery['category'], status?: DemoQuery['status']) {
  applyQuery({ ...externalQuery.value, category, status }, '轻量筛选已更新')
}

function submitKeyword() {
  applyQuery({ keyWords: keyword.value }, `关键词：${keyword.value || '全部'}`)
}

function clearKeyword() {
  keyword.value = ''
  submitKeyword()
}

function submitRequiredSearch() {
  if (!requiredOwner.value.trim()) {
    requiredError.value = '负责人是必填项，未发送请求。'
    announce('必填校验未通过')
    return
  }
  requiredError.value = ''
  applyQuery({ owner: requiredOwner.value }, '必填校验通过并提交')
}

function updateLinkedCategory() {
  if (!linkedOwners.value.includes(linkedOwner.value)) linkedOwner.value = ''
  applyQuery(
    { category: linkedCategory.value, owner: linkedOwner.value },
    '上游分类变化，负责人选项已联动',
  )
}

function updateLinkedOwner() {
  applyQuery({ category: linkedCategory.value, owner: linkedOwner.value }, '联动负责人条件已提交')
}

function setFormRefValues() {
  draftProject.value = '看板'
  draftStatus.value = 'running'
  announce('formRef 等价操作：setFieldsValue')
}

function readFormRefValues() {
  announce(
    `formRef 等价操作：getFieldsValue ${JSON.stringify({
      project: draftProject.value,
      status: draftStatus.value,
    })}`,
  )
}

function submitFormRef() {
  applyLiveQuery()
  announce('formRef 等价操作：submit')
}

function resetFormRef() {
  draftProject.value = ''
  draftStatus.value = undefined
  applyQuery({}, 'formRef 等价操作：resetFields')
}

function addLocalRow() {
  const id = Math.max(...localRows.value.map((row) => row.id)) + 1
  localRows.value = [
    ...localRows.value,
    { ...demoRows[0]!, id, project: `本地新增项目 ${id}`, updatedAt: '2026-08-24 16:00:00' },
  ]
  announce(`受控 dataSource 新增记录 ${id}`)
}

function resetLocalRows() {
  localRows.value = demoRows.slice(0, 7).map((row) => ({ ...row }))
  announce('受控 dataSource 已重置')
}

const splitCategory = ref<'all' | DemoQuery['category']>('all')

function chooseSplitCategory(category: typeof splitCategory.value) {
  splitCategory.value = category
  applyQuery(category === 'all' ? {} : { category }, `左侧分类切换为 ${category}`)
}

const expandedParent = ref<string | null>('数据产品')
const departments = computed(() => {
  const names = [...new Set(demoRows.map((row) => row.department))].slice(0, 4)
  return names.map((name) => ({ name, rows: demoRows.filter((row) => row.department === name) }))
})
const nestedColumns: ProColumns<DemoRow>[] = [
  { title: '项目', dataIndex: 'project', valueType: 'text' },
  { title: '负责人', dataIndex: 'owner', valueType: 'text', width: 110 },
  { title: '进度', dataIndex: 'progress', valueType: 'percent', width: 110 },
]

const minVisits = ref(0)
const contentPriority = ref<DemoQuery['priority']>()
const customBodyEmpty = ref(false)

function applyContentQuery() {
  applyQuery(
    { minVisits: minVisits.value || undefined, priority: contentPriority.value },
    '内容型查询项已转换为请求参数',
  )
}

function resetContentQuery() {
  minVisits.value = 0
  contentPriority.value = undefined
  applyQuery({}, '内容型查询项已重置')
}

function setCustomBodyState(empty: boolean) {
  customBodyEmpty.value = empty
  applyQuery(
    empty ? { keyWords: '__custom_body_empty__' } : {},
    empty ? '切换到自定义空态' : '恢复自定义数据态',
  )
}

async function triggerRenderError() {
  errorTriggered.value = false
  errorResetKey.value += 1
  await nextTick()
  errorTriggered.value = true
  announce('已触发受控渲染异常')
}

function resetRenderError() {
  errorTriggered.value = false
  errorResetKey.value += 1
  announce('错误演示已重置')
}

function handleCaughtError(message: string) {
  announce(`错误边界捕获：${message}`)
}

function startCustomEdit() {
  tableRef.value?.startEditable(customRows.value[0]!.id)
  announce('进入自定义 valueType 编辑态')
}

interface EditableMember extends Record<string, unknown> {
  id: number
  name: string
  role: '前端' | '设计' | '测试'
  allocation: number
}

interface EditablePlan extends Record<string, unknown> {
  planName?: string
  members?: EditableMember[]
}

const editableRef = ref<EditableProTableInstance<EditableMember> | null>(null)
const editableFormRef = ref<SchemaFormInstance<EditablePlan> | null>(null)
const editableFormModel = ref<Partial<EditablePlan>>({
  planName: '秋季增长实验',
  members: [
    { id: 501, name: '林默', role: '前端', allocation: 80 },
    { id: 502, name: '周芮', role: '设计', allocation: 60 },
  ],
})
const editableKeys = ref<ProKey[]>([501])
const editableMessage = ref('第一行已进入编辑态，可先清空姓名验证列规则。')
let editableSequence = 503

function asEditableMembers(value: unknown): EditableMember[] {
  return Array.isArray(value) ? (value as EditableMember[]) : []
}

function hasValidAllocation(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 100
}

function hasValidMemberName(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

async function validateEditableMembers(_rule: unknown, value: unknown): Promise<void> {
  const members = asEditableMembers(value)
  if (members.length === 0) throw new Error('至少添加一位项目成员')
  if (members.some((member) => !hasValidMemberName(member?.name))) {
    throw new Error('请补全所有成员姓名')
  }
  if (members.some((member) => !hasValidAllocation(member?.allocation))) {
    throw new Error('成员投入比例必须是 1 到 100 之间的有限数字')
  }
}

const editableFormColumns: SchemaFormColumn<EditablePlan>[] = [
  {
    title: '计划名称',
    dataIndex: 'planName',
    valueType: 'text',
    formItemProps: { rules: [{ required: true, message: '请输入计划名称' }] },
  },
  {
    title: '项目成员',
    dataIndex: 'members',
    valueType: 'text',
    formItemProps: {
      rules: [{ validator: validateEditableMembers }],
    },
  },
]

const editableColumns: ProColumns<EditableMember>[] = [
  {
    title: '成员姓名',
    dataIndex: 'name',
    valueType: 'text',
    formItemProps: {
      rules: [
        { required: true, message: '成员姓名不能为空' },
        {
          validator: (_rule: unknown, value: unknown) => hasValidMemberName(value),
          message: '成员姓名不能只包含空格',
        },
      ],
    },
  },
  {
    title: '角色',
    dataIndex: 'role',
    valueType: 'select',
    valueEnum: { 前端: '前端', 设计: '设计', 测试: '测试' },
    formItemProps: { rules: [{ required: true, message: '请选择角色' }] },
  },
  {
    title: '投入比例',
    dataIndex: 'allocation',
    valueType: 'percent',
    renderFormItem: (_column, { record, update }) =>
      h(
        SpaceCompact,
        {},
        {
          default: () => [
            h(InputNumber, {
              value: record.allocation,
              'onUpdate:value': update,
            }),
            h(SpaceAddon, {}, { default: () => '%' }),
          ],
        },
      ),
    formItemProps: {
      rules: [
        { required: true, message: '请输入投入比例' },
        {
          validator: (_rule: unknown, value: unknown) => hasValidAllocation(value),
          message: '投入比例必须是 1 到 100 之间的有限数字',
        },
      ],
    },
  },
  { title: '操作', valueType: 'option', width: 160, search: false },
]

const editableConfig: EditableConfig<EditableMember> = {
  type: 'multiple',
  onSave(_key, row) {
    editableMessage.value = `已保存成员 ${row.name}`
    announce(editableMessage.value)
  },
  onDelete(_key, row) {
    announce(`删除成员 ${row.name}`)
    return true
  },
}

const recordCreatorProps: RecordCreatorProps<EditableMember> = {
  record: () => ({ id: editableSequence++, name: '', role: '前端', allocation: 50 }),
  creatorButtonText: '添加成员并校验',
  position: 'bottom',
  newRecordType: 'dataSource',
}

async function submitEditableForm() {
  const table = editableRef.value
  const form = editableFormRef.value
  if (!table || !form) {
    editableMessage.value = '编辑表格尚未就绪，请稍后重试。'
    return
  }

  for (const key of [...editableKeys.value]) {
    const saved = await table.saveEditable(key)
    if (!saved) {
      editableMessage.value = '存在未通过列校验的成员，外层表单未提交。'
      announce('外层表单被列校验阻止')
      return
    }
  }

  try {
    await nextTick()
    const values = await form.submit()
    const planName = values?.planName?.trim() ?? ''
    const memberCount = table.getRowsData().length
    editableMessage.value = `计划「${planName}」提交成功，共 ${memberCount} 位成员。`
    announce(editableMessage.value)
  } catch {
    editableMessage.value = '外层 SchemaForm 校验未通过，请补全计划信息。'
    announce('外层 SchemaForm 校验阻止提交')
  }
}
</script>

<template>
  <ConfigProvider :locale="providerLocale" :direction="providerDirection" :theme="providerTheme">
    <div
      :class="[
        'scenario-demo',
        `mode-${mode}`,
        {
          'is-card-shell': isMode('card-bordered', 'card-table'),
          'is-dark-shell': isMode('dark-compact-theme') && darkTheme,
          'is-custom-body': isMode('custom-table-body'),
        },
      ]"
      :dir="providerDirection"
      :data-scenario-mode="mode"
    >
      <div v-if="!usesLocalData && !isMode('editable-pro-form-validation')" class="request-monitor">
        <span
          ><b>{{ requestCount }}</b> {{ requestLabels.requests }}</span
        >
        <span
          ><b>{{ loadedTotal }}</b> {{ requestLabels.matches }}</span
        >
        <code :title="lastRequest || requestLabels.waiting">{{
          lastRequest || requestLabels.waiting
        }}</code>
      </div>

      <div v-if="requestFailure" class="inline-error" role="alert">{{ requestFailure }}</div>

      <div v-if="isMode('card-bordered')" class="demo-control-row">
        <span>Card bordered：开启</span>
        <label class="switch-label">
          <input v-model="borderEnabled" type="checkbox" />
          Table bordered：{{ borderEnabled ? '开启' : '关闭' }}
        </label>
      </div>

      <div v-else-if="isMode('data-source')" class="demo-control-row">
        <span>受控数组当前 {{ localRows.length }} 行，不会调用 request。</span>
        <span class="button-row">
          <button type="button" @click="resetLocalRows">重置数组</button>
          <button type="button" class="primary" @click="addLocalRow">新增一行</button>
        </span>
      </div>

      <div v-else-if="isMode('search-bar-type-switch')" class="stacked-controls">
        <div class="segmented-control" aria-label="切换搜索栏类型">
          <button
            type="button"
            :class="{ active: searchMode === 'query' }"
            @click="switchSearchMode('query')"
          >
            QueryFilter
          </button>
          <button
            type="button"
            :class="{ active: searchMode === 'light' }"
            @click="switchSearchMode('light')"
          >
            LightFilter（Vue 映射）
          </button>
        </div>
        <div v-if="searchMode === 'light'" class="light-filter-bar">
          <input v-model="draftProject" placeholder="项目关键词" @change="applyLiveQuery" />
          <select v-model="draftStatus" @change="applyLiveQuery">
            <option :value="undefined">全部状态</option>
            <option value="running">进行中</option>
            <option value="paused">已暂停</option>
            <option value="done">已完成</option>
          </select>
          <button type="button" @click="resetFormRef">清空</button>
        </div>
      </div>

      <div v-else-if="isMode('search-without-options')" class="field-only-search">
        <label>
          项目（输入即查询）
          <input v-model="draftProject" placeholder="没有查询按钮" @input="applyLiveQuery" />
        </label>
        <label>
          状态
          <select v-model="draftStatus" @change="applyLiveQuery">
            <option :value="undefined">全部</option>
            <option value="running">进行中</option>
            <option value="done">已完成</option>
          </select>
        </label>
      </div>

      <div v-else-if="isMode('light-filter')" class="light-filter-bar">
        <span>分类</span>
        <button type="button" @click="applyLightFilter(undefined, externalQuery.status)">
          全部
        </button>
        <button type="button" @click="applyLightFilter('growth', externalQuery.status)">
          增长
        </button>
        <button type="button" @click="applyLightFilter('experience', externalQuery.status)">
          体验
        </button>
        <button type="button" @click="applyLightFilter('efficiency', externalQuery.status)">
          效能
        </button>
        <span class="filter-separator"></span>
        <button type="button" @click="applyLightFilter(externalQuery.category, 'running')">
          进行中
        </button>
        <button type="button" @click="applyQuery({}, '轻量筛选已清空')">清空</button>
      </div>

      <form
        v-else-if="isMode('keywords-search')"
        class="keyword-search"
        @submit.prevent="submitKeyword"
      >
        <input v-model="keyword" type="search" placeholder="搜索项目、负责人、部门、标签" />
        <button type="button" @click="clearKeyword">清空</button>
        <button type="submit" class="primary">keyWords 搜索</button>
      </form>

      <div v-else-if="isMode('custom-search-options')" class="demo-control-row">
        <span>默认操作区已改为“立即检索 / 清空条件”。</span>
        <button type="button" @click="announce(`导出参数 ${lastRequest}`)">导出当前条件</button>
      </div>

      <form
        v-else-if="isMode('required-search-form')"
        class="required-search"
        @submit.prevent="submitRequiredSearch"
      >
        <label>
          负责人 <b>*</b>
          <input v-model="requiredOwner" placeholder="例如：林默" />
        </label>
        <button type="submit" class="primary">校验并查询</button>
        <span v-if="requiredError" role="alert">{{ requiredError }}</span>
      </form>

      <div v-else-if="isMode('linked-search-form')" class="field-only-search">
        <label>
          业务分类
          <select v-model="linkedCategory" @change="updateLinkedCategory">
            <option :value="undefined">全部分类</option>
            <option value="growth">增长</option>
            <option value="experience">体验</option>
            <option value="efficiency">效能</option>
          </select>
        </label>
        <label>
          联动负责人
          <select v-model="linkedOwner" @change="updateLinkedOwner">
            <option value="">全部负责人</option>
            <option v-for="owner in linkedOwners" :key="owner" :value="owner">{{ owner }}</option>
          </select>
        </label>
      </div>

      <div v-else-if="isMode('search-form-ref')" class="stacked-controls">
        <div class="field-only-search">
          <label>项目 <input v-model="draftProject" /></label>
          <label>
            状态
            <select v-model="draftStatus">
              <option :value="undefined">全部</option>
              <option value="running">进行中</option>
              <option value="paused">已暂停</option>
              <option value="done">已完成</option>
            </select>
          </label>
        </div>
        <div class="button-row">
          <button type="button" @click="setFormRefValues">setFieldsValue</button>
          <button type="button" @click="readFormRefValues">getFieldsValue</button>
          <button type="button" class="primary" @click="submitFormRef">submit</button>
          <button type="button" @click="resetFormRef">resetFields</button>
        </div>
      </div>

      <div v-else-if="isMode('batch-actions')" class="batch-bar">
        <strong>{{ batchMessage }}</strong>
        <span class="button-row">
          <button type="button" :disabled="!selectedKeys.length" @click="runBatchAction">
            批量标记已审阅
          </button>
          <button type="button" :disabled="!selectedKeys.length" @click="clearBatchSelection">
            清空选择
          </button>
        </span>
      </div>

      <div v-else-if="isMode('polling')" class="demo-control-row">
        <span>当前 {{ pollEnabled ? '每 1.2 秒轮询；页面隐藏时暂停' : '轮询已停止' }}</span>
        <button
          type="button"
          :class="{ primary: !pollEnabled }"
          @click="pollEnabled = !pollEnabled"
        >
          {{ pollEnabled ? '停止轮询' : '开始轮询' }}
        </button>
      </div>

      <div v-else-if="isMode('date-formatter')" class="demo-control-row">
        <span>postData 保留原记录并生成格式化字段。</span>
        <label>
          dateFormatter
          <select v-model="dateFormat">
            <option value="date">date</option>
            <option value="dateTime">dateTime</option>
            <option value="timestamp">number / timestamp</option>
          </select>
        </label>
      </div>

      <div v-else-if="isMode('internationalization')" class="demo-control-row">
        <span>{{
          localeMode === 'en' ? 'Locale: English (en-US)' : '语言：简体中文 (zh-CN)'
        }}</span>
        <div class="segmented-control">
          <button type="button" :class="{ active: localeMode === 'zh' }" @click="localeMode = 'zh'">
            中文
          </button>
          <button type="button" :class="{ active: localeMode === 'en' }" @click="localeMode = 'en'">
            English
          </button>
        </div>
      </div>

      <div v-else-if="isMode('rtl-arabic')" class="demo-control-row rtl-note">
        <span>اتجاه الصفحة من اليمين إلى اليسار</span>
        <b>ConfigProvider · RTL · العربية</b>
      </div>

      <div v-else-if="isMode('dark-compact-theme')" class="theme-control">
        <label><input v-model="darkTheme" type="checkbox" /> darkAlgorithm</label>
        <label><input v-model="compactTheme" type="checkbox" /> compactAlgorithm</label>
        <span>主题切换不会重建表格，因此请求、分页和筛选状态会保留。</span>
      </div>

      <div
        v-else-if="isMode('custom-error-boundary', 'disabled-error-boundary')"
        class="demo-control-row"
      >
        <span>
          {{
            isMode('custom-error-boundary')
              ? '触发后由业务自定义 fallback 接管。'
              : '触发后仅显示 Playground 的默认安全隔离结果。'
          }}
        </span>
        <span class="button-row">
          <button type="button" @click="resetRenderError">恢复表格</button>
          <button type="button" class="danger" @click="triggerRenderError">触发渲染异常</button>
        </span>
      </div>

      <div v-else-if="isMode('columns-state')" class="demo-control-row">
        <span>
          项目列默认左固定、最近更新列右固定，进度列提前且负责人默认隐藏；变更会写入 localStorage。
        </span>
        <span class="button-row">
          <button type="button" @click="resetColumnsStateDemo">恢复默认列状态</button>
          <button type="button" @click="announce('横向滚动并刷新页面可核对固定列与持久化')">
            验证说明
          </button>
        </span>
      </div>

      <div v-else-if="isMode('custom-column-setting-icon')" class="custom-column-control">
        <button
          type="button"
          class="column-setting-trigger"
          aria-label="自定义列设置"
          @click="customColumnsOpen = !customColumnsOpen"
        >
          ◫ 自定义列设置
        </button>
        <div v-if="customColumnsOpen" class="custom-column-panel">
          <label v-for="column in commonColumns" :key="String(column.dataIndex)">
            <input
              type="checkbox"
              :checked="columnState[String(column.dataIndex)]?.show !== false"
              @change="handleColumnVisibilityChange(column.dataIndex, $event)"
            />
            {{ typeof column.title === 'string' ? column.title : String(column.dataIndex) }}
          </label>
        </div>
      </div>

      <div v-else-if="isMode('content-query-item')" class="content-query-card">
        <label>
          最低访问量：<b>{{ minVisits }}</b>
          <input v-model.number="minVisits" type="range" min="0" max="5000" step="500" />
        </label>
        <div class="priority-picker" role="group" aria-label="优先级内容查询项">
          <button
            v-for="item in [
              { value: undefined, label: '全部优先级', icon: '◎' },
              { value: 'high', label: '高优先级', icon: '▲' },
              { value: 'medium', label: '中优先级', icon: '◆' },
              { value: 'low', label: '低优先级', icon: '●' },
            ]"
            :key="item.label"
            type="button"
            :class="{ active: contentPriority === item.value }"
            @click="contentPriority = item.value as DemoQuery['priority']"
          >
            <i>{{ item.icon }}</i
            >{{ item.label }}
          </button>
        </div>
        <span class="button-row content-query-actions">
          <button type="button" @click="resetContentQuery">清空并重置</button>
          <button type="button" class="primary" @click="applyContentQuery">应用内容查询项</button>
        </span>
      </div>

      <div v-if="isMode('custom-value-type')" class="demo-control-row">
        <span>render + renderText + renderFormItem 共同映射自定义 valueType。</span>
        <button type="button" class="primary" @click="startCustomEdit">编辑第一行健康度</button>
      </div>

      <div v-if="isMode('card-table')" class="card-table-heading">
        <div>
          <small>PORTFOLIO HEALTH</small>
          <h5>项目经营卡片</h5>
          <p>标题、指标和操作由 Vue 卡片组合，数据主体仍由 ProTable 管理。</p>
        </div>
        <button type="button" @click="tableRef?.reload()">刷新卡片数据</button>
      </div>

      <div v-if="isMode('custom-table-body')" class="body-shell-heading">
        <span>自定义表格主体容器</span>
        <span class="button-row">
          <b>{{ loadedTotal }} records</b>
          <button
            type="button"
            :class="{ active: !customBodyEmpty }"
            @click="setCustomBodyState(false)"
          >
            数据态
          </button>
          <button
            type="button"
            :class="{ active: customBodyEmpty }"
            @click="setCustomBodyState(true)"
          >
            自定义空态
          </button>
        </span>
      </div>

      <div v-if="isMode('split-layout')" class="split-demo">
        <aside aria-label="业务分类">
          <strong>业务分类</strong>
          <button
            v-for="item in [
              { value: 'all', label: '全部项目' },
              { value: 'growth', label: '增长' },
              { value: 'experience', label: '体验' },
              { value: 'efficiency', label: '效能' },
            ]"
            :key="item.value"
            type="button"
            :class="{ active: splitCategory === item.value }"
            @click="chooseSplitCategory(item.value as typeof splitCategory)"
          >
            {{ item.label }}
          </button>
        </aside>
        <div class="split-table">
          <ProTable
            ref="tableRef"
            v-bind="tableBindings"
            @load="handleLoad"
            @request-error="handleRequestError"
          />
        </div>
      </div>

      <div v-else-if="isMode('nested-table')" class="nested-demo">
        <article v-for="department in departments" :key="department.name">
          <button
            type="button"
            class="nested-parent"
            :aria-expanded="expandedParent === department.name"
            @click="expandedParent = expandedParent === department.name ? null : department.name"
          >
            <span>{{ expandedParent === department.name ? '−' : '+' }}</span>
            <strong>{{ department.name }}</strong>
            <small>{{ department.rows.length }} 个项目</small>
          </button>
          <div v-if="expandedParent === department.name" class="nested-child">
            <ProTable
              :columns="nestedColumns"
              :data-source="department.rows"
              row-key="id"
              :search="false"
              :pagination="false"
              :options="false"
              :toolbar="false"
              size="small"
            />
          </div>
        </article>
      </div>

      <div v-else-if="isMode('custom-table-body')" class="custom-table-body">
        <ProTable
          ref="tableRef"
          v-bind="tableBindings"
          @load="handleLoad"
          @request-error="handleRequestError"
        >
          <template #emptyText>
            <div class="custom-empty-state">
              <strong>没有符合当前条件的项目</strong>
              <span>这是通过 ProTable 转发的 Antdv Table emptyText 插槽渲染的自定义主体空态。</span>
              <button type="button" @click="setCustomBodyState(false)">恢复演示数据</button>
            </div>
          </template>
        </ProTable>
      </div>

      <div v-else-if="isMode('editable-pro-form-validation')" class="editable-form-demo">
        <SchemaForm
          ref="editableFormRef"
          v-model="editableFormModel"
          :columns="editableFormColumns"
          :submitter="false"
        >
          <template #field-members="{ value, update }">
            <EditableProTable
              ref="editableRef"
              :value="asEditableMembers(value)"
              v-model:editable-keys="editableKeys"
              :columns="editableColumns"
              row-key="id"
              :editable="editableConfig"
              :record-creator-props="recordCreatorProps"
              :max-length="6"
              @update:value="update"
            />
          </template>
        </SchemaForm>
        <div class="outer-form-submit">
          <span>{{ editableMessage }}</span>
          <button type="button" class="primary" @click="submitEditableForm">提交外层表单</button>
        </div>
      </div>

      <ScenarioErrorBoundary
        v-else-if="isMode('custom-error-boundary', 'disabled-error-boundary')"
        :reset-key="errorResetKey"
        variant="default"
        @caught="handleCaughtError"
      >
        <ScenarioErrorBoundary
          v-if="isMode('custom-error-boundary')"
          :reset-key="errorResetKey"
          variant="custom"
          @caught="handleCaughtError"
        >
          <ProTable
            ref="tableRef"
            v-bind="tableBindings"
            @load="handleLoad"
            @request-error="handleRequestError"
            @selection-change="handleSelection"
          />
        </ScenarioErrorBoundary>
        <ProTable
          v-else
          ref="tableRef"
          v-bind="tableBindings"
          @load="handleLoad"
          @request-error="handleRequestError"
          @selection-change="handleSelection"
        />
      </ScenarioErrorBoundary>

      <ProTable
        v-else
        :key="tableRenderKey"
        ref="tableRef"
        v-bind="tableBindings"
        @load="handleLoad"
        @request-error="handleRequestError"
        @selection-change="handleSelection"
        @change="announce('分页、排序或筛选发生变化')"
      />
    </div>
  </ConfigProvider>
</template>

<style scoped>
.scenario-demo {
  --demo-line: #d6e2ee;
  --demo-muted: #60738a;
  --demo-ink: #172b45;
  display: grid;
  gap: 16px;
  min-width: 0;
  color: var(--demo-ink);
}

.request-monitor {
  display: grid;
  grid-template-columns: auto auto minmax(120px, 1fr);
  gap: 8px;
  align-items: center;
  padding: 9px 11px;
  border: 1px solid #d7e3ef;
  border-radius: 7px;
  background: #f7faff;
  color: var(--demo-muted);
  font-size: 10px;
}

.request-monitor span {
  white-space: nowrap;
}

.request-monitor b {
  color: #1768d3;
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 14px;
}

.request-monitor code {
  overflow: hidden;
  color: #64758a;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-error,
.required-search > span {
  padding: 8px 10px;
  border-radius: 6px;
  background: #fff1f0;
  color: #b4232d;
  font-size: 12px;
}

.demo-control-row,
.batch-bar,
.theme-control,
.outer-form-submit,
.body-shell-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid var(--demo-line);
  border-radius: 8px;
  background: #f6f9fd;
  color: var(--demo-muted);
  font-size: 12px;
}

.stacked-controls {
  display: grid;
  gap: 10px;
}

.button-row,
.segmented-control,
.light-filter-bar,
.field-only-search,
.keyword-search,
.required-search,
.priority-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

button,
input,
select {
  font: inherit;
}

button {
  padding: 7px 10px;
  border: 1px solid #bacbdd;
  border-radius: 6px;
  background: white;
  color: #29445f;
  cursor: pointer;
}

button:hover,
button.active,
button.primary {
  border-color: #1768d3;
  background: #1768d3;
  color: white;
}

button.danger {
  border-color: #d83f48;
  background: #d83f48;
  color: white;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

input:not([type='checkbox']):not([type='range']),
select {
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid #becfe0;
  border-radius: 6px;
  background: white;
  color: var(--demo-ink);
}

.field-only-search,
.keyword-search,
.required-search,
.light-filter-bar {
  padding: 12px;
  border: 1px solid var(--demo-line);
  border-radius: 8px;
  background: #f7faff;
}

.field-only-search label,
.required-search label {
  display: grid;
  grid-template-columns: auto minmax(130px, 1fr);
  gap: 8px;
  align-items: center;
  color: var(--demo-muted);
  font-size: 11px;
}

.required-search label b {
  color: #d13a44;
}

.keyword-search input {
  flex: 1 1 280px;
}

.filter-separator {
  width: 1px;
  height: 24px;
  background: var(--demo-line);
}

.switch-label,
.theme-control label {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

.batch-bar strong {
  color: #1768d3;
}

.is-card-shell {
  padding: 18px;
  border: 1px solid #c8d8e8;
  border-radius: 10px;
  background: white;
  box-shadow: 0 16px 35px rgba(43, 75, 110, 0.1);
}

.card-table-heading {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--demo-line);
}

.card-table-heading small {
  color: #008c95;
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.card-table-heading h5 {
  margin: 4px 0;
  font-size: 22px;
}

.card-table-heading p {
  margin: 0;
  color: var(--demo-muted);
  font-size: 12px;
}

.is-custom-body {
  padding: 14px;
  border: 1px dashed #8fb1d5;
  border-radius: 18px 4px 18px 4px;
  background: linear-gradient(135deg, #f5f9fd, white);
}

.body-shell-heading {
  border: 0;
  border-radius: 7px 7px 0 0;
  background: #132a46;
  color: #d9e8f6;
  font-family: 'Cascadia Code', Consolas, monospace;
}

.body-shell-heading button {
  padding-block: 5px;
}

.custom-table-body {
  overflow: hidden;
  border-radius: 0 0 10px 10px;
  background: white;
}

.custom-empty-state {
  display: grid;
  justify-items: center;
  gap: 8px;
  min-height: 180px;
  align-content: center;
  padding: 24px;
  color: var(--demo-muted);
  text-align: center;
}

.custom-empty-state strong {
  color: var(--demo-ink);
  font-size: 16px;
}

.split-demo {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 16px;
}

.split-demo aside {
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--demo-line);
  border-radius: 8px;
  background: #f7faff;
}

.split-demo aside strong {
  padding: 5px 7px 9px;
  color: var(--demo-muted);
  font-size: 11px;
}

.split-demo aside button {
  text-align: left;
}

.split-table {
  min-width: 0;
}

.nested-demo {
  overflow: hidden;
  border: 1px solid var(--demo-line);
  border-radius: 8px;
}

.nested-demo article + article {
  border-top: 1px solid var(--demo-line);
}

.nested-parent {
  width: 100%;
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 13px 15px;
  border: 0;
  border-radius: 0;
  text-align: left;
}

.nested-parent small {
  color: var(--demo-muted);
}

.nested-child {
  padding: 14px 20px 18px 48px;
  background: #f7faff;
}

.custom-column-control {
  position: relative;
  display: flex;
  justify-content: flex-end;
}

.column-setting-trigger {
  border-color: #1768d3;
  color: #1768d3;
  font-weight: 700;
}

.custom-column-panel {
  position: absolute;
  z-index: 3;
  top: calc(100% + 6px);
  right: 0;
  display: grid;
  gap: 8px;
  min-width: 180px;
  padding: 12px;
  border: 1px solid var(--demo-line);
  border-radius: 8px;
  background: white;
  box-shadow: 0 15px 35px rgba(30, 55, 85, 0.16);
}

.custom-column-panel label {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.content-query-card {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(260px, 1.4fr) auto;
  gap: 14px;
  align-items: end;
  padding: 14px;
  border: 1px solid var(--demo-line);
  border-radius: 10px;
  background: #f7faff;
}

.content-query-card > label {
  display: grid;
  gap: 7px;
  color: var(--demo-muted);
  font-size: 11px;
}

.content-query-actions {
  justify-content: flex-end;
}

.priority-picker button {
  display: grid;
  min-width: 85px;
  gap: 2px;
  text-align: center;
}

.priority-picker i {
  color: #008c95;
  font-style: normal;
}

.editable-form-demo {
  display: grid;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--demo-line);
  border-radius: 10px;
  background: #fbfdff;
}

.outer-form-submit span {
  color: var(--demo-muted);
}

.rtl-note {
  direction: rtl;
}

.theme-control {
  background: rgba(255, 255, 255, 0.08);
}

.is-dark-shell {
  --demo-line: #3d5066;
  --demo-muted: #a8bbd0;
  --demo-ink: #eef6ff;
  padding: 16px;
  border-radius: 10px;
  background: #101a28;
}

.is-dark-shell .request-monitor {
  border-color: #3d5066;
  background: #172538;
}

.is-dark-shell .request-monitor b {
  color: #6eb6ff;
}

.is-dark-shell .request-monitor code {
  color: #c7d5e5;
}

:deep(.toolbar-action-row),
:deep(.toolbar-tabs) {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

:deep(.toolbar-demo-button) {
  padding: 5px 8px;
  border: 1px solid #b9c9db;
  border-radius: 5px;
  background: white;
  color: #28445f;
  cursor: pointer;
  font-size: 11px;
}

:deep(.toolbar-demo-button.active) {
  border-color: #1768d3;
  background: #1768d3;
  color: white;
}

:deep(.rich-toolbar-title),
:deep(.two-line-title) {
  display: grid;
  gap: 3px;
}

:deep(.rich-toolbar-title small),
:deep(.two-line-title small),
:deep(.toolbar-breadcrumb) {
  color: #718399;
  font-size: 10px;
  font-weight: 400;
}

:deep(.title-menu) {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

:deep(.title-menu select) {
  min-height: 28px;
  border: 1px solid #c5d4e3;
  border-radius: 5px;
  background: white;
  font-size: 11px;
}

:deep(.tag-cluster) {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.demo-tag) {
  padding: 2px 6px;
  border-radius: 999px;
  background: #e7f3ff;
  color: #1768d3;
  font-size: 10px;
  font-style: normal;
}

:deep(.health-meter) {
  width: 150px;
  display: inline-grid;
  grid-template-columns: minmax(0, 1fr) 30px;
  gap: 8px;
  align-items: center;
}

:deep(.health-meter::before) {
  content: '';
  grid-area: 1 / 1;
  height: 7px;
  border-radius: 999px;
  background: #e2eaf2;
}

:deep(.health-meter i) {
  z-index: 1;
  grid-area: 1 / 1;
  height: 7px;
  max-width: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #00a7b5, #1768d3);
}

:deep(.health-meter b) {
  font-size: 11px;
}

@media (width <= 760px) {
  .request-monitor {
    grid-template-columns: auto auto;
  }

  .request-monitor code {
    grid-column: 1 / -1;
  }

  .split-demo,
  .content-query-card {
    grid-template-columns: 1fr;
  }

  .split-demo aside {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .split-demo aside strong {
    grid-column: 1 / -1;
  }

  .nested-child {
    padding-left: 14px;
  }
}
</style>
