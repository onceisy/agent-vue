<template>
  <div class="config">
    <div class="bg-white rounded">
      <div class="config-title">
        对话设置
        <el-button style="float: right" type="primary" @click="save"
          >保存</el-button
        >
      </div>
      <el-form ref="formRef" class="form" :model="initForm">
        <el-form-item label="欢迎语" prop="enable_welcome_msg">
          <el-switch
            v-model="initForm.enable_welcome_msg"
            :active-value="true"
            :inactive-value="false"
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #ff4949;
            "
          />
        </el-form-item>
        <el-form-item prop="welcome_msg">
          <el-input
            style="width: 400px"
            v-model="initForm.welcome_msg"
            :rows="3"
            maxlength="500"
            show-word-limit
            type="textarea"
            placeholder="请输入欢迎语"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { saveChatConfig } from "@/api/agent";
import { ElMessage } from "element-plus";
const agentTemplateStore = useAgentTemplateHook() as any;

const formRef = ref(null);
const initForm = reactive({
  enable_welcome_msg: false,
  welcome_msg: ""
});

const save = () => {
  formRef.value.validate().then(() => {
    const info = agentTemplateStore.currentAgent as any;
    const agent_id = info.agent_id;
    saveChatConfig({
      agent_id,
      ...initForm
    }).then(res => {
      if (res.code === 200) {
        ElMessage.success("保存成功");
      } else {
        ElMessage.error(res.message ? res.message : "保存失败");
      }
    });
  });
};

defineExpose({
  initData
});

function initData() {
  const info = agentTemplateStore.currentAgent as any;
  initForm.enable_welcome_msg = info.enable_welcome_msg || false;
  initForm.welcome_msg = info.welcome_msg || "";
}
// onBeforeMount(() => {
//   const { chat_config } = agentTemplateStore.currentAgent as any;
//   initForm.enable_welcome_msg = chat_config?.enable_welcome_msg || false;
//   initForm.welcome_msg = chat_config?.welcome_msg || "";
// });
</script>

<style lang="scss" scoped>
.config {
  margin-top: 16px;

  .tip {
    font-size: 14px;
    font-weight: normal;
    color: #303133;
  }

  .form {
    padding: 16px 20px;

    .el-form-item span {
      font-size: 14px;
      color: #303133;
    }
  }

  .bg-white {
    margin-bottom: 16px;
  }
}

.config-title {
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #e4e7ed;
}

.pre-label::before {
  display: inline-block;
  width: 4px;
  height: 16px;
  margin-right: 8px;
  content: "";
}

.el-select {
  width: 100%;
}
</style>
