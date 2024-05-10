<script setup lang="ts">
import {
  queryFunctionList,
  getFission,
  createFission,
  putFission,
  deleteFission
} from "@/api/agent";
import { getAppId, generateUUID } from "@/utils/common";
import { Plus } from "@element-plus/icons-vue";
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Base64 } from "js-base64";
import MonacoEditor from "monaco-editor-vue3";
import { Delete, FullScreen } from "@element-plus/icons-vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";

const agentTemplateStore = useAgentTemplateHook();
defineOptions({
  name: "accountManagerIndex"
});
interface DataItem {
  id?: string;
  name: string;
  otherName: string;
  description: string;
  body: string;
  returnParams: "";
  create_datetime?: string;
  update_datetime?: string;
}
const tableData = ref<DataItem[]>([]);
const small = ref(false);
const loading = ref(true);
const page = ref(1);
const size = ref(20);
const total_pages = ref(0);
const total_count = ref(0);
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
  queryFunctionList({
    page: page.value,
    size: size.value,
    otherName: "",
    agent_id: agentTemplateStore.getCurrentAgent.agent_id,
    bot_id: getAppId()
  }).then((res: any) => {
    if (res.code == 200) {
      console.log(res.datas);
      tableData.value = res.data?.result || [];
      total_pages.value = res.total_pages || 0;
      total_count.value = res.total_count || 0;
    }
  });
  loading.value = false;
};
const operate = ref("");
const lazy = ref(false);
const activeName = ref("first");
const editDialogFormVisible = ref(false);
const fullDialogVisible = ref(false);
const dataItem = ref<DataItem>({
  name: "",
  otherName: "",
  description: "",
  body: "",
  returnParams: ""
});
interface Val {
  value: string;
}
const formLoading = ref(false);
const returnParams = ref<Val[]>([{ value: "" }]);
const rules = reactive({
  name: [{ required: true, message: "请输入函数名称", trigger: "blur" }],
  otherName: [{ required: true, message: "请输入函数别名", trigger: "blur" }],
  body: [{ required: true, message: "请输入函数体", trigger: "blur" }]
});
const handleEdit = async (row: any) => {
  lazy.value = false;
  editDialogFormVisible.value = true;
  setTimeout(() => {
    lazy.value = true;
  }, 100);
  if (row == null) {
    // 添加
    activeName.value = "first";
    operate.value = "添加";
    dataItem.value.id = undefined;
    dataItem.value.name = "function-" + generateUUID();
    dataItem.value.otherName = "";
    dataItem.value.description = "";
    dataItem.value.body = "";
    returnParams.value = [{ value: "" }];
  } else {
    // 编辑
    operate.value = "编辑";
    dataItem.value.id = row.id;
    dataItem.value.name = row.name;
    dataItem.value.otherName = row.otherName;
    dataItem.value.description = row.description;
    dataItem.value.body = row.body;
    const res: any = await getFission(row);
    if (res.code == 200) {
      returnParams.value = res.returnParams;
    }
  }
};
// 添加返回参数
const addReturnParams = () => {
  returnParams.value.push({ value: "" });
};
// 删除返回参数
const deleteReturnParams = (index: number) => {
  if (returnParams.value.length == 1) return;
  returnParams.value.splice(index, 1);
};
// 全屏
const handleFullScreen = () => {
  lazy.value = false;
  fullDialogVisible.value = true;
  setTimeout(() => {
    lazy.value = true;
  }, 100);
};
const formRef = ref(null);
// 保存数据
const saveData = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      let flag = false;
      for (let index = 0; index < returnParams.value.length; index++) {
        const item = returnParams.value[index];
        if (item.value == "") {
          flag = true;
          break;
        }
      }
      if (flag) {
        ElMessage.error("请填写返回变量！");
        return false;
      }
      formLoading.value = true;
      try {
        let res: any = null;
        const params = {
          id: dataItem.value.id,
          bot_id: getAppId(),
          agent_id: agentTemplateStore.getCurrentAgent.agent_id,
          function_name: dataItem.value.name,
          function_nickname: dataItem.value.otherName,
          description: dataItem.value.description,
          parameter: returnParams.value
            .map(function (obj) {
              return obj.value;
            })
            .join("##"),
          function_body: Base64.encode(dataItem.value.body)
        };
        if (operate.value == "添加") {
          res = await createFission(params);
        } else {
          //put_fission
          res = await putFission(params);
        }
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
const deleteHandle = async (id: string, function_name: string) => {
  ElMessageBox.confirm("确定要删除吗?", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const res: any = await deleteFission({
        id: id,
        function_name: function_name
      });
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
      <div class="title-text">函数服务</div>
      <el-button type="primary" :icon="Plus" @click.stop="handleEdit(null)"
        >添加函数</el-button
      >
    </div>
    <div class="account-content" v-loading="loading">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="name" label="函数名称" />
        <el-table-column prop="otherName" label="函数别名" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="update_datetime" :width="170" label="更新时间" />
        <el-table-column label="操作" :width="120">
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
              @click="deleteHandle(scope.row?.id, scope.row.name)"
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
          :small="small"
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
    <el-drawer
      :size="900"
      custom-class="fn-drawer"
      v-model="editDialogFormVisible"
      :title="operate"
      direction="rtl"
      v-loading="formLoading"
    >
      <template #header="{ titleId, titleClass }">
        <h4 :id="titleId" :class="titleClass">{{ operate }}</h4>
        <span class="dialog-footer">
          <el-button @click="editDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveData"> 保存 </el-button>
        </span>
      </template>
      <el-form
        :model="dataItem"
        ref="formRef"
        :rules="rules"
        label-position="top"
      >
        <div class="form-block">
          <div class="sub-title">编辑函数</div>
          <el-form-item label="函数名称" prop="name">
            <el-input
              v-model="dataItem.name"
              autocomplete="off"
              placeholder="请输入函数名称"
              disabled
            />
          </el-form-item>
          <el-form-item label="函数别名" prop="otherName">
            <el-input
              v-model="dataItem.otherName"
              autocomplete="off"
              placeholder="请输入函数别名"
            />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="dataItem.description"
              autocomplete="off"
              :rows="2"
              type="textarea"
              placeholder="请输入描述"
            />
          </el-form-item>
          <el-form-item label="函数体" prop="body" class="monacoEditor--item">
            <el-icon @click="handleFullScreen" class="fullscreen">
              <FullScreen />
            </el-icon>
            <div style="width: 100%; height: 200px">
              <MonacoEditor
                v-if="lazy"
                theme="vs-dark"
                language="python"
                :diffEditor="false"
                original=""
                v-model:value="dataItem.body"
                width="100%"
                height="100%"
              />
            </div>
          </el-form-item>
        </div>
        <div class="form-block">
          <div class="sub-title">返回参数</div>
          <div class="el-form-item is-required asterisk-left">
            <div class="el-form-item__label">返回变量</div>
            <div class="el-form-item__content">
              <el-input
                v-model="item.value"
                class="params-input"
                placeholder="请输入返回变量"
                :key="index"
                v-for="(item, index) in returnParams"
              >
                <template #prepend>{{ index + 1 }}</template>
                <template #append>
                  <div @click="deleteReturnParams(index)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </div>
                </template>
              </el-input>
              <el-button type="primary" link @click="addReturnParams"
                >+ 添加参数</el-button
              >
            </div>
          </div>
        </div>
      </el-form>
    </el-drawer>

    <!-- 全屏 -->
    <el-dialog
      v-model="fullDialogVisible"
      title="编辑函数"
      :fullscreen="true"
      align-center
    >
      <div v-if="lazy" style="width: 100%; height: 800px">
        <MonacoEditor
          theme="vs-dark"
          language="python"
          :diffEditor="false"
          original=""
          v-model:value="dataItem.body"
          width="100%"
          height="100%"
        />
      </div>
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

.form-block {
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 4px;

  .sub-title {
    margin-bottom: 24px;
    font-weight: 500;
  }
}

.monacoEditor--item {
  position: relative;
  margin-bottom: 0;

  .fullscreen {
    position: absolute;
    top: -25px;
    right: 0;
    font-size: 18px;
    cursor: pointer;
  }
}

.params-input {
  margin-bottom: 8px;
}
</style>
