<script setup lang="ts">
import { getAiEntity, saveEntity, delEntity } from "@/api/agent";
import { Plus } from "@element-plus/icons-vue";
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";

const agentTemplateStore = useAgentTemplateHook();

defineOptions({
  name: "accountManagerIndex"
});
const loading = ref(true);
const formLoading = ref(false);
const page = ref(1);
const size = ref(20);
const total_pages = ref(0);
const total_count = ref(0);
const tableData = ref<DataItem[]>([]);
const dataItem = ref<DataItem>({
  entity_name: "",
  entity_desc: "",
  regex: ""
});
const editDialogFormVisible = ref(false);
const operate = ref("");

interface DataItem {
  entity_name: string;
  entity_desc: string;
  regex: string;
  create_datetime?: string;
  entity_id?: string;
}

const rules = reactive({
  entity_name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  regex: [{ required: true, message: "请输入正则", trigger: "blur" }]
});
const handleSizeChange = (val: number) => {
  page.value = 1;
  size.value = val;
  getList();
};
const handleCurrentChange = (val: number) => {
  page.value = val;
  getList();
};
onMounted(() => {
  getList();
});
const getList = async () => {
  if (!loading.value) loading.value = true;
  getAiEntity({
    page: page.value,
    size: size.value,
    agent_id: agentTemplateStore.getCurrentAgent.agent_id
  }).then((res: any) => {
    if (res.code == 200) {
      tableData.value = res.data?.result || [];
      total_pages.value = res.data?.total_pages || 0;
      total_count.value = res.data?.total_count || 0;
    }
  });
  loading.value = false;
};
const handleEdit = async (row: any) => {
  editDialogFormVisible.value = true;
  if (row == null) {
    // 添加
    operate.value = "添加实体";
    dataItem.value.entity_id = undefined;
    dataItem.value.entity_name = "";
    dataItem.value.entity_desc = "";
    dataItem.value.regex = "";
  } else {
    // 编辑
    operate.value = "编辑实体";
    dataItem.value.entity_id = row.entity_id;
    dataItem.value.entity_name = row.entity_name;
    dataItem.value.entity_desc = row.entity_desc;
    dataItem.value.regex = row.regex;
  }
};
const formRef = ref(null);
// 保存数据
const saveData = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      formLoading.value = true;
      try {
        const res: any = await saveEntity(
          Object.assign(
            {},
            { agent_id: agentTemplateStore.getCurrentAgent.agent_id },
            dataItem.value
          )
        );
        formLoading.value = false;
        if (res.code == 200) {
          ElMessage.success("保存成功");
          editDialogFormVisible.value = false;
          getList();
        } else {
          ElMessage.error(res.description);
        }
      } catch (error) {
        ElMessage.error("保存失败！");
      }
    }
  });
};
// 删除
const deleteHandle = async (entity_id: string) => {
  ElMessageBox.confirm("确定要删除吗?", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const res: any = await delEntity({ entity_id });
      if (res.code == 200) {
        ElMessage.success("删除成功");
        handleCurrentChange(1);
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {
      ElMessage.error("删除失败");
    });
};
</script>

<template>
  <div class="account main-continer">
    <div class="title">
      <div class="title-text">实体管理</div>
      <el-button type="primary" :icon="Plus" @click.stop="handleEdit(null)"
        >添加实体</el-button
      >
    </div>
    <div class="account-content" v-loading="loading">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="entity_name" label="名称" width="180" />
        <el-table-column prop="entity_id" label="创建方式" width="120">
          <template #default="scope">
            <span
              v-if="
                scope.row.entity_id &&
                scope.row.entity_id.startsWith('system_ent')
              "
            >
              系统内置</span
            >
            <span v-else>自定义</span>
          </template>
        </el-table-column>
        <el-table-column prop="entity_desc" label="描述" width="180" />
        <el-table-column prop="regex" label="实体成员">
          <template #default="scope">
            <div
              v-if="scope.row.regex"
              class="px-5 py-2 rounded-10"
              style="
                display: inline-block;
                color: #6ed670;
                background-color: #f2faee;
              "
            >
              {{ scope.row.regex }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="create_datetime" label="创建时间" width="180" />
        <el-table-column label="操作" :width="120" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              @click="deleteHandle(scope.row?.entity_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="page">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50, 100]"
          :small="false"
          :disabled="false"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total_count"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <!-- 添加弹窗 -->
    <el-dialog
      :size="900"
      v-model="editDialogFormVisible"
      :title="operate"
      direction="rtl"
      v-loading="formLoading"
    >
      <el-form
        :model="dataItem"
        ref="formRef"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="名称" prop="entity_name">
          <el-input
            v-model="dataItem.entity_name"
            autocomplete="off"
            placeholder="请输入名称"
          />
        </el-form-item>
        <el-form-item label="描述" prop="entity_desc">
          <el-input
            v-model="dataItem.entity_desc"
            autocomplete="off"
            :rows="2"
            type="textarea"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="正则匹配" prop="regex">
          <el-input
            v-model="dataItem.regex"
            autocomplete="off"
            placeholder="请输入正则表达式"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveData"> 保存 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.page {
  display: flex;
  justify-content: right;
  margin-top: 20px;
}
</style>
