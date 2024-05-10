<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    :label-width="labelWidth"
    :disabled="disabled"
    label-position="right"
    @submit.prevent
    :inline="inline"
    :class="{ 'el-form-st': inline }"
  >
    <el-row>
      <template v-for="item in fieldList" :key="item.field">
        <el-col
          :style="item.style ? item.style : ''"
          :span="inline ? span : 24"
        >
          <el-form-item
            :label="item.name"
            :prop="item.field"
            :class="item.type"
          >
            <!-- 自定义插槽，解决每个模块特殊交互 -->
            <slot :name="item.field" :item="item" v-if="item.custom" />
            <InitForm
              v-else
              :form="form"
              :disabled="item.disabled"
              :data="item"
            />
          </el-form-item>
        </el-col>
      </template>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import InitForm from "./InitForm";
import {
  getCurrentInstance,
  toRefs,
  ref,
  computed,
  defineExpose,
  withDefaults,
  defineProps,
  defineEmits
} from "vue";
import { formRollToFirstError } from "./utils";
import type { FormInstance } from "element-plus";
interface Props {
  fieldList: any;
  form: any;
  rules?: any;
  span?: number;
  inline?: boolean;
  disabled?: boolean;
  labelWidth?: any;
}
const props = withDefaults(defineProps<Props>(), {
  labelWidth: null,
  fieldList: [],
  form: {},
  rules: {},
  span: 8,
  inline: true,
  disabled: false
});
const emits = defineEmits(["saveForm"]);
const instance: any = getCurrentInstance();
const clearValid = () => {
  setTimeout(() => {
    instance?.refs.formRef.clearValidate();
  });
};
const resetting = () => {
  fieldList.value.forEach(item => {
    if (["dateRange", "numberRange", "text-range"].includes(item.type)) {
      formData.value[item.start] = "";
      formData.value[item.end] = "";
    }
  });
  instance?.refs.formRef.resetFields();
};
const formRef = ref<FormInstance | any>();
const resetExpose = () => {
  props.fieldList.map((item: { start: string; end: string; type: string }) => {
    if (["dateRange", "numberRange", "text-range"].includes(item.type)) {
      formData.value[item.start] = null;
      formData.value[item.end] = null;
    }
  });
  formRef.value.resetFields();
};
const formData = computed(() => {
  return props.form;
});
const checkForm = async () => {
  // 表单校验
  let status = false;
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      status = valid;
      emits("saveForm");
      return true;
    } else {
      // 滚动到错误节点
      formRollToFirstError(
        instance?.refs.formRef.$parent.$parent.$el.parentElement
      );
    }
  });
  return status;
};

const resetFields = () => {
  formRef.value.resetFields();
};

const { fieldList, rules } = toRefs(props);
// 提供父级调用的方法
defineExpose({
  resetExpose,
  checkForm,
  clearValid,
  resetting,
  resetFields
});
</script>
<style lang="scss" scoped></style>
