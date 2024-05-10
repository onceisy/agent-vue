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
        v-model="sForm.name"
        autocomplete="off"
        maxlength="50"
        show-word-limit
        placeholder="请输入"
      />
    </el-form-item>
    <el-form-item prop="llm_prompt">
      <slot name="label">
        <div class="label-div">
          <span>提示词</span>
          <span class="iconfont quanping" @click="dialogVisible = true" />
        </div>
      </slot>
      <el-input
        v-model="sForm.llm_prompt"
        :rows="3"
        type="textarea"
        maxlength="5000"
        show-word-limit
        placeholder="请输入提示词"
      />
    </el-form-item>
    <el-form-item label="模型" prop="tool_llm">
      <el-select
        v-model="sForm.tool_llm"
        placeholder="请选择"
        style="width: 100%"
        filterable
      >
        <el-option
          v-for="(item, index) in agentTemplateStore.modelEnum"
          :key="index"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
  </el-form>
  <el-dialog
    v-model="dialogVisible"
    title="提示词"
    append-to-body
    width="100%"
    top="0"
    style="height: 100%; margin-bottom: 0"
  >
    <el-input
      v-model="sForm.llm_prompt"
      :rows="22"
      type="textarea"
      maxlength="5000"
      show-word-limit
      placeholder="请输入提示词"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">
          关闭
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import useFlowForm from "./hooks/use-flow-form";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
const agentTemplateStore = useAgentTemplateHook() as any;
const formNode = ref({
  name: "LLM节点",
  llm_prompt: "",
  tool_llm: ""
});
const formRef = ref(null);
const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  id: {
    type: String,
    default: ""
  }
});
const dialogVisible = ref(false);
const {
  validate,
  resetFields,
  formNode: sForm,
  getForm
} = useFlowForm({ props, formRef, formNode });
const rules = {
  name: [{ required: true, message: "请输入节点称", trigger: "blur" }],
  llm_prompt: [{ required: true, message: "请输入提示词", trigger: "blur" }],
  tool_llm: [{ required: true, message: "请选择模型", trigger: "change" }]
};
defineExpose({
  validate,
  resetFields,
  getForm
});
</script>
<style lang="scss" scoped>
.label-div {
  width: 100%;

  .iconfont {
    float: right;
    color: #409eff;
    cursor: pointer;
  }
}

.label-div::before {
  margin-right: 4px;
  color: var(--el-color-danger);
  content: "*";
}
</style>
