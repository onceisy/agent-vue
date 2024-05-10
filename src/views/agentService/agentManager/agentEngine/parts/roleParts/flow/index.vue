<script setup>
import { ref, onBeforeMount, onBeforeUnmount, onMounted, watch } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import Sidebar from "./sideBar.vue";
import { Background } from "@vue-flow/additional-components";
import CustomNode from "./customNode.vue";
import funcForm from "./flowForm/funcForm.vue";
import LLMForm from "./flowForm/LLMForm.vue";
import replyForm from "./flowForm/replyForm.vue";
import variableForm from "./flowForm/variableForm.vue";
import conditionForm from "./flowForm/conditionForm.vue";
import useDragAndDrop from "./useDnD";
import { generateUUID, getAppId } from "@/utils/common";
import { queryFunctionList, getAiEntity } from "@/api/agent";
import { queryKb } from "@/api/km";
import { saveFlow, upFlow } from "@/api/agent";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { cloneDeep } from "lodash";
import { Close } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
const agentTemplateStore = useAgentTemplateHook();
const {
  onConnect,
  addEdges,
  toObject,
  updateNode,
  removeEdges,
  updateEdge,
  findNode
} = useVueFlow();
let interTimer = null;
let showIndex = 0;
const formRef = ref(null);
const showTip = ref(false);
const kbList = ref([]);
const funcList = ref([]);
const aiEntityList = ref([]);
const flowData = ref({});
const emit = defineEmits(["goBack"]);
const startId = `start_${generateUUID()}`;
const initialNodes = [
  {
    id: startId,
    selectable: false, // 设置此参数后，开始节点不允许删除
    label: "开始",
    position: { x: 50, y: 50 },
    type: "input",
    flowType: "start",
    data: {
      flowType: "start"
    }
  }
];
const direction = ref(true); // 展开或者收起方向按钮，前端不记忆，每次重置
const nodes = ref(initialNodes); // 节点
const edges = ref([]); // 线条
// 当前双击点击的节点数据
const currentNode = ref({});
// 当前双击的线的数据
const currentEdge = ref({});
const drawerVisible = ref(false);
const props = defineProps({
  propsFlowData: {
    type: Object,
    default: () => ({})
  },
  pid: {
    type: String,
    default: ""
  },
  isSenesFlow: {
    type: Boolean,
    default: false
  }
});
watch(
  () => props.propsFlowData.uid,
  () => {
    const data = props.propsFlowData;
    flowData.value.name = data.name;
    flowData.value.uid = data.uid;
    flowData.value.edit_flow_datetime = data.edit_flow_datetime;
    flowData.value.edit_flow_json = data.edit_flow_json;
    flowData.value.up_flow_datetime = data.up_flow_datetime;
    flowData.value.up_flow_json = data.up_flow_json;
    if (data.edit_flow_json) {
      const jsonData = JSON.parse(data.edit_flow_json);
      nodes.value = jsonData.nodes;
      edges.value = jsonData.edges;
    }
    if (flowData.value.edit_flow_datetime !== flowData.value.up_flow_datetime) {
      showTip.value = true;
    } else {
      showTip.value = false;
    }
  },
  {
    immediate: true
  }
);
// 处理节点是否允许被连接
const onConnectNode = connection => {
  const source = connection.source.split("_")[0];
  const target = connection.target.split("_")[0];
  const allData = toObject();
  // reply variable func condition llm end next
  allData.edges.forEach(item => {
    if (
      source == "start" &&
      ["next", "end"].includes(target) &&
      connection.target === item.target
    ) {
      // 开始节点不能连接下一环节、结束节点
      removeEdges([item.id]);
    } else if (
      source == "reply" &&
      ["reply", "variable", "func", "condition"].includes(target) &&
      connection.target === item.target
    ) {
      // 回复节点不能连接回复节点、赋值节点、函数节点、条件节点
      removeEdges([item.id]);
    } else if (
      source == "variable" &&
      ["variable", "next", "end"].includes(target) &&
      connection.target === item.target
    ) {
      // 赋值节点不能连接赋值节点、下一环节、结束节点
      removeEdges([item.id]);
    } else if (
      source == "func" &&
      ["func", "end"].includes(target) &&
      connection.target === item.target
    ) {
      // 函数节点不能连接函数节点、结束节点
      removeEdges([item.id]);
    } else if (
      source == "condition" &&
      ["condition", "end"].includes(target) &&
      connection.target === item.target
    ) {
      // 条件节点不能连接条件节点、结束节点
      removeEdges([item.id]);
    } else if (
      source == "llm" &&
      ["llm", "next", "end"].includes(target) &&
      connection.target === item.target
    ) {
      // llm节点不能连接llm节点、下一环节、结束节点
      removeEdges([item.id]);
    }
    if (
      source.indexOf("condition") > -1 &&
      connection.target === item.target &&
      !item.label
    ) {
      // 如果是上游是条件节点，并且label没有值
      const newEdge = item;
      newEdge.label = "双击编辑条件";
      updateEdge(item, newEdge);
    }
  });
};
// 点击发布的时候，验证每个节点的表单必填项是否填写
const handelFormRule = (data, flowType) => {
  const form = data.form;
  let message = "";
  if (flowType == "func" && !form.function_name) {
    // 函数节点
    message += `<p style="line-height:1.2">请选择【${form.name}】的函数服务</p>`;
  } else if (flowType == "llm") {
    // llm节点
    if (!form.tool_llm) {
      message += `<p style="line-height:1.2">请选择【${form.name}】的模型</p>`;
    }
    if (!form.llm_prompt) {
      message += `<p style="line-height:1.2">请填写【${form.name}】的提示词</p>`;
    }
  } else if (
    flowType == "variable" &&
    ((form && form.length <= 0) || (form.form && form.form.length <= 0))
  ) {
    // 赋值节点
    message += `<p style="line-height:1.2">【${data.label}】中没有变量赋值</p>`;
  } else if (flowType == "reply") {
    // 回复节点
    if (form.cate == "1" && !form.llm_prompt) {
      message += `<p style="line-height:1.2">请填写【${form.name}】的回答提示词</p>`;
    } else if (form.cate == "3" && !form.direct_answer) {
      message += `<p style="line-height:1.2">请填写【${form.name}】的话术内容</p>`;
    } else if (form.cate == "4" && !form.polish_prompt) {
      message += `<p style="line-height:1.2">请填写【${form.name}】的润色内容</p>`;
    }
  } else if (flowType == "condition" && form) {
    // 条件节点
    if (form.length <= 0) {
      message += `<p style="line-height:1.2"">【${data.label}】中没有条件</p>`;
    } else {
      form.forEach(item => {
        if (
          item.rule &&
          item.rule.cond_group.length <= 0 &&
          item.rule_type == "custom"
        ) {
          // 自定义的类型，才判断是否有条件
          message += `<p style="line-height:1.2"">【${item.name}】中没有自定义条件</p>`;
        }
      });
    }
  }
  return message;
};
// 保存前整理表单信息
const handleFlowData = type => {
  const allData = toObject();
  const lastData = [];
  let upFlag = true;
  let message = "";
  allData.nodes.forEach(item => {
    item.inputs = []; // 输入
    item.outputs = []; // 输出
    item.flowType = item.data.flowType;
    const sourceObj = allData.edges.filter(edge => edge.source == item.id);
    const targetObj = allData.edges.filter(edge => edge.target == item.id);
    if (!["end", "next"].includes(item.data.flowType)) {
      // 结束引导和下一环节没有输出
      if (sourceObj && sourceObj.length > 0) {
        if (item.data.flowType === "condition") {
          // 条件节点的key对应的是下一个分支的数据
          sourceObj.forEach(sourceItem => {
            item.outputs.push({
              key: sourceItem.data.form ? sourceItem.data.form.id : "",
              targets: [{ id: sourceItem.target }]
            });
          });
        } else {
          item.outputs.push({
            key: "next",
            targets: [{ id: sourceObj[0].target }]
          });
        }
      }
    }
    if (!["start", "end", "next"].includes(item.data.flowType)) {
      // 开始节点 和 结束引导和下一环节没有输入,
      if (targetObj && targetObj.length > 0) {
        if (item.data.flowType === "condition") {
          // 条件节点的key对应的是下一个分支的数据
          if (sourceObj && sourceObj.length > 0) {
            const formArr = [];
            item.data.form.forEach(formItem => {
              formArr.push({
                ...{ value: formItem },
                ...{ key: formItem.id }
              });
            });
            item.inputs.push({
              connected: true,
              value: formArr
            });
          }
        } else if (item.data.flowType === "variable") {
          item.inputs.push({
            connected: true,
            name: item.data.form.name,
            value: item.data.form.form || []
          });
        } else {
          item.inputs.push({ connected: true, value: item.data.form || {} });
        }
      }
    }
    if (
      targetObj &&
      targetObj.length <= 0 &&
      sourceObj &&
      sourceObj.length <= 0
    ) {
      // 节点上下游都没连接，为独立节点
      upFlag = false;
    }
    lastData.push(item);
    message += handelFormRule(item.data, item.data.flowType);
  });
  allData.nodes = lastData;
  if (type === "up" && !upFlag) {
    // 发布的时候要验证下是否可以发布，保存不验证
    ElMessage.error("流程中存在未连线的节点，请检查");
    return false;
  }
  if (type === "up" && message) {
    ElMessage({
      dangerouslyUseHTMLString: true,
      message: message,
      type: "error"
    });
    return false;
  }
  return allData;
};
// 10分钟自动保存一次画布
const autoSaveFlow = () => {
  const allData = handleFlowData("save"); // 获取处理完成的画布
  const actionData = {
    uid: flowData.value.uid,
    agent_id: agentTemplateStore.getCurrentAgent.agent_id,
    pid: !props.isSenesFlow ? props.pid : "",
    edit_flow_json: JSON.stringify(allData)
  };
  saveFlow(actionData).then(res => {
    if (res.code == 200 && res.data) {
      flowData.value.edit_flow_datetime = res.data.edit_flow_datetime;
      flowData.value.edit_flow_json = res.data.edit_flow_json;
      flowData.value.up_flow_datetime = res.data.up_flow_datetime;
      flowData.value.up_flow_json = res.data.up_flow_json;
      if (
        flowData.value.edit_flow_datetime !== flowData.value.up_flow_datetime
      ) {
        showTip.value = true;
      } else {
        showTip.value = false;
      }
    }
  });
};
// 发布流程画图
const releaseFlow = () => {
  const allData = handleFlowData("up"); // 获取处理完成的画布
  if (!allData) {
    return false;
  }
  const actionData = {
    uid: flowData.value.uid,
    agent_id: agentTemplateStore.getCurrentAgent.agent_id,
    pid: !props.isSenesFlow ? props.pid : "",
    up_flow_json: JSON.stringify(allData)
  };
  upFlow(actionData)
    .then(res => {
      if (res.code == 200 && res.data) {
        flowData.value.edit_flow_datetime = res.data.edit_flow_datetime;
        flowData.value.edit_flow_json = res.data.edit_flow_json;
        flowData.value.up_flow_datetime = res.data.up_flow_datetime;
        flowData.value.up_flow_json = res.data.up_flow_json;
        showTip.value = false;
        ElMessage.success("发布成功");
      } else {
        ElMessage.error(res.messsage || "发布失败");
      }
    })
    .catch(() => {
      ElMessage.error("发布失败");
    });
};
// 关闭提示
const closeTip = () => {
  showTip.value = false;
  showIndex++;
};
// 返回
const goBack = () => {
  autoSaveFlow(); // 点击返回的时候自动保存一次画布
  emit("goBack");
};
// 双击打开对应节点的弹窗
const editNode = node => {
  currentNode.value = node.node || {};
  if (
    !["end", "next", "start", "condition"].includes(
      currentNode.value.data.flowType
    )
  ) {
    // 结束节点，下一节点，开始节点没有弹窗
    drawerVisible.value = true;
  }
};
// 双击条件节点的线
const edgeDoubleClick = edge => {
  currentEdge.value = edge.edge;
  if (edge.edge.source.indexOf("condition") > -1) {
    // 如果是上游是条件节点，双击打开弹窗编辑条件
    const nodeData = findNode(edge.edge.source);
    currentNode.value = nodeData;
    drawerVisible.value = true;
  }
};
// 删除条件节点的线时，也要删除节点上绑定的数据
const onEdgesChange = data => {
  const idArr = [];
  data.forEach(item => {
    if (item.type === "remove" && item.source.indexOf("condition") > -1) {
      // 删除线 && 上游是条件节点
      const allData = toObject();
      allData.edges.forEach(edgesItem => {
        if (edgesItem.source === item.source) {
          // 先把当前条件节点没被删除的数据挑选出来
          if (edgesItem.data.form) {
            idArr.push(edgesItem.data.form.id);
          }
        }
      });
      const nodeData = findNode(item.source);
      if (
        nodeData.data &&
        nodeData.data.form &&
        nodeData.data.form.length > 0
      ) {
        const newArr = [];
        nodeData.data.form.forEach(forItem => {
          if (idArr.includes(forItem.id)) {
            newArr.push(forItem);
          }
        });
        nodeData.data.form = newArr;
        updateNode(item.source, { data: nodeData.data });
      }
    }
  });
};
// 点击表单弹窗的取消
const cancel = () => {
  // formRef.value.resetFields();
  drawerVisible.value = false;
};
// 更新当前节点 || 更新条件节点中某条线上面的data数据
const updateCurrentNodeOrEdge = () => {
  const form = formRef.value.getForm();
  let isEdit = true;
  const flowType = currentNode.value.data.flowType;
  if (
    flowType == "condition" &&
    Object.keys(currentEdge.value.data).length <= 0
  ) {
    // 没设置过，说明是新增，创建条件的id，用于后面编辑数据更新
    form.id = `condition_${generateUUID()}`;
    isEdit = false;
  }
  const propsData = {
    label: flowType == "condition" ? "条件判断" : form.name,
    iconfont: currentNode.value.data.iconfont,
    bgcolor: currentNode.value.data.bgcolor,
    type: currentNode.value.data.type,
    flowType: flowType
  };
  if (flowType == "condition") {
    // 条件节点是更新线上的数据,同时也要更新node的data
    const newEdge = currentEdge.value;
    newEdge.label = form.name;
    propsData.form = form;
    newEdge.data = cloneDeep(propsData);
    updateEdge(currentEdge.value, newEdge);
    if (!isEdit) {
      // 新增
      const newForm = cloneDeep(currentNode.value.data.form);
      newForm.push(form);
      propsData.form = newForm;
      updateNode(currentNode.value.id, { data: propsData });
    } else {
      // 编辑
      const newForm = cloneDeep(currentNode.value.data.form);
      const arr = [];
      newForm.forEach(item => {
        if (item.id == form.id) {
          item = form;
        }
        arr.push(item);
      });
      propsData.form = arr;
      updateNode(currentNode.value.id, { data: propsData });
    }
  } else {
    propsData.form = form;
    updateNode(currentNode.value.id, { label: form.name, data: propsData });
  }
};
// 保存某个节点
const saveNodeForm = () => {
  formRef.value.validate().then(res => {
    if (res) {
      // 表单验证通过
      updateCurrentNodeOrEdge();
      drawerVisible.value = false;
    }
  });
};
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();
onConnect(addEdges);
// 查询知识库列表
const queryKbList = async () => {
  await queryKb({
    page: 1, // 当前页数
    per_page: 99999, // 每页数量
    title: "" // 这个title不传，中台查不出数据，硬代码！！！
  }).then(res => {
    if (res.code == 200) {
      kbList.value = res.data?.list || [];
    }
  });
};
// 查询函数服务的列表
const queryFuncList = () => {
  queryFunctionList({
    page: "1",
    size: "10000",
    otherName: "",
    agent_id: agentTemplateStore.getCurrentAgent.agent_id,
    bot_id: getAppId()
  }).then(res => {
    if (res.code == 200) {
      funcList.value = res.data?.result || [];
    }
  });
};
// 查询实体管理列表数据
const queryAiEntity = () => {
  getAiEntity({
    page: 1,
    size: 10000,
    agent_id: agentTemplateStore.getCurrentAgent.agent_id
  }).then(res => {
    if (res.code == 200) {
      aiEntityList.value = res.data?.result || [];
    }
  });
};
onBeforeMount(() => {
  queryKbList();
  queryFuncList();
  queryAiEntity();
});
onMounted(() => {
  if (interTimer === null) {
    // 每隔10分钟自动保存一次画布
    interTimer = setInterval(() => autoSaveFlow(), 600000);
    // interTimer = setInterval(() => autoSaveFlow(), 30000);
  }
});
onBeforeUnmount(() => {
  // 组件销毁之前清除定时器
  clearInterval(interTimer);
});
</script>

<template>
  <div class="bpmn-box-wrap">
    <div class="top-box">
      <div class="top-title">
        <span class="iconfont fanhui" @click="goBack" />
        <span class="agent-name" @click="goBack">{{
          flowData.name || "未知名称"
        }}</span>
        <el-button type="primary" class="save-btn" @click.stop="releaseFlow"
          >发布</el-button
        >
      </div>

      <div class="status-box">
        <span class="status-span mg-r-8"
          ><span
            class="iconfont"
            :class="flowData.up_flow_datetime ? 'wancheng-mian' : 'quxiao-mian'"
          />{{ flowData.up_flow_datetime ? "已发布" : "未发布" }}</span
        >
        <span class="mg-r-8 gray-bg"
          >最近发布时间：{{ flowData.up_flow_datetime || "" }}</span
        >
        <span class="mg-r-8 gray-bg"
          >自动保存：{{
            (flowData.edit_flow_datetime &&
              flowData.edit_flow_datetime.split(" ")[1]) ||
            ""
          }}</span
        >
      </div>
    </div>
    <div class="dndflow" @drop="onDrop">
      <Sidebar :direction="direction" />
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @node-double-click="editNode"
        @edge-double-click="edgeDoubleClick"
        @connect="onConnectNode"
        @edges-change="onEdgesChange"
      >
        <div
          style="width: 100%; height: 100%"
          :style="{
            backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
            transition: 'background-color 0.2s ease'
          }"
        >
          <span
            class="direction-btn iconfont"
            :class="direction ? 'fangxiang-zuo-xian' : 'fangxiang-you-xian'"
            @click="direction = !direction"
          />
          <!-- 提示框只提示一次，点击X之后不再提醒 -->
          <div class="flow-tip" v-show="showTip && showIndex < 1">
            <span class="iconfont jinggao" />
            您已经重新编辑了流程。在其重新发布之前，Agent使用的仍然是之前发布的版本。
            <el-icon @click="closeTip"><Close /></el-icon>
          </div>
          <Background :size="2" :gap="20" pattern-color="#BDBDBD" />
        </div>
        <template #node-input="slotProps">
          <CustomNode :slotProps="slotProps" />
        </template>
        <template #node-custom="slotProps">
          <CustomNode :slotProps="slotProps" />
        </template>
        <template #node-output="slotProps">
          <CustomNode :slotProps="slotProps" />
        </template>
      </VueFlow>
    </div>
    <el-drawer
      v-model="drawerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      direction="rtl"
      append-to-body
      :show-close="false"
      :destroy-on-close="true"
      class="custom-drawer"
      :size="
        currentNode.data && currentNode.data.flowType == 'condition'
          ? '800'
          : '600'
      "
    >
      <template #header>
        <div class="flex justify-between items-center">
          <div class="title-top">
            <span
              class="iconfont"
              :class="currentNode.data?.iconfont"
              :style="[`background-color:${currentNode.data?.bgcolor}`]"
            />
            <span class="title-text">{{ currentNode.data?.label }}</span>
            <p>{{ currentNode.data?.tip || "" }}</p>
          </div>
          <div>
            <el-button @click="cancel">取消</el-button>
            <el-button type="primary" @click="saveNodeForm">保存</el-button>
          </div>
        </div>
      </template>
      <template #default>
        <funcForm
          :form="currentNode.data?.form"
          :id="currentNode.id"
          :funcList="funcList"
          ref="formRef"
          v-if="currentNode.data?.flowType == 'func'"
        />
        <LLMForm
          :form="currentNode.data?.form"
          :id="currentNode.id"
          ref="formRef"
          v-if="currentNode.data?.flowType == 'llm'"
        />
        <replyForm
          :form="currentNode.data?.form"
          :id="currentNode.id"
          :kbList="kbList"
          ref="formRef"
          v-if="currentNode.data?.flowType == 'reply'"
        />
        <variableForm
          :form="currentNode.data?.form"
          :id="currentNode.id"
          :aiEntityList="aiEntityList"
          ref="formRef"
          v-if="currentNode.data?.flowType == 'variable'"
        />
        <conditionForm
          :form="currentEdge.data?.form"
          :id="currentNode.id"
          ref="formRef"
          v-if="currentNode.data?.flowType == 'condition'"
        />
      </template>
    </el-drawer>
  </div>
</template>
<style lang="scss" scoped>
.bpmn-box-wrap.main-content {
  margin: 0;
}

.bpmn-box-wrap {
  position: fixed;
  inset: 48px 0 0;
  z-index: 1000;
  padding: 24px;
  background: #f4f5f7;

  .top-box {
    padding: 14px 16px;
    background: #fff;
    border-radius: 4px;

    .top-title {
      margin-bottom: 8px;
      cursor: pointer;

      .iconfont {
        margin-right: 16px;
        font-weight: 600;
        color: #909399;
      }
    }

    .status-box {
      font-size: 14px;
      font-weight: normal;
      color: #3d3d3d;

      .status-span {
        box-sizing: border-box;
        display: inline-block;
        padding: 0 2px;
        font-size: 14px;
        font-weight: normal;
        line-height: 22px;
        color: #3d3d3d;
        text-align: center;
        background: #f6f6f7;
        border: 1px solid #e4e7ed;
        border-radius: 4px;

        .iconfont {
          margin-right: 2px;
          color: #67c23a;
        }

        .quxiao-mian {
          color: #909399;
        }
      }

      .gray-bg {
        box-sizing: border-box;
        padding: 2px 4px;
        background: #f6f6f7;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
      }

      .mg-r-8 {
        margin-right: 8px;
      }
    }

    .agent-name {
      display: inline-block;
      max-width: 80%;
      overflow: hidden;
      font-size: 16px;
      font-weight: 600;
      line-height: 22px;
      color: #303133;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
    }

    .save-btn {
      float: right;
      margin-top: 2px;
    }
  }
}

.dndflow {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 134px);
}

.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}

.title-top {
  .iconfont {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-right: 8px;
    color: #fff;
    border-radius: 4px;
  }

  .title-text {
    font-size: 16px;
    font-weight: 500;
    line-height: 26px;
  }

  p {
    margin-top: 2px;
    font-size: 14px;
    font-weight: normal;
    line-height: 26px;
    color: #606266;
  }
}

.flow-tip {
  position: absolute;
  top: 20px;
  left: 2%;
  z-index: 10000;
  width: 96%;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  background: #fcf6ec;
  border-left: 4px solid #f2d09d;
  border-radius: 2px;

  .iconfont {
    color: #e79d2d;
  }

  .el-icon {
    float: right;
    margin-top: 5px;
    cursor: pointer;
  }
}

.direction-btn {
  position: absolute;
  top: 40%;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 32px;
  cursor: pointer;
  background: #fff;
  border-radius: 0 4px 4px 0;
}
</style>
