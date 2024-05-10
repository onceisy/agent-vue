<template>
  <el-dialog
    v-model="dialogVisible"
    title="导入文档"
    append-to-body
    width="600"
  >
    <el-form
      ref="importFormRef"
      :model="form"
      label-position="top"
      :rules="rules"
    >
      <el-form-item prop="file">
        <el-upload
          style="width: 100%"
          ref="uploadRef"
          drag
          action="null"
          accept=".txt,.pdf,.docx,.xls,.csv"
          show-file-list
          :auto-upload="false"
          :multiple="false"
          :file-list="fileList"
          limit="1"
          :on-change="changeFile"
          :on-exceed="onExceed"
        >
          <div style="display: flex; justify-content: center">
            <img src="@/assets/images/upload.png" />
          </div>
          <upload-filled />
          <div class="el-upload__text">
            将文件拖到此处，或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              目前仅支持单文件上传，单个文件不超过50M
              支持文件类型：txt、pdf、docx、xls、csv类型
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item prop="chunk_size">
        <slot name="label">
          <span class="pink-tip">*</span>
          chunk size
          <span class="right-tip">每个文档分片切割字符限制，默认：256</span>
        </slot>
        <el-input v-model.trim="form.chunk_size" placeholder="请输入" />
      </el-form-item>
      <el-form-item prop="overlap">
        <slot name="label">
          <span class="pink-tip">*</span>
          overlap
          <span class="right-tip" style="padding-left: 308px"
            >每个文档分片重叠字符，默认：50</span
          >
        </slot>
        <el-input v-model.trim="form.overlap" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancleFun">取消</el-button>
        <el-button type="primary" @click="handleSave"> 保存 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { ElMessage, type UploadUserFile } from "element-plus";
const dialogVisible = ref(false);
const importFormRef = ref();
const fileList = ref<UploadUserFile[]>([]);
const uploadRef = ref();
const form = reactive({
  kb_id: "", // 知识库 id
  file: "" as any, // 上传文件
  bytes: 0, // 上传文件大小
  chunk_size: 256, // 分片切割字符限制
  overlap: 50 // 分片重叠字符
});
const rules = {
  name: [{ required: true, message: "请输入chunk size", trigger: "blur" }],
  desc: [{ required: true, message: "请输入overlap", trigger: "blur" }]
};
interface Emits {
  (e: "save", val: any): void;
}
const emit = defineEmits<Emits>();
// 打开弹窗
const openDialog = (data?: any) => {
  dialogVisible.value = true;
  form.kb_id = data.id;
  fileList.value = [];
  form.file = "";
  form.bytes = 0;
  form.chunk_size = 256;
  form.overlap = 50;
};
const onExceed = () => {
  ElMessage.error("文件超出限制");
  return false;
};
const cancleFun = () => {
  fileList.value = [];
  form.file = "";
  form.bytes = 0;
  form.chunk_size = 256;
  form.overlap = 50;
};
const changeFile = (uploadFile: any, list) => {
  const file = uploadFile.raw;
  let isPIC = false;
  if (
    file.name.indexOf(".txt") ||
    file.name.indexOf(".pdf") ||
    file.name.indexOf(".docx") ||
    file.name.indexOf(".xls") ||
    file.name.indexOf(".csv")
  ) {
    isPIC = true;
  }
  const isLimitSize = file.size / 1024 / 1024 > 50;
  if (!isPIC) {
    ElMessage.error("只支持txt、pdf、docx、xls、csv类型");
    fileList.value = [];
    return false;
  }
  if (isLimitSize) {
    ElMessage.error("单个文件不超过50M");
    fileList.value = [];
    return false;
  }
  fileList.value = list;
  form.bytes = file.size;
  // form.file = new Blob([uploadFile.raw], { type: uploadFile.raw.type });
  form.file = uploadFile.raw;
};
// 保存
const handleSave = () => {
  importFormRef.value.validate(async valid => {
    if (valid) {
      if (!form.file) {
        // 没有文件，提示上传文件
        ElMessage.error("请先上传文档");
        return false;
      }
      emit("save", form);
      dialogVisible.value = false;
    }
  });
};
defineExpose({
  openDialog
});
</script>

<style lang="scss" scoped>
.right-tip {
  padding-left: 264px;
  font-size: 12px;
}

.pink-tip {
  margin-right: 4px;
  color: var(--el-color-danger);
}
</style>
