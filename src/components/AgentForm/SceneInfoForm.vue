<template>
  <el-form ref="formRef" :model="form" label-position="top" :rules="rules">
    <div class="px-5 pt-5 pb-1 bg-white rounded">
      <h4 class="mb-5 text-text_color_black text-base font-medium">
        {{ type === "scenes" ? "场景信息" : "角色信息" }}
      </h4>
      <el-form-item
        :label="type === 'scenes' ? '场景名称' : '角色名称'"
        prop="name"
      >
        <el-input
          v-model="form.name"
          autocomplete="off"
          maxlength="50"
          show-word-limit
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item
        :label="type === 'scenes' ? '场景描述' : '角色描述'"
        prop="desc"
      >
        <el-input
          v-model="form.desc"
          :rows="3"
          maxlength="500"
          show-word-limit
          type="textarea"
          placeholder="请输入备注"
        />
      </el-form-item>
      <el-form-item label="input指令" prop="input">
        <el-input
          v-model="form.input"
          autocomplete="off"
          maxlength="50"
          show-word-limit
          placeholder="请输入"
        />
      </el-form-item>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import useAgentForm from "./hooks/use-agent-form";

const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["update:form"]);

const initForm = {
  name: "",
  desc: "",
  input: ""
};

const { formRef, form, validate } = useAgentForm({ props, emit, initForm });
const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  desc: [{ required: true, message: "请输入场景描述", trigger: "blur" }],
  input: [{ required: true, message: "input指令", trigger: "blur" }]
};

defineExpose({
  validate
});
</script>
