<template>
  <el-form
    class="px-5 pt-5 pb-1 bg-white rounded"
    ref="formRef"
    :model="sForm"
    label-position="top"
    :rules="rules"
  >
    <el-form-item label="节点名称" prop="name">
      <el-input
        v-model.trim="sForm.name"
        autocomplete="off"
        maxlength="50"
        show-word-limit
        placeholder="请输入"
      />
    </el-form-item>
    <el-form-item label="函数服务" prop="function_name">
      <el-select
        v-model="sForm.function_name"
        placeholder="请选择"
        style="width: 100%"
        filterable
        @change="changeSelect"
      >
        <el-option
          v-for="item in funcList"
          :value="item.name"
          :label="item.otherName"
          :key="item.name"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      v-show="sForm.function_name"
      label="返回参数"
      prop="parameter"
    >
      <span
        class="parame-span"
        v-for="(item, index) in sForm.parameter"
        :key="index"
      >
        <el-input
          style="width: 502px"
          v-model="item.value"
          placeholder="请输入返回参数"
          disabled
        >
          <template #prepend>参数名</template>
        </el-input>
      </span>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import useFlowForm from "./hooks/use-flow-form";
const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  id: {
    type: String,
    default: ""
  },
  funcList: {
    type: Array,
    default: () => [] as any
  }
});
const formRef = ref(null);
const formNode = ref({
  name: "函数节点",
  function_name: "",
  func_alias: "",
  parameter: []
});
const {
  validate,
  resetFields,
  formNode: sForm,
  getForm
} = useFlowForm({ props, formRef, formNode });
const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  function_name: [
    { required: true, message: "请选择函数服务", trigger: "change" }
  ]
};
const changeSelect = cur => {
  const funObj = props.funcList.filter(item => item.name == cur);
  sForm.value.parameter = funObj[0].returnParams || [];
  sForm.value.func_alias = funObj[0].otherName || "";
};
defineExpose({
  validate,
  resetFields,
  getForm
});
</script>
<style lang="scss" scoped>
.parame-span {
  margin-bottom: 10px;
}
</style>
