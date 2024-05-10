<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑知识库' : '新建知识库'"
    append-to-body
    width="600"
  >
    <el-form ref="kmFormRef" :model="form" label-position="top" :rules="rules">
      <el-form-item label="知识库名称" prop="title">
        <el-input
          v-model.trim="form.title"
          autocomplete="off"
          maxlength="50"
          show-word-limit
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          :rows="3"
          maxlength="256"
          show-word-limit
          type="textarea"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave"> 保存 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
const dialogVisible = ref(false);
const isEdit = ref(false);
const kmFormRef = ref();
const form = reactive({
  id: "",
  title: "",
  description: ""
});
const validateTitle = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入知识库名称"));
  } else {
    const reg = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
    if (value.replace(reg, "")) {
      callback(new Error("支持中文、英文、数字、下划线"));
    } else if (value.charAt(0) == "_") {
      // 不能以下划线开头
      callback(new Error("不得以下划线为开头"));
    } else {
      callback();
    }
  }
};
const rules = {
  title: [{ required: true, validator: validateTitle, trigger: "blur" }]
};
interface Emits {
  (e: "save", val: any): void;
}
const emit = defineEmits<Emits>();
// 打开弹窗
const openDialog = (data?: any) => {
  dialogVisible.value = true;
  if (data) {
    isEdit.value = true;
    form.id = data.id;
    form.title = data.title;
    form.description = data.description;
  } else {
    isEdit.value = false;
    form.id = "";
    form.title = "";
    form.description = "";
  }
};
const closeDialog = () => {
  dialogVisible.value = false;
};
// 保存
const handleSave = () => {
  kmFormRef.value.validate(async valid => {
    if (valid) {
      emit("save", form);
    }
  });
};
defineExpose({
  openDialog,
  closeDialog
});
</script>

<style lang="scss" scoped></style>
