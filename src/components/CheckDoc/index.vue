<script setup lang="ts">
import { ref } from "vue";
import { Close } from "@element-plus/icons-vue";

defineOptions({
  name: "checkDoc"
});
interface Emits {
  (e: "closeDoc", val: any): void;
}
interface DocItem {
  doc_id: string;
  page_content: string;
  score: number;
  source: string;
  uid: string;
}
const curShowDoc = ref<DocItem>({
  doc_id: "",
  page_content: "",
  score: 0,
  source: "",
  uid: ""
});
const emit = defineEmits<Emits>();
// 查阅文档
const checkDoc = data => {
  curShowDoc.value = data;
};
// 关闭文档
const closeDoc = () => {
  emit("closeDoc", "");
};
defineExpose({
  checkDoc
});
</script>

<template>
  <div class="log-container">
    <div class="debug-title">
      <el-button
        :icon="Close"
        circle
        class="close-btn"
        @click.stop="closeDoc"
      />
      {{ curShowDoc?.source }}
    </div>
    <div class="content-div">
      {{ curShowDoc.page_content }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.log-container {
  flex: 1;
  height: 100%;
  overflow: auto;
  background-color: #fff;

  .debug-title {
    padding: 12px 20px;
    border-bottom: 1px solid#DCDFE6;

    .close-btn {
      height: 24px;
      padding: 4px;
      margin-right: 4px;
    }
  }

  .content-div {
    padding: 20px;
    font-size: 14px;
    font-weight: normal;
    line-height: 24px;
    color: #606266;
    letter-spacing: -0.01px;
  }
}
</style>
