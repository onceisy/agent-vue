<script setup lang="ts">
import { getLogList } from "@/api/agent";
import logDetail from "./components/sessionDetail.vue";
import { onMounted, reactive, ref } from "vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";

const agentTemplateStore = useAgentTemplateHook();
defineOptions({
  name: "sessionLog"
});
const loading = ref(true);
const page = ref(1);
const size = ref(20);
const total_pages = ref(0);
const total_count = ref(0);
const tableData = ref<DataItem[]>([]);
const sourcArr = [
  { label: "全部", value: null },
  { label: "对话", value: 0 },
  { label: "辅助", value: 1 }
];

interface DataItem {
  entity_name: string;
  entity_desc: string;
  regex: string;
  create_datetime?: string;
  entity_id?: string;
}

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
// 获取当前日期
const currentDate = new Date();
// 计算七天前的日期
currentDate.setDate(currentDate.getDate() - 7);
const query = reactive({
  sid: "",
  source: null,
  time_range: [currentDate, new Date()]
});
const getDate = (date: any) => {
  // 获取年、月、日
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要+1，并且补零
  const day = String(date.getDate()).padStart(2, "0"); // 补零
  // 构建格式化后的日期字符串
  const formattedDate = year + "-" + month + "-" + day;
  return formattedDate;
};
const handeTableData = (data: any) => {
  data.forEach((item: any) => {
    item.source_name = sourcArr.find(i => i.value == item.source).label || "";
    item.billing = item.billing.toFixed(4);
  });
  return data;
};
const getList = async () => {
  if (!loading.value) loading.value = true;
  getLogList({
    page: page.value,
    size: size.value,
    sid: query.sid,
    source: query.source,
    agent_id: agentTemplateStore.getCurrentAgent.agent_id,
    start_time: query.time_range
      ? getDate(query.time_range[0]) + " 00:00:00"
      : "",
    end_time: query.time_range ? getDate(query.time_range[1]) + " 23:59:59" : ""
  }).then((res: any) => {
    if (res.code == 200) {
      tableData.value = handeTableData(res.data?.result || []);
      total_pages.value = res.data?.total_pages || 0;
      total_count.value = res.data?.total_count || 0;
    }
  });
  loading.value = false;
};
const logDetailRef = ref();
const handleDetail = async (row: any) => {
  console.log(row);
  logDetailRef.value.openDetail(row);
};
</script>

<template>
  <div class="account main-continer">
    <div class="title">
      <el-form
        ref="formRef"
        :model="query"
        label-position="left"
        style="display: flex"
      >
        <el-form-item label="会话ID">
          <el-input
            :clearable="true"
            v-model="query.sid"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="开始时间" class="margin-left--24">
          <el-date-picker
            v-model="query.time_range"
            type="daterange"
            range-separator="~"
            :clearable="false"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="应用场景" class="margin-left--24">
          <el-select v-model="query.source" placeholder="请选择">
            <el-option
              v-for="item in sourcArr"
              :value="item.value"
              :label="item.label"
              :key="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click.stop="getList">搜索</el-button>
    </div>
    <div class="account-content" v-loading="loading">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="sid" label="会话ID" />
        <el-table-column prop="agent_name" label="AGENT名称" />
        <el-table-column prop="source_name" label="应用场景" />
        <el-table-column prop="prompt_tokens" label="请求token" />
        <el-table-column prop="completion_tokens" label="响应token" />
        <el-table-column prop="total_tokens" label="token总数" />
        <el-table-column prop="billing" label="消费金额" />
        <el-table-column prop="start_time" label="开始时间" width="180" />
        <el-table-column prop="last_time" label="最近对话时间" width="180" />
        <el-table-column label="操作" :width="80" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleDetail(scope.row)"
              >详情</el-button
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
    <logDetail ref="logDetailRef" />
  </div>
</template>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
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

.margin-left--24 {
  margin-left: 24px;
}
</style>
