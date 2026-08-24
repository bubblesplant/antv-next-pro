import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import 'antdv-next/dist/reset.css'
import '../../../../packages/antdv-next-pro/src/style.css'
import './custom.css'

export default {
  extends: DefaultTheme,
} satisfies Theme
