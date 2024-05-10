<template>
  <div class="flexC w100">
    <el-date-picker
      v-model="form[data.start]"
      :disabled="data.disabled"
      clearable
      class="base-date"
      :type="data.dateType ? 'datetime' : 'date'"
      :value-format="data.dateType ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'"
      :placeholder="data.placeholder ? data.placeholder : '选择日期'"
      style="flex: 10"
    />
    <el-icon class="icon-minus" style="flex: 1"><Minus /></el-icon>
    <el-date-picker
      style="flex: 10"
      v-model="form[data.end]"
      :disabled="data.disabled"
      clearable
      class="base-date"
      :type="data.dateType ? 'datetime' : 'date'"
      :value-format="data.dateType ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'"
      :placeholder="data.placeholder ? data.placeholder : '选择日期'"
    />
  </div>
</template>

<script lang="ts" setup>
import { toRefs, withDefaults, defineProps } from "vue";
interface Props {
  form: any;
  data: any;
}
const props = withDefaults(defineProps<Props>(), {
  form: {},
  data: {}
});
const { form, data } = toRefs(props);
</script>
<style lang="scss" scoped>
.icon-minus {
  margin: 0 8px;
}
</style>
