<template>
  <ParentLayout>
    <template #sidebar-top>
   </template>
    <template #footer>
    </template>
    <template #page-bottom>
      <div class="theme-default-content">
        <Disqus />
      </div>
    </template>
  </ParentLayout>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue'
export default {
  name: 'Layout',
  components: {
    ParentLayout
  }
}
</script>
