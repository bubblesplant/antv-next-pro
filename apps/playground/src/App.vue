<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  EditableProTable,
  ProTable,
  SchemaForm,
  type EditableConfig,
  type EditableProTableInstance,
  type ProColumns,
  type ProKey,
  type ProRequest,
  type ProTableInstance,
  type RecordCreatorProps,
  type SchemaFormColumn,
  type SchemaFormInstance,
  type SchemaFormLayoutType,
} from 'antdv-next-pro'

type DemoName = 'table' | 'editable' | 'form'

type WorkItem = Record<string, unknown> & {
  id: number
  name: string
  owner: string
  status: 'running' | 'paused' | 'done'
  score: number
  updatedAt: string
}

type TableQuery = Record<string, unknown> & {
  name?: string
  status?: WorkItem['status']
}

type TeamMember = Record<string, unknown> & {
  id: number
  name: string
  role: '前端' | '设计' | '测试'
  allocation: number
  active: boolean
}

type LaunchBrief = Record<string, unknown> & {
  project?: string
  owner?: string
  channel?: 'web' | 'mobile' | 'both'
  budget?: number
  enabled?: boolean
  launchWindow?: [string, string]
}

const demos: Array<{ key: DemoName; label: string; description: string }> = [
  { key: 'table', label: 'ProTable', description: '请求、检索与列状态' },
  { key: 'editable', label: 'EditableProTable', description: '整表编辑与新增记录' },
  { key: 'form', label: 'SchemaForm', description: '字段 Schema 与多种布局' },
]

const activeDemo = ref<DemoName>('table')
const activeMeta = computed(() => demos.find((demo) => demo.key === activeDemo.value)!)
const events = ref<string[]>(['Playground 已就绪'])

const logEvent = (message: string) => {
  const time = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())

  events.value = [`${time} · ${message}`, ...events.value].slice(0, 7)
}

const sourceRows: WorkItem[] = [
  {
    id: 1,
    name: '客户洞察面板',
    owner: '林默',
    status: 'running',
    score: 92,
    updatedAt: '2026-08-23',
  },
  {
    id: 2,
    name: '渠道归因升级',
    owner: '程一',
    status: 'paused',
    score: 76,
    updatedAt: '2026-08-22',
  },
  {
    id: 3,
    name: '会员分层策略',
    owner: '周芮',
    status: 'done',
    score: 88,
    updatedAt: '2026-08-21',
  },
  {
    id: 4,
    name: '移动端转化实验',
    owner: '唐可',
    status: 'running',
    score: 84,
    updatedAt: '2026-08-20',
  },
  {
    id: 5,
    name: '留存预警模型',
    owner: '孟晴',
    status: 'running',
    score: 95,
    updatedAt: '2026-08-18',
  },
  {
    id: 6,
    name: '服务工单分析',
    owner: '庄言',
    status: 'paused',
    score: 71,
    updatedAt: '2026-08-17',
  },
  {
    id: 7,
    name: '新品首发追踪',
    owner: '沈知',
    status: 'done',
    score: 90,
    updatedAt: '2026-08-16',
  },
  {
    id: 8,
    name: '区域经营看板',
    owner: '方屿',
    status: 'running',
    score: 87,
    updatedAt: '2026-08-15',
  },
]

const tableColumns: ProColumns<WorkItem>[] = [
  { title: '项目', dataIndex: 'name', valueType: 'text', width: 220 },
  { title: '负责人', dataIndex: 'owner', valueType: 'text', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    valueType: 'select',
    width: 120,
    valueEnum: {
      running: { text: '进行中', status: 'processing' },
      paused: { text: '已暂停', status: 'warning' },
      done: { text: '已完成', status: 'success' },
    },
    filters: [
      { text: '进行中', value: 'running' },
      { text: '已暂停', value: 'paused' },
      { text: '已完成', value: 'done' },
    ],
  },
  { title: '健康度', dataIndex: 'score', valueType: 'percent', sorter: true, search: false },
  { title: '最近更新', dataIndex: 'updatedAt', valueType: 'date', sorter: true, search: false },
]

const tableRef = ref<ProTableInstance<WorkItem> | null>(null)

const tableRequest: ProRequest<WorkItem, TableQuery> = async (params, sort, filter) => {
  await new Promise((resolve) => setTimeout(resolve, 320))

  const keyword = String(params.name ?? '')
    .trim()
    .toLowerCase()
  const requestedStatuses = filter.status ?? (params.status ? [params.status] : null)
  let data = sourceRows.filter((row) => {
    const matchesKeyword = !keyword || `${row.name}${row.owner}`.toLowerCase().includes(keyword)
    const matchesStatus = !requestedStatuses?.length || requestedStatuses.includes(row.status)
    return matchesKeyword && matchesStatus
  })

  const activeSort = Object.entries(sort).find(([, order]) => order)
  if (activeSort) {
    const [field, order] = activeSort
    data = [...data].sort((left, right) => {
      const compared = String(left[field] ?? '').localeCompare(
        String(right[field] ?? ''),
        'zh-CN',
        {
          numeric: true,
        },
      )
      return order === 'descend' ? -compared : compared
    })
  }

  const current = Number(params.current ?? 1)
  const pageSize = Number(params.pageSize ?? 5)
  const start = (current - 1) * pageSize
  logEvent(`ProTable 返回 ${data.length} 条匹配数据`)

  return {
    data: data.slice(start, start + pageSize),
    total: data.length,
    success: true,
  }
}

const refreshTable = async () => {
  await tableRef.value?.reload()
  logEvent('已手动刷新 ProTable')
}

const editableRows = ref<TeamMember[]>([
  { id: 101, name: '林默', role: '前端', allocation: 80, active: true },
  { id: 102, name: '周芮', role: '设计', allocation: 60, active: true },
  { id: 103, name: '孟晴', role: '测试', allocation: 40, active: false },
])
const editableKeys = ref<ProKey[]>([])
const editableRef = ref<EditableProTableInstance<TeamMember> | null>(null)
let memberSequence = 104

const editableColumns: ProColumns<TeamMember>[] = [
  { title: '成员', dataIndex: 'name', valueType: 'text', width: 180 },
  {
    title: '角色',
    dataIndex: 'role',
    valueType: 'select',
    width: 150,
    valueEnum: {
      前端: '前端',
      设计: '设计',
      测试: '测试',
    },
  },
  { title: '投入比例', dataIndex: 'allocation', valueType: 'percent', width: 160 },
  { title: '参与项目', dataIndex: 'active', valueType: 'switch', width: 120 },
  { title: '操作', valueType: 'option', width: 170, search: false },
]

const editableConfig: EditableConfig<TeamMember> = {
  type: 'multiple',
  async onSave(_key, record) {
    await new Promise((resolve) => setTimeout(resolve, 180))
    logEvent(`已保存成员「${record.name}」`)
  },
  onCancel(_key, record) {
    logEvent(`已取消「${record.name}」的修改`)
  },
  onDelete(_key, record) {
    logEvent(`已删除成员「${record.name}」`)
    return true
  },
}

const recordCreatorProps: RecordCreatorProps<TeamMember> = {
  record: () => ({
    id: memberSequence++,
    name: '新成员',
    role: '前端',
    allocation: 50,
    active: true,
  }),
  position: 'bottom',
  newRecordType: 'dataSource',
  creatorButtonText: '添加项目成员',
}

const editFirstMember = () => {
  const first = editableRows.value[0]
  if (first && editableRef.value?.startEditable(first.id)) {
    logEvent(`开始编辑「${first.name}」`)
  }
}

const schemaModel = ref<Partial<LaunchBrief>>({
  channel: 'both',
  budget: 30,
  enabled: true,
})
const schemaRef = ref<SchemaFormInstance<LaunchBrief> | null>(null)
const schemaLayout = ref<SchemaFormLayoutType>('Form')
const schemaOpen = ref(false)
const schemaCurrent = ref(0)
const schemaLayouts: SchemaFormLayoutType[] = [
  'Form',
  'QueryFilter',
  'LightFilter',
  'ModalForm',
  'DrawerForm',
]

const schemaColumns: SchemaFormColumn<LaunchBrief>[] = [
  {
    title: '项目名称',
    dataIndex: 'project',
    valueType: 'text',
    fieldProps: { placeholder: '例如：秋季增长实验' },
    formItemProps: { rules: [{ required: true, message: '请输入项目名称' }] },
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    valueType: 'text',
    formItemProps: { rules: [{ required: true, message: '请输入负责人' }] },
  },
  {
    title: '发布渠道',
    dataIndex: 'channel',
    valueType: 'radio',
    valueEnum: {
      web: 'Web',
      mobile: '移动端',
      both: '双端同步',
    },
  },
  { title: '预算（万元）', dataIndex: 'budget', valueType: 'digit' },
  { title: '启用监测', dataIndex: 'enabled', valueType: 'switch' },
  { title: '发布窗口', dataIndex: 'launchWindow', valueType: 'dateRange' },
]

const submitSchema = async () => {
  try {
    await schemaRef.value?.submit()
  } catch {
    logEvent('SchemaForm 校验未通过')
  }
}

const onSchemaFinish = (values: Partial<LaunchBrief>) => {
  logEvent(`SchemaForm 已提交「${String(values.project ?? '未命名项目')}」`)
}

const chooseSchemaLayout = (layout: SchemaFormLayoutType) => {
  schemaLayout.value = layout
  if (layout === 'ModalForm' || layout === 'DrawerForm') schemaOpen.value = true
  logEvent(`SchemaForm 切换为 ${layout}`)
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="返回页面顶部">
        <span class="brand-mark">A+</span>
        <span>
          <strong>Antdv Next Pro</strong>
          <small>Vue data workflow kit</small>
        </span>
      </a>
      <div class="topbar-meta">
        <span>Vue 3.5</span>
        <span>Antdv Next 1.5</span>
        <a href="https://github.com/bubblesplant/antv-next-pro" target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </div>
    </header>

    <main id="top">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow">SCHEMA → WORKFLOW → RESULT</p>
          <h1 id="hero-title">把数据工作流<br /><em>装进三个组件。</em></h1>
          <p class="hero-lead">
            面向 Vue 3 与 Antdv Next 的高阶表格和表单。用统一的 columns 描述查询、展示、编辑与提交。
          </p>
        </div>
        <div class="signal-board" aria-label="组件能力概览">
          <span class="scan-line" aria-hidden="true"></span>
          <button
            v-for="demo in demos"
            :key="demo.key"
            type="button"
            :class="['signal-row', { active: activeDemo === demo.key }]"
            @click="activeDemo = demo.key"
          >
            <span class="signal-dot"></span>
            <strong>{{ demo.label }}</strong>
            <small>{{ demo.description }}</small>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <section class="workbench" aria-labelledby="demo-title">
        <aside class="demo-rail">
          <div>
            <p class="rail-label">COMPONENTS</p>
            <button
              v-for="demo in demos"
              :key="demo.key"
              type="button"
              :class="['rail-button', { active: activeDemo === demo.key }]"
              @click="activeDemo = demo.key"
            >
              <span>{{ demo.label }}</span>
              <small>{{ demo.description }}</small>
            </button>
          </div>

          <div class="event-console" aria-live="polite">
            <p class="rail-label">EVENT STREAM</p>
            <ol>
              <li v-for="event in events" :key="event">{{ event }}</li>
            </ol>
          </div>
        </aside>

        <div class="demo-stage">
          <header class="stage-header">
            <div>
              <p class="eyebrow">LIVE PLAYGROUND</p>
              <h2 id="demo-title">{{ activeMeta.label }}</h2>
              <p>{{ activeMeta.description }}</p>
            </div>
            <span class="live-badge"><i></i> interactive</span>
          </header>

          <div v-if="activeDemo === 'table'" class="demo-content">
            <div class="demo-actions">
              <p>修改搜索条件、排序或筛选，观察 request 契约如何驱动表格。</p>
              <button type="button" class="action-button" @click="refreshTable">重新请求</button>
            </div>
            <ProTable
              ref="tableRef"
              :columns="tableColumns"
              :request="tableRequest"
              row-key="id"
              :search="{ labelWidth: 'auto', defaultCollapsed: false }"
              :pagination="{ defaultPageSize: 5, showSizeChanger: true }"
              :options="{ density: true, fullScreen: true, reload: true, setting: true }"
              :columns-state="{
                persistenceKey: 'antdv-next-pro-playground',
                persistenceType: 'localStorage',
              }"
              @request-error="logEvent('ProTable 请求失败')"
              @change="logEvent('ProTable 的分页、排序或筛选发生变化')"
            />
          </div>

          <div v-else-if="activeDemo === 'editable'" class="demo-content">
            <div class="demo-actions">
              <p>多行编辑共享同一状态机；新增记录会立即进入可编辑状态。</p>
              <button type="button" class="action-button" @click="editFirstMember">
                编辑第一行
              </button>
            </div>
            <EditableProTable
              ref="editableRef"
              v-model:value="editableRows"
              v-model:editable-keys="editableKeys"
              :columns="editableColumns"
              row-key="id"
              :editable="editableConfig"
              :record-creator-props="recordCreatorProps"
              :max-length="6"
              @values-change="logEvent(`编辑表当前有 ${editableRows.length} 行`)"
              @table-change="logEvent('EditableProTable 状态已变化')"
            />
          </div>

          <div v-else class="demo-content">
            <div class="schema-toolbar" aria-label="切换 SchemaForm 布局">
              <button
                v-for="layout in schemaLayouts"
                :key="layout"
                type="button"
                :class="['layout-chip', { active: schemaLayout === layout }]"
                @click="chooseSchemaLayout(layout)"
              >
                {{ layout }}
              </button>
            </div>
            <SchemaForm
              ref="schemaRef"
              v-model="schemaModel"
              v-model:open="schemaOpen"
              v-model:current="schemaCurrent"
              :columns="schemaColumns"
              :layout-type="schemaLayout"
              title="创建发布计划"
              :grid="true"
              :submitter="{ submitText: '保存计划', resetText: '清空' }"
              @finish="onSchemaFinish"
              @values-change="logEvent('SchemaForm 字段值已更新')"
              @error="logEvent('SchemaForm 提交失败')"
            />
            <div v-if="schemaLayout === 'Form' || schemaLayout === 'Embed'" class="form-footer">
              <span>当前模型：{{ JSON.stringify(schemaModel) }}</span>
              <button type="button" class="action-button" @click="submitSchema">
                通过 ref 提交
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <span>MIT · built for Vue teams</span>
      <span>One columns model, three focused workflows.</span>
    </footer>
  </div>
</template>
