<script setup lang="ts">
import kmManager from "./km/kmManager.vue";

defineOptions({
  name: "knowledgeManager"
});
</script>

<template>
  <div class="km-manager-wrap">
    <kmManager />
  </div>
</template>

<style lang="scss" scoped>
.km-manager-wrap {
  overflow: hidden;
}
</style>
