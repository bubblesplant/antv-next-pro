<script setup lang="ts">
import type { VNodeChild } from 'vue'
import VNodeContent from '../shared/VNodeContent'

defineOptions({ name: 'AntdvNextProRenderNode' })
defineProps<{ content?: VNodeChild }>()
</script>

<template>
  <span class="antdv-next-pro__render-node"><VNodeContent :content="content" /></span>
</template>
