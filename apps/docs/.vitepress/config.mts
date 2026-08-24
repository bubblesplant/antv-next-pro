import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitepress'

const zhGuide = [
  { text: '开始', items: [{ text: '快速开始', link: '/guide/getting-started' }] },
  {
    text: '迁移与约定',
    items: [{ text: '兼容矩阵', link: '/guide/compatibility' }],
  },
]

const zhComponents = [
  {
    text: '数据组件',
    items: [
      { text: 'ProTable', link: '/components/pro-table' },
      { text: 'EditableProTable', link: '/components/editable-pro-table' },
      { text: 'SchemaForm', link: '/components/schema-form' },
    ],
  },
]

const enGuide = [
  { text: 'Start', items: [{ text: 'Getting Started', link: '/en/guide/getting-started' }] },
  {
    text: 'Migration',
    items: [{ text: 'Compatibility Matrix', link: '/en/guide/compatibility' }],
  },
]

const enComponents = [
  {
    text: 'Data Components',
    items: [
      { text: 'ProTable', link: '/en/components/pro-table' },
      { text: 'EditableProTable', link: '/en/components/editable-pro-table' },
      { text: 'SchemaForm', link: '/en/components/schema-form' },
    ],
  },
]

export default defineConfig({
  title: 'Antdv Next Pro',
  description: 'Vue 3 ProTable, EditableProTable and SchemaForm powered by Antdv Next',
  base: '/antv-next-pro/',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/antv-next-pro/mark.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#1768d3' }],
  ],
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Antdv Next Pro',
      description: '面向 Vue 3 的高阶表格与 Schema 表单',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/getting-started' },
          { text: '组件', link: '/components/pro-table' },
          { text: '兼容矩阵', link: '/guide/compatibility' },
        ],
        sidebar: {
          '/guide/': zhGuide,
          '/components/': zhComponents,
        },
        outline: { label: '本页内容', level: [2, 3] },
        docFooter: { prev: '上一页', next: '下一页' },
        lastUpdated: { text: '最后更新于' },
        returnToTopLabel: '返回顶部',
        sidebarMenuLabel: '菜单',
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'Antdv Next Pro',
      description: 'Pro tables and schema forms for Vue 3',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'Components', link: '/en/components/pro-table' },
          { text: 'Compatibility', link: '/en/guide/compatibility' },
        ],
        sidebar: {
          '/en/guide/': enGuide,
          '/en/components/': enComponents,
        },
        outline: { label: 'On this page', level: [2, 3] },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        lastUpdated: { text: 'Last updated' },
        returnToTopLabel: 'Return to top',
        sidebarMenuLabel: 'Menu',
      },
    },
  },
  vite: {
    resolve: {
      alias: [
        {
          find: /^antdv-next-pro$/,
          replacement: fileURLToPath(
            new URL('../../../packages/antdv-next-pro/src/index.ts', import.meta.url),
          ),
        },
      ],
    },
    ssr: {
      noExternal: ['antdv-next', /^@v-c\//, /^dayjs(?:\/|$)/],
    },
  },
  themeConfig: {
    logo: '/antv-next-pro/mark.svg',
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/bubblesplant/antv-next-pro' }],
  },
})
