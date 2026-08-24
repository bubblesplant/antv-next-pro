import { createApp } from 'vue'
import Antd from 'antdv-next'

import 'antdv-next/dist/reset.css'
import '../../../packages/antdv-next-pro/src/style.css'
import './style.css'

import App from './App.vue'

createApp(App).use(Antd).mount('#app')
