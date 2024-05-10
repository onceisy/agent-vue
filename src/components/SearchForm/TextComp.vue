<template>
  <el-input
    :placeholder="data.placeholder ? data.placeholder : '请输入'"
    v-model="form[data.field]"
    :rows="data.rows ? data.rows : 2"
    :disabled="data.disabled"
    clearable
    :type="
      data.type === 'multi-text'
        ? 'textarea'
        : data.inputType
        ? data.inputType
        : 'input'
    "
    :maxlength="data.maxLength ? data.maxLength : Infinity"
    :show-word-limit="Boolean(data.maxLength)"
  />
</template>

<script lang="ts" setup>
import { withDefaults, defineProps, toRefs } from "vue";
interface Props {
  form: any;
  data: any;
}
const props = withDefaults(defineProps<Props>(), {
  form: {},
  data: {}
});
const { data, form } = toRefs(props);
</script>
<style lang="scss" scoped>
.el-input {
  width: 100%;
}
</style>
