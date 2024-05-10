<script setup lang="ts">
import characterScene from "./parts/roleParts/characterScene.vue";
import promptWord from "./parts/promptWord/promptWord.vue";
import promptConfig from "./parts/config/index.vue";
import ragConfig from "./parts/ragConfig/index.vue";
import chatConfig from "./parts/chatConfig/index.vue";
import activeGuidance from "./parts/activeGuidance/index.vue";
import { onMounted, reactive, ref } from "vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { queryAgentConfig } from "@/api/agent";
import { ElMessage } from "element-plus";
const agentTemplateStore = useAgentTemplateHook();

defineOptions({
  name: "agentEngine"
});
const info = reactive({
  activeName: "role"
});

const handleClick = () => {
  console.log(111);
};
import { useAsyncOptionsHook } from "@/store/modules/asyncOptions";
const asyncOptionStore = useAsyncOptionsHook();
const roleComp: any = ref(null);
const promptWordComp: any = ref(null);
const ragConfigComp: any = ref(null);
const chatConfigComp: any = ref(null);
async function getData(flag = false) {
  const agent_id = agentTemplateStore.getCurrentAgent.agent_id;
  if (agent_id) {
    try {
      const { code, data, message } = await queryAgentConfig({
        agent_id
      });
      if (code === 200) {
        agentTemplateStore.setCurrentAgent(data);
        roleComp.value.queryAgentRoleFn();
        if (flag) {
          promptWordComp.value.initData();
          ragConfigComp.value.initData();
          chatConfigComp.value.initData();
        }
      } else {
        ElMessage.error(message ? message : "查询失败！");
      }
    } catch (error) {
      ElMessage.error("查询失败！");
    }

    asyncOptionStore.queryAllOptions(
      agentTemplateStore.getCurrentAgent.agent_id
    );
  }
}

onMounted(() => {
  getData(true);
});
</script>

<template>
  <div class="agentEngine">
    <el-tabs
      v-model="info.activeName"
      class="demo-tabs"
      @tab-click="handleClick"
    >
      <el-tab-pane label="角色场景" name="role" />
      <!-- <el-tab-pane label="主动引导" name="activeGuidance" /> -->
      <el-tab-pane label="提示词" name="promptWord" />
      <el-tab-pane label="引擎设置" name="engineSet" />
      <el-tab-pane label="RAG设置" name="RAGSet" />
      <!-- <el-tab-pane label="对话设置" name="chatSet" /> -->
    </el-tabs>
    <characterScene
      v-show="info.activeName === 'role'"
      @refreshConfig="getData"
      ref="roleComp"
    />
    <activeGuidance v-if="info.activeName === 'activeGuidance'" />
    <promptWord
      v-show="info.activeName === 'promptWord'"
      ref="promptWordComp"
    />
    <promptConfig
      v-if="info.activeName === 'engineSet'"
      ref="promptConfigComp"
    />
    <ragConfig v-show="info.activeName === 'RAGSet'" ref="ragConfigComp" />
    <chatConfig v-show="info.activeName === 'chatSet'" ref="chatConfigComp" />
  </div>
</template>

<style lang="scss" scoped>
.agentEngine {
  overflow: hidden;
  // padding: 16px 0;

  .demo-tabs {
    ::v-deep(.el-tabs__header) {
      margin: 0;

      .el-tabs__nav-wrap {
        padding-left: 20px;
        background-color: #fff;
      }

      .el-tabs__nav-wrap::after {
        background-color: transparent;
      }

      .el-tabs__item {
        height: 50px;
      }
    }
  }
}
</style>
