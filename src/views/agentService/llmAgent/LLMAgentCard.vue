<template>
  <div
    class="llm-agent-card inline-block mr-4 mt-4 cursor-pointer"
    @click="goAgentTemplate"
  >
    <el-card>
      <template #header>
        <div class="card-header flex justify-between">
          <el-text
            class="agent-name font-semibold text-text_color_black"
            truncated
          >
            {{ agent.name }}
          </el-text>
          <div>
            <el-button type="default" link @click.stop="handleEdit"
              ><i class="iconfont bianji"
            /></el-button>
            <el-button type="default" link @click.stop="handleCopyLLMAgent"
              ><i class="iconfont fuzhi"
            /></el-button>
            <el-button type="default" link @click.stop="handleDeleteLLMAgent"
              ><i class="iconfont shanchu"
            /></el-button>
          </div>
        </div>
      </template>
      <div>
        <el-tooltip effect="dark" placement="top-start" :content="agent.desc">
          <el-text class="text-sm text-text_color_black" truncated>
            {{ agent.desc }}
          </el-text>
        </el-tooltip>
        <div class="text-sm mt-1 flex align-middle">
          <span class="text-nowrap text-text_color_black2">Agent ID：</span>
          <el-tooltip
            effect="dark"
            placement="top-start"
            :content="agent.agent_id"
          >
            <el-text class="text-sm text-text_color_black" truncated>
              {{ agent.agent_id }}
            </el-text>
          </el-tooltip>
        </div>
        <div class="text-sm mt-1 flex align-middle">
          <span class="text-text_color_black2">更新时间：</span>
          <el-text class="text-sm text-text_color_black" truncated>
            {{ agent.update_time }}
          </el-text>
        </div>
      </div>
    </el-card>
    <!-- 编辑 -->
    <el-dialog
      v-model="dialogFormVisible"
      title="编辑LLM Agent"
      append-to-body
      width="600"
    >
      <el-form
        ref="ruleFormRef"
        :model="form"
        label-position="top"
        :rules="rules"
      >
        <el-form-item label="Agent ID">
          <span>{{ form.agent_id }}</span>
        </el-form-item>
        <el-form-item label="GPT Agent名称" prop="name">
          <el-input
            v-model="form.name"
            autocomplete="off"
            maxlength="50"
            show-word-limit
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
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
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveLLMAgent">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from "element-plus";
import {
  copyAgentTemplate,
  deleteAgentTemplate,
  saveAgentTemplate
} from "@/api/agent";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { useRouter } from "vue-router";
import { ref, reactive } from "vue";

const props = defineProps({
  agent: {
    type: Object,
    default: () => ({})
  }
});
const emit = defineEmits(["refreshList"]);
const router = useRouter();
const agentTemplateStore = useAgentTemplateHook();

/**
 * @description: 复制
 * @return {*}
 */
function handleCopyLLMAgent() {
  ElMessageBox.confirm("是否确认复制？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const form = {
      agent_id: props.agent.agent_id
    };
    try {
      const { code } = await copyAgentTemplate(form);
      if (code === 200) {
        ElMessage.success("复制成功！");
        emit("refreshList");
      } else {
        ElMessage.error("复制失败！");
      }
    } catch (error) {
      ElMessage.error("复制失败！");
    }
  });
}

/**
 * @description: 删除
 * @return {*}
 */
function handleDeleteLLMAgent() {
  ElMessageBox.confirm("是否确认删除？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    try {
      const { code } = await deleteAgentTemplate({
        agent_id: props.agent.agent_id
      });
      if (code === 200) {
        ElMessage.success("删除成功！");
        emit("refreshList");
      } else {
        ElMessage.error("删除失败！");
      }
    } catch (error) {
      ElMessage.error("删除失败！");
    }
  });
}

function goAgentTemplate() {
  agentTemplateStore.setCurrentAgent(props.agent);
  router.push("/agentService/agentManager/agentEngine");
}

const dialogFormVisible = ref(false);
const ruleFormRef = ref(null);
const form = reactive({
  name: "",
  desc: "",
  agent_id: ""
});
const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
};

function handleEdit() {
  form.name = props.agent.name;
  form.desc = props.agent.desc;
  form.agent_id = props.agent.agent_id;
  dialogFormVisible.value = true;
}

async function handleSaveLLMAgent() {
  await ruleFormRef.value.validate(async valid => {
    if (valid) {
      try {
        const { code } = await saveAgentTemplate({
          // ...props.agent,
          ...form
          // update_time: dayjs().format("YYYY-DD-MM HH:mm:ss")
        });
        if (code === 200) {
          ruleFormRef.value.resetFields();
          dialogFormVisible.value = false;
          ElMessage.success("保存成功！");
          emit("refreshList");
        } else {
          ElMessage.error("保存失败！");
        }
      } catch (error) {
        ElMessage.error("保存失败！");
      }
    }
  });
}
</script>
<style scoped lang="scss">
.llm-agent-card {
  max-width: 280px;

  .el-card {
    :deep(.el-card__header) {
      padding: 16px;
      border-bottom: none;

      .card-header {
        .agent-name {
          flex-basis: 60%;
          font-size: 18px;
        }

        .dropdown-menu {
          .el-dropdown {
            transform: rotate(90deg);
          }
        }
      }
    }

    :deep(.el-card__body) {
      padding: 0 16px 16px;

      .text-nowrap {
        text-wrap: nowrap;
      }
    }
  }
}
</style>
