<script setup lang="ts">
import carts from "./carts.vue";
import addKm from "./addKm.vue";
import importKm from "./importKm.vue";
import { Search } from "@element-plus/icons-vue";
import { reactive, ref, onBeforeMount } from "vue";
import { cloneDeep } from "lodash";
import { ElMessageBox, ElMessage } from "element-plus";
import pdfImg from "@/assets/images/PDF.png";
import docImg from "@/assets/images/doc.png";
import excelImg from "@/assets/images/excel.png";
import txtImg from "@/assets/images/TXT.png";
import { convert_bytes } from "@/utils/common";
import {
  saveKb,
  queryKb,
  deleteKb,
  saveFiles,
  queryFiles,
  deleteFiles,
  updateFileStatus
} from "@/api/km";

defineOptions({
  name: "km"
});
const showRight = ref(false);
const addKmRef = ref();
const importKmRef = ref();
const currentKb = ref();
const kbList = ref([]);
const query = reactive({
  file_name: ""
});
const state = reactive({
  tableData: [],
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  totalCount: 0
});
// 导入知识点
const importExcel = () => {
  importKmRef.value.openDialog(currentKb.value);
};
// 删除知识点
const handleDel = (data: any) => {
  ElMessageBox.confirm("确认删除?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      deleteFiles({ id: data.id }).then(res => {
        if (res.code == 200) {
          ElMessage.success("删除成功");
          fetchKmList();
        } else {
          ElMessage.error(res.message || "删除失败");
        }
      });
    })
    .catch(() => {});
};
// 修改知识点的状态
const changeStatus = (data: any) => {
  updateFileStatus({ id: data.id, status: data.shelve_status }).then(res => {
    if (res.code == 200) {
      ElMessage.success("状态更新成功");
      fetchKmList();
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  });
};
// 新建知识库
const addKmList = () => {
  addKmRef.value.openDialog(null);
};
// 保存知识库
const saveKm = async (data: any) => {
  const actionData = cloneDeep(data);
  if (!actionData.id) {
    delete actionData.id;
  }
  const res = await saveKb(actionData);
  if (res.code == 200) {
    ElMessage.success("保存成功");
    queryKbList();
    addKmRef.value.closeDialog();
  } else {
    ElMessage.error(res.message || "保存失败");
  }
};
// 删除知识库
const handleDelKm = (id: string) => {
  deleteKb({ id }).then(res => {
    if (res.code == 200) {
      ElMessage.success("删除成功");
      queryKbList();
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  });
};
// 编辑知识库
const handleEditKm = data => {
  addKmRef.value.openDialog(data);
};
// 查询知识库列表
const queryKbList = async () => {
  await queryKb({
    page: 1, // 当前页数
    per_page: 99999, // 每页数量
    title: "" // 这个title不传，中台查不出数据，硬代码！！！
  }).then((res: any) => {
    if (res.code == 200) {
      kbList.value = res.data?.list || [];
    } else {
      ElMessage.error(res.message || "获取知识库失败");
    }
  });
};
// 保存导入知识库
const saveImportKm = (data: any) => {
  const dataForm = new FormData();
  dataForm.append("chunk_size", data.chunk_size + "");
  dataForm.append("overlap", data.overlap + "");
  dataForm.append("bytes", data.bytes + "");
  dataForm.append("kb_id", data.kb_id);
  dataForm.append("file", data.file);
  saveFiles(dataForm).then((res: any) => {
    console.log(res);
    if (res.code == 200) {
      fetchKmList();
    } else {
      ElMessage.error(res.message || "导入文档失败");
    }
  });
};
// 点击左侧卡片，搜索右侧知识库文件列表
const handleClickItem = data => {
  currentKb.value = data;
  showRight.value = true;
  query.file_name = "";
  fetchKmList();
};
// 查询某个知识库的知识列表
const fetchKmList = async () => {
  const res = await queryFiles({
    kb_id: currentKb.value.id, // 知识库 id
    file_name: query.file_name, // 搜索文档名称
    page: state.currentPage, // 当前页数
    per_page: state.pageSize // 每页数量
  });
  if (res.code == 200) {
    state.tableData = res.data?.list || [];
    state.totalCount = res.data?.count || 0;
    state.totalPages = res.data?.pages || 0;
  }
};
const handleSizeChange = (val: number) => {
  state.pageSize = val;
  fetchKmList();
};
const handleCurrentChange = (val: number) => {
  state.currentPage = val;
  fetchKmList();
};
onBeforeMount(() => {
  queryKbList();
});
</script>

<template>
  <div class="character">
    <p class="title-p">知识管理</p>
    <el-container>
      <el-aside class="left" width="300px">
        <div class="add-wrap">
          <div @click="addKmList" class="iconfont jiahao add-btn">
            新建知识库
          </div>
        </div>
        <div class="carts">
          <el-scrollbar height="calc(100vh - 80px)">
            <carts
              @delCart="handleDelKm"
              @editCart="handleEditKm"
              :kbList="kbList"
              @handleClickItem="handleClickItem"
            />
          </el-scrollbar>
        </div>
      </el-aside>
      <el-main class="elMain" v-show="showRight">
        <div class="top">
          <el-input
            style="width: 226px; margin-right: 10px"
            :suffix-icon="Search"
            v-model="query.file_name"
            @keyup.enter="fetchKmList"
            @blur="fetchKmList"
            placeholder="文档名称"
          />
          <el-button class="iconfont daoruwendang" @click="importExcel"
            >导入文档</el-button
          >
        </div>
        <!-- 知识库列表 -->
        <div class="cartList">
          <el-table :data="state.tableData" border style="width: 100%">
            <template #empty>
              <div style="display: flex; justify-content: center">
                <img src="@/assets/images/import.png" />
              </div>
              <p>当前暂无知识内容，请点击“导入文档”进行上传</p>
            </template>
            <el-table-column
              prop="file_name"
              label="文件名称"
              fixed="left"
              width="180"
              :show-overflow-tooltip="true"
            >
              <template #default="scope">
                <div class="pointer">
                  <div v-if="scope.row.status == 1">
                    <a :href="scope.row.file_download_url"
                      ><el-button link type="primary">{{
                        scope.row.file_name
                      }}</el-button></a
                    >
                  </div>
                  <div v-else>
                    {{ scope.row.file_name }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="文件状态" width="180">
              <template #default="scope">
                <div v-if="scope.row.status == 0" style="color: #6200ff">
                  解析中
                </div>
                <div v-if="scope.row.status == 1" style="color: #009336">
                  解析成功
                </div>
                <div v-if="scope.row.status == 2" style="color: #f00">
                  解析失败
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="shelve_status" label="上架状态">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.shelve_status"
                  :active-value="1"
                  :inactive-value="0"
                  style="
                    --el-switch-on-color: #409eff;
                    --el-switch-off-color: #dcdfe6;
                  "
                  @change="changeStatus(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="file_suffix" label="文档格式" width="100">
              <template #default="scope">
                <div class="flex align-center">
                  <div
                    v-if="scope.row.file_suffix == 'txt'"
                    class="flex align-center"
                  >
                    <el-image style="width: 20px; height: 20px" :src="txtImg" />
                  </div>
                  <div
                    v-if="scope.row.file_suffix == 'pdf'"
                    class="flex align-center"
                  >
                    <el-image style="width: 20px; height: 20px" :src="pdfImg" />
                  </div>
                  <div
                    v-if="
                      scope.row.file_suffix == 'xls' ||
                      scope.row.file_suffix == 'xlsx'
                    "
                    class="flex align-center"
                  >
                    <el-image
                      style="width: 20px; height: 20px"
                      :src="excelImg"
                    />
                  </div>
                  <div
                    v-if="
                      scope.row.file_suffix == 'doc' ||
                      scope.row.file_suffix == 'docx'
                    "
                    class="flex align-center"
                  >
                    <el-image style="width: 20px; height: 20px" :src="docImg" />
                  </div>
                  <div class="ml-5">
                    {{ scope.row.file_suffix }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="bytes" label="文档大小">
              <template #default="scope">
                <div>{{ convert_bytes(scope.row.bytes) }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="characters" label="字符数" />
            <el-table-column
              prop="create_datetime"
              label="上传时间"
              width="200"
            >
              <template #default="scope">
                <div>{{ scope.row.create_datetime.replace("T", " ") }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="operate" label="操作" fixed="right">
              <template #default="scope">
                <el-button type="primary" link @click="handleDel(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div class="page">
            <el-pagination
              v-model:current-page="state.currentPage"
              v-model:page-size="state.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :small="false"
              :disabled="false"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="state.totalCount"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-main>
      <div v-if="!showRight" class="empty-right">
        <div style="margin: 0 auto">
          <img src="@/assets/images/km.png" />
          <p>新建知识库，构建LLM文档智能应答新体验</p>
        </div>
      </div>
    </el-container>
    <addKm ref="addKmRef" @save="saveKm" />
    <importKm ref="importKmRef" @save="saveImportKm" />
  </div>
</template>

<style lang="scss" scoped>
.empty-right {
  display: flex;
  place-items: center center;
  width: 100%;
  text-align: center;

  img {
    display: inline-block;
  }

  p {
    font-size: 14px;
    color: #3d3d3d;
  }
}

.title-p {
  box-sizing: border-box;
  height: 56px;
  padding-left: 20px;
  font-size: 14px;
  font-weight: 600;
  line-height: 56px;
  color: #303133;
  text-align: left;
  letter-spacing: 0;
  border-bottom: 1px solid #e4e7ed;
}

.character {
  position: relative;
  z-index: 100;
  background-color: #fff;
  border-top: 1px solid#E4E7ED;
}

.left {
  width: 300px;
  min-height: calc(100vh - 78px);
  border-right: 1px solid #e4e7ed;
}

.add-wrap {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;

  .add-btn {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    gap: 8px;
    align-items: center;
    align-self: stretch;
    justify-content: center;
    padding: 5px 16px;
    font-size: 14px;
    color: #fff;
    cursor: pointer;
    background: #409eff;
    border-radius: 4px;
  }
}
// .carts {
//   max-height: 500px;
// }

.elMain {
  padding-top: 20px;
  background: rgb(250 250 250);

  .top {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 5px;

    .addBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 110px;
      height: 32px;
      font-size: 14px;
      font-weight: 500;
      color: #fff;
      cursor: pointer;
      background: #409eff;
      border-radius: 4px;
    }
  }

  .cartList {
    padding: 20px;
    margin-top: 16px;
    background: #fff;
    border-radius: 4px;
  }
}

.page {
  display: flex;
  justify-content: right;
  margin-top: 20px;
}

.daoruwendang {
  font-size: 14px;
  font-weight: normal;
  color: #303133;
}

.daoruwendang::before {
  margin-right: 4px;
}
</style>
