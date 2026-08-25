<script setup lang="ts">
import { computed, ref } from 'vue'

import ProTableScenario from './ProTableScenario.vue'
import { proTableDemoGroups, proTableDemoScenarios } from './scenarios'

const emit = defineEmits<{
  event: [message: string]
}>()

const activeId = ref(proTableDemoScenarios[0]?.id ?? '')
const keyword = ref('')
const groupTitleById = new Map(proTableDemoGroups.map((group) => [group.id, group.title] as const))

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())
const filteredScenarios = computed(() => {
  if (!normalizedKeyword.value) return proTableDemoScenarios
  return proTableDemoScenarios.filter((scenario) =>
    [
      scenario.title,
      scenario.group,
      groupTitleById.get(scenario.group) ?? '',
      scenario.description,
      ...scenario.validationPoints,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedKeyword.value),
  )
})

const visibleGroups = computed(() =>
  proTableDemoGroups
    .map((group) => ({
      ...group,
      scenarios: filteredScenarios.value.filter((scenario) => scenario.group === group.id),
    }))
    .filter((group) => group.scenarios.length > 0),
)

const activeScenario = computed(
  () =>
    proTableDemoScenarios.find((scenario) => scenario.id === activeId.value) ??
    proTableDemoScenarios[0],
)
const activeGroupTitle = computed(() =>
  activeScenario.value ? (groupTitleById.get(activeScenario.value.group) ?? '') : '',
)

const nativeCount = computed(
  () => proTableDemoScenarios.filter((scenario) => scenario.implementation === 'native').length,
)
const mappedCount = computed(() => proTableDemoScenarios.length - nativeCount.value)

const chooseScenario = (id: string) => {
  activeId.value = id
  const scenario = proTableDemoScenarios.find((item) => item.id === id)
  if (scenario) emit('event', `切换到 ProTable 演示「${scenario.title}」`)
}
</script>

<template>
  <section class="pro-lab" aria-labelledby="pro-lab-title">
    <header class="lab-intro">
      <div>
        <p class="lab-kicker">OFFICIAL DEMO COVERAGE · VUE MAPPING</p>
        <h3 id="pro-lab-title">ProTable 功能验证台</h3>
        <p>
          按官方 Table 页面顺序收录全部演示。标记“原生能力”的场景直接使用 ProTable API；标记“Vue
          映射”的场景用组合式状态、插槽或外层布局表达 React 专属能力。
        </p>
      </div>
      <dl class="coverage-meter" aria-label="演示覆盖统计">
        <div class="coverage-total">
          <dt>已收录</dt>
          <dd>{{ proTableDemoScenarios.length }}<small>/ 41</small></dd>
        </div>
        <div>
          <dt>原生能力</dt>
          <dd>{{ nativeCount }}</dd>
        </div>
        <div>
          <dt>Vue 映射</dt>
          <dd>{{ mappedCount }}</dd>
        </div>
      </dl>
    </header>

    <div class="lab-grid">
      <aside class="scenario-browser" aria-label="ProTable 演示目录">
        <label class="scenario-search">
          <span>筛选演示</span>
          <input v-model="keyword" type="search" placeholder="标题、分组或验证点" />
        </label>

        <nav class="scenario-groups">
          <section v-for="group in visibleGroups" :key="group.id" class="scenario-group">
            <header>
              <strong>{{ group.title }}</strong>
              <span>{{ group.scenarios.length }}</span>
            </header>
            <button
              v-for="scenario in group.scenarios"
              :key="scenario.id"
              type="button"
              :data-demo-id="scenario.id"
              :class="['scenario-link', { active: activeScenario?.id === scenario.id }]"
              @click="chooseScenario(scenario.id)"
            >
              <span class="scenario-index">{{ String(scenario.order).padStart(2, '0') }}</span>
              <span>
                <strong>{{ scenario.title }}</strong>
                <small>{{ scenario.implementation === 'native' ? '原生能力' : 'Vue 映射' }}</small>
              </span>
            </button>
          </section>
          <p v-if="visibleGroups.length === 0" class="scenario-empty">
            没有匹配的演示，请换一个关键词。
          </p>
        </nav>
      </aside>

      <article v-if="activeScenario" class="scenario-stage" :data-active-demo="activeScenario.id">
        <header class="scenario-heading">
          <div>
            <p>{{ String(activeScenario.order).padStart(2, '0') }} · {{ activeGroupTitle }}</p>
            <h4>{{ activeScenario.title }}</h4>
            <span>{{ activeScenario.description }}</span>
          </div>
          <span :class="['implementation-badge', `is-${activeScenario.implementation}`]">
            {{ activeScenario.implementation === 'native' ? '原生 API' : 'Vue 等价实现' }}
          </span>
        </header>

        <div class="verification-strip">
          <span>本例验证</span>
          <ul>
            <li v-for="item in activeScenario.validationPoints" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div class="scenario-render">
          <ProTableScenario
            :key="activeScenario.id"
            :scenario="activeScenario"
            @event="emit('event', $event)"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.pro-lab {
  --lab-ink: #13243b;
  --lab-muted: #62748b;
  --lab-line: #d8e4f0;
  --lab-blue: #1768d3;
  --lab-teal: #008c95;
  --lab-amber: #f2a93b;
  color: var(--lab-ink);
}

.lab-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: end;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--lab-line);
}

.lab-kicker {
  margin: 0 0 8px;
  color: var(--lab-teal);
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.lab-intro h3 {
  margin: 0;
  font-size: clamp(25px, 3vw, 38px);
  letter-spacing: -0.04em;
}

.lab-intro p:last-child {
  max-width: 760px;
  margin: 10px 0 0;
  color: var(--lab-muted);
  line-height: 1.75;
}

.coverage-meter {
  display: grid;
  grid-template-columns: 1.25fr repeat(2, 1fr);
  min-width: 330px;
  margin: 0;
  border: 1px solid #c5d5e6;
  border-radius: 14px 5px 14px 5px;
  background: #f8fbff;
  box-shadow: 7px 7px 0 rgba(23, 104, 211, 0.08);
}

.coverage-meter div {
  padding: 13px 15px;
  border-left: 1px solid var(--lab-line);
}

.coverage-meter div:first-child {
  border-left: 0;
}

.coverage-meter dt {
  color: var(--lab-muted);
  font-size: 10px;
}

.coverage-meter dd {
  margin: 4px 0 0;
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 23px;
  font-weight: 800;
}

.coverage-meter small {
  margin-left: 3px;
  color: var(--lab-muted);
  font-size: 11px;
  font-weight: 500;
}

.coverage-total dd {
  color: var(--lab-blue);
}

.lab-grid {
  display: grid;
  grid-template-columns: 275px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  margin-top: 24px;
}

.scenario-browser {
  position: sticky;
  top: 18px;
  overflow: hidden;
  max-height: calc(100vh - 36px);
  border: 1px solid #cbd9e8;
  border-radius: 10px 3px 10px 3px;
  background: #f8fbff;
}

.scenario-search {
  display: grid;
  gap: 7px;
  padding: 14px;
  border-bottom: 1px solid var(--lab-line);
  color: var(--lab-muted);
  font-size: 11px;
  font-weight: 700;
}

.scenario-search input {
  width: 100%;
  padding: 9px 10px;
  border: 1px solid #c5d5e6;
  border-radius: 6px;
  background: white;
  color: var(--lab-ink);
  font: inherit;
  font-weight: 500;
}

.scenario-search input:focus {
  border-color: var(--lab-blue);
  outline: 3px solid rgba(23, 104, 211, 0.13);
}

.scenario-groups {
  overflow: auto;
  max-height: calc(100vh - 116px);
  padding: 8px;
}

.scenario-group + .scenario-group {
  margin-top: 10px;
}

.scenario-group > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 8px;
  color: #52657d;
  font-size: 11px;
}

.scenario-group > header span {
  min-width: 21px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #e5edf7;
  text-align: center;
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 9px;
}

.scenario-link {
  width: 100%;
  display: grid;
  grid-template-columns: 27px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  padding: 9px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--lab-ink);
  text-align: left;
  cursor: pointer;
}

.scenario-link:hover {
  background: #edf4fc;
}

.scenario-link.active {
  background: var(--lab-ink);
  color: white;
}

.scenario-index {
  color: var(--lab-blue);
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.7;
}

.scenario-link.active .scenario-index {
  color: #7edce1;
}

.scenario-link strong,
.scenario-link small {
  display: block;
}

.scenario-link strong {
  overflow: hidden;
  font-size: 12px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scenario-link small {
  margin-top: 2px;
  color: #7b8ca1;
  font-size: 9px;
}

.scenario-link.active small {
  color: #aebed0;
}

.scenario-empty {
  margin: 0;
  padding: 24px 12px;
  color: var(--lab-muted);
  font-size: 12px;
  text-align: center;
}

.scenario-stage {
  min-width: 0;
  border: 1px solid #cbd9e8;
  border-radius: 4px 18px 4px 18px;
  background: white;
  box-shadow: 0 20px 50px rgba(41, 73, 108, 0.11);
}

.scenario-heading {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 24px 18px;
}

.scenario-heading p {
  margin: 0 0 6px;
  color: var(--lab-blue);
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.scenario-heading h4 {
  margin: 0;
  font-size: 24px;
  letter-spacing: -0.03em;
}

.scenario-heading div > span {
  display: block;
  margin-top: 7px;
  color: var(--lab-muted);
  line-height: 1.65;
}

.implementation-badge {
  flex: none;
  padding: 6px 9px;
  border-radius: 999px;
  font-family: 'Cascadia Code', Consolas, monospace;
  font-size: 9px;
  font-weight: 800;
}

.implementation-badge.is-native {
  background: #e7f7f5;
  color: #087c75;
}

.implementation-badge.is-vue-map {
  background: #fff3d7;
  color: #976100;
}

.verification-strip {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 12px 24px;
  border-block: 1px solid var(--lab-line);
  background: #f6f9fd;
}

.verification-strip > span {
  color: var(--lab-muted);
  font-size: 10px;
  font-weight: 800;
  line-height: 2;
}

.verification-strip ul {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.verification-strip li {
  padding: 4px 8px;
  border: 1px solid #cbd9e8;
  border-radius: 999px;
  background: white;
  color: #3f526a;
  font-size: 10px;
}

.scenario-render {
  min-height: 540px;
  padding: 24px;
}

@media (width <= 1050px) {
  .lab-intro {
    grid-template-columns: 1fr;
  }

  .coverage-meter {
    min-width: 0;
  }

  .lab-grid {
    grid-template-columns: 230px minmax(0, 1fr);
  }
}

@media (width <= 820px) {
  .lab-grid {
    grid-template-columns: 1fr;
  }

  .scenario-browser {
    position: static;
    max-height: none;
  }

  .scenario-groups {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: 360px;
  }

  .scenario-group + .scenario-group {
    margin-top: 0;
  }
}

@media (width <= 560px) {
  .coverage-meter {
    grid-template-columns: 1fr;
  }

  .coverage-meter div,
  .coverage-meter div:first-child {
    border-top: 1px solid var(--lab-line);
    border-left: 0;
  }

  .coverage-meter div:first-child {
    border-top: 0;
  }

  .scenario-groups {
    grid-template-columns: 1fr;
  }

  .scenario-heading {
    flex-direction: column;
  }

  .verification-strip {
    grid-template-columns: 1fr;
  }

  .scenario-render {
    padding: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scenario-link {
    scroll-behavior: auto;
  }
}
</style>
