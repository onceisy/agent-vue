<template>
  <div class="config">
    <div class="bg-white rounded">
      <div class="config-title">
        默认模型
        <el-button style="float: right" type="primary" @click="save"
          >保存</el-button
        >
      </div>
      <el-form
        ref="formRef"
        class="form"
        :model="initForm"
        :rules="rules"
        label-position="top"
        :inline="true"
      >
        <el-form-item label="角色场景模型" prop="tool_llm">
          <el-select v-model="initForm.tool_llm" placeholder="选择角色场景模型">
            <el-option
              v-for="(item, index) in agentTemplateStore.modelEnum"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="回复模型" prop="default_sub_tool_llm">
          <el-select
            v-model="initForm.default_sub_tool_llm"
            placeholder="选择回复模型"
          >
            <el-option
              v-for="(item, index) in agentTemplateStore.modelEnum"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="RAG回复模型" prop="rag_llm">
          <el-select v-model="initForm.rag_llm" placeholder="选择RAG回复模型">
            <el-option
              v-for="(item, index) in ragllmList"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="bg-white rounded">
      <div class="config-title">Agent前置动作</div>
      <div class="scenePreAction">
        <ScenePreAction
          type="engine"
          ref="preActionRef"
          v-model:form="preActionForm"
        />
      </div>
    </div>

    <div class="bg-white rounded">
      <div class="config-title">其他设置</div>
      <div class="form">
        <!-- 函数服务 -->
        <div class="el-form-item">
          <label class="el-form-item__label">
            <div class="pre-label before:bg-primary_blue flex items-center">
              <span>消息间隔回复</span>
            </div>
          </label>
        </div>
        <div class="tip">
          当Agent回复为固定话术时，消息延时<el-input-number
            v-model="initForm.message_interval"
            :min="0"
            :precision="0"
          />秒后回复
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onBeforeMount } from "vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import ScenePreAction from "@/components/AgentForm/ScenePreAction.vue";
import { saveEngine } from "@/api/agent";
import { ElMessage } from "element-plus";
const agentTemplateStore = useAgentTemplateHook() as any;

const formRef = ref(null);
const initForm = reactive({
  message_interval: 1,
  tool_llm: "minimax",
  default_sub_tool_llm: "minimax",
  rag_llm: "minimax"
});
// 中台只支持这4种
const ragllmList = ref([
  "gpt4",
  "gpt4-32",
  "minimax",
  "minimax6",
  "gpt3.5-turbo",
  "skylark2-pro-4k",
  "skylark2-pro-32k"
]);
const preActionRef = ref(null);
const preActionForm = ref({
  is_enable_function: false,
  is_enable_entity: false,
  // entity_type: 1,
  function_name: "",
  entity_arr: []
});

const rules = {
  tool_llm: [{ required: true, message: "请选择", trigger: "change" }],
  default_sub_tool_llm: [
    { required: true, message: "请选择", trigger: "change" }
  ],
  rag_llm: [{ required: true, message: "请选择", trigger: "change" }]
};

const save = () => {
  formRef.value.validate().then(() => {
    preActionRef.value.validate().then(() => {
      const info = agentTemplateStore.currentAgent as any;
      saveEngine({
        agent_id: info.agent_id,
        ...initForm,
        ...preActionForm.value
      }).then(res => {
        if (res.code === 200) {
          ElMessage.success("保存成功");
        } else {
          ElMessage.error("保存失败");
        }
      });
    });
  });
};

function initData() {
  const {
    is_enable_entity,
    is_enable_function,
    // entity_type,
    function_name,
    entity_arr,
    message_interval,
    tool_llm,
    default_sub_tool_llm,
    rag_llm
  } = agentTemplateStore.currentAgent as any;
  initForm.message_interval = message_interval;
  initForm.tool_llm = tool_llm || "minimax";
  initForm.default_sub_tool_llm = default_sub_tool_llm || "minimax";
  initForm.rag_llm = rag_llm || "minimax";
  preActionForm.value.is_enable_entity = is_enable_entity;
  preActionForm.value.is_enable_function = is_enable_function;
  // preActionForm.value.entity_type = entity_type;
  preActionForm.value.function_name = function_name;
  preActionForm.value.entity_arr = entity_arr;
}

defineExpose({
  initData
});

onBeforeMount(() => {
  initData();
});
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
