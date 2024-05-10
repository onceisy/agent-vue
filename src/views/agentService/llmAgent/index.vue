<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { queryAgentList, saveAgentTemplate } from "@/api/agent";
import { Plus } from "@element-plus/icons-vue";
import LLMAgentCard from "./LLMAgentCard.vue";
import { ElMessage } from "element-plus";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { useRouter } from "vue-router";
// import {
//   DEFAULT_POLISH_PROMPT,
//   DEFAULT_TOOL_PROMPT,
//   DEFAULT_PERSONALITY
// } from "@/constant/agent";

defineOptions({
  name: "llmAgentIndex"
});

const router = useRouter();
const agentTemplateStore = useAgentTemplateHook();

const list = ref([]);

const page = reactive({
  page: 1,
  limit: 20
});

const totalCount = ref(0);

const getListData = async () => {
  try {
    const { code, data = {} } = await queryAgentList({
      page: page.page,
      size: page.limit
    });
    if (code === 200) {
      list.value = data.result;
      totalCount.value = data.total_count;
    }
  } catch (error) {
    console.log(error);
    console.warn("获取数据失败");
  } finally {
    // to do
  }
};

const dialogFormVisible = ref(false);
const ruleFormRef = ref(null);
const form = reactive({
  name: "",
  desc: ""
});
const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
};

async function handleSaveLLMAgent() {
  // const item = list.value.find(i => i.name === form.name);
  // if (item) {
  //   ElMessage.error("Agent名称不可重复！");
  //   return;
  // }
  await ruleFormRef.value.validate(async valid => {
    if (valid) {
      try {
        // const uid = generateUUID();
        const { code, data } = await saveAgentTemplate({
          agent_id: "",
          ...form
        });
        if (code === 200) {
          ruleFormRef.value.resetFields();
          dialogFormVisible.value = false;
          ElMessage.success("保存成功！");
          await handleCurrentChange(1);
          // 自动跳转到新建的agent引擎
          const current = {
            ...form,
            agent_id: data
          };
          agentTemplateStore.setCurrentAgent(current);
          router.push("/agentService/agentManager/agentEngine");
        } else {
          ElMessage.error("保存失败！");
        }
      } catch (error) {
        ElMessage.error("保存失败！");
      }
    }
  });
}

function handleSizeChange(val) {
  page.limit = val;
  handleCurrentChange(1);
}

function handleCurrentChange(val) {
  page.page = val;
  getListData();
}

// const pagedList = computed(() => {
//   const start = (page.page - 1) * page.limit;
//   const end = page.page * page.limit;
//   return list.value.slice(start, end);
// });

onMounted(() => {
  getListData();
});
</script>

<template>
  <div>
    <el-scrollbar>
      <el-button :icon="Plus" @click="dialogFormVisible = true"
        >新建LLM Agent</el-button
      >
      <div class="card-list">
        <LLMAgentCard
          v-for="agent in list"
          :key="agent.agent_id"
          :agent="agent"
          @refreshList="handleCurrentChange(1)"
        />
      </div>
    </el-scrollbar>
    <div class="pagination">
      <el-pagination
        class="justify-end"
        v-model:current-page="page.page"
        v-model:page-size="page.limit"
        :page-sizes="[10, 20, 50, 100, 500, 1000]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
      v-model="dialogFormVisible"
      title="新建LLM Agent"
      append-to-body
      width="600"
    >
      <el-form
        ref="ruleFormRef"
        :model="form"
        label-position="top"
        :rules="rules"
      >
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

<style lang="scss" scoped>
.card-list-wrapper {
  height: calc(100vh - 200px);
  overflow-y: scroll;
}

.card-list {
  height: calc(100vh - 200px);
}

.pagination {
  margin-top: 10px;
}
</style>
