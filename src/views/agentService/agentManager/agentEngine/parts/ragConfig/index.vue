<template>
  <div class="config">
    <div class="bg-white rounded">
      <div class="config-title">
        RAG生成设置
        <el-button style="float: right" type="primary" @click="save"
          >保存</el-button
        >
      </div>
      <el-form
        ref="formRef"
        class="form"
        :model="initForm"
        label-position="top"
        :inline="true"
      >
        <div style="display: flex; width: 100%">
          <el-form-item label="多轮对话" prop="multi_wheel">
            <el-switch
              v-model="initForm.multi_wheel"
              :active-value="true"
              :inactive-value="false"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
            />
          </el-form-item>
          <el-form-item label="召回文档数(top_k)" prop="top_k">
            <el-input-number
              v-model="initForm.top_k"
              :min="1"
              :max="20"
              class=""
            />
          </el-form-item>
        </div>
        <el-form-item label="温度(temperature)" prop="temperature">
          <div style="width: 100%">
            <el-slider
              class="float-box"
              step="0.01"
              :max="1"
              :min="0"
              v-model="initForm.temperature"
              size="small"
            />
            <el-input-number
              v-model="initForm.temperature"
              :min="0"
              :max="1"
              @blur="temperatureChange"
            />
          </div>
        </el-form-item>
        <el-form-item label="多样性(top_p)" prop="top_p">
          <div class="float-box">
            <el-slider
              class="slider-left"
              step="0.01"
              :max="1"
              :min="0"
              v-model="initForm.top_p"
              size="small"
            />
            <el-input-number
              v-model="initForm.top_p"
              :min="0"
              :max="1"
              @blur="topKChange"
            />
          </div>
        </el-form-item>
        <el-form-item label="最大生成token(max_tokens)" prop="max_tokens">
          <div class="float-box">
            <el-slider
              class="slider-left"
              step="1"
              :max="2048"
              :min="512"
              v-model="initForm.max_tokens"
              size="small"
            />
            <el-input-number
              v-model="initForm.max_tokens"
              :min="512"
              :max="2048"
              class="mx-15"
              @blur="maxTokensChange"
            />
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { saveRagConfig } from "@/api/agent";
import { ElMessage } from "element-plus";
const agentTemplateStore = useAgentTemplateHook() as any;

const formRef = ref(null);
const initForm = reactive({
  multi_wheel: true,
  temperature: 0.01,
  top_p: 0.85,
  top_k: 5,
  max_tokens: 512
  // personality: "" // 提示词里面的知识库回答字段，不要删掉
});

const checkNumber = (number: any) => {
  return !isNaN(parseFloat(number)) && isFinite(number);
};

const temperatureChange = () => {
  if (checkNumber(initForm.temperature)) {
    initForm.temperature = Number(initForm.temperature);
  } else {
    initForm.temperature = 0.01;
  }
};

const topKChange = () => {
  if (checkNumber(initForm.top_p)) {
    initForm.top_p = Number(initForm.top_p);
  } else {
    initForm.top_p = 0.85;
  }
};

const maxTokensChange = () => {
  if (checkNumber(initForm.max_tokens)) {
    initForm.max_tokens = Number(initForm.max_tokens);
  } else {
    initForm.max_tokens = 512;
  }
};

const save = () => {
  formRef.value.validate().then(() => {
    const info = agentTemplateStore.currentAgent as any;
    // info.rag_config = initForm;
    // agentTemplateStore.setCurrentAgent(info);
    const agent_id = info.agent_id;
    saveRagConfig({
      agent_id,
      rag_config: {
        ...initForm
      }
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
  const { rag_config } = agentTemplateStore.currentAgent as any;
  initForm.multi_wheel = rag_config?.multi_wheel || true;
  initForm.temperature = rag_config?.temperature || 0.01;
  initForm.top_p = rag_config?.top_p || 0.85;
  initForm.top_k = rag_config?.top_k || 5;
  initForm.max_tokens = rag_config?.max_tokens || 512;
}

// onBeforeMount(() => {
//   const { rag_config } = agentTemplateStore.currentAgent as any;
//   initForm.multi_wheel = rag_config?.multi_wheel || true;
//   initForm.temperature = rag_config?.temperature || 0.01;
//   initForm.top_p = rag_config?.top_p || 0.85;
//   initForm.top_k = rag_config?.top_k || 5;
//   initForm.max_tokens = rag_config?.max_tokens || 512;
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
