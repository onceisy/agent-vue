<script setup>
import { Position, Handle } from "@vue-flow/core";

// props were passed from the slot using `v-bind="slotProps"`
defineProps({
  slotProps: Object,
  defalut: () => {
    return {};
  }
});
</script>

<template>
  <div class="custom-node">
    <Handle type="target" :position="Position.Left" />
    <div class="node-div">
      <span
        class="iconfont"
        :class="slotProps.data.iconfont"
        :style="[`background-color:${slotProps.data.bgcolor}`]"
      />
      {{ slotProps.data.label }}
    </div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>
<style lang="scss" scoped>
.custom-node {
  width: 200px;
  height: 94px;
  background: #fff;
  border-radius: 4px;

  .node-div .iconfont {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: #fff;
    border-radius: 4px;
  }
}
</style>
