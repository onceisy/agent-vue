<script setup>
import { Position, Handle, useVueFlow, useNodesData } from "@vue-flow/core";
const { addNodes, removeNodes } = useVueFlow();
import { generateUUID } from "@/utils/common";
import { ElMessageBox } from "element-plus";

// props were passed from the slot using `v-bind="slotProps"`
const props = defineProps({
  slotProps: Object,
  defalut: () => {
    return {};
  }
});
const nodesData = useNodesData(() => props.slotProps.id);
// 复制节点
const copyNode = data => {
  const newNode = {
    id: `${data.data.flowType}_${generateUUID()}`,
    type: data.type,
    position: {
      x: data.position.x,
      y: data.position.y + 100,
      z: data.position.z
    },
    label: data.label,
    data: data.data
  };
  addNodes(newNode);
};
// 删除节点
const deleteNode = data => {
  ElMessageBox.confirm("确认删除该节点?", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      removeNodes(data);
    })
    .catch(() => {});
};
// 匹配回复类型
const filterCateName = cate => {
  const catMap = {
    1: "LLM回答",
    3: "固定话术",
    4: "润色回复",
    5: "人工服务",
    6: "按键服务",
    7: "挂机服务",
    8: "知识库回答"
  };
  return catMap[cate] || "";
};
// 根据选择的回复类型，匹配展示的内容
const filterCon = form => {
  if (form.cate == 1) {
    return form.llm_prompt;
  } else if (form.cate == 3) {
    return form.direct_answer;
  } else if (form.cate == 4) {
    return form.polish_prompt;
  } else if (form.cate == 5) {
    return form.skill_num;
  } else if (form.cate == 6) {
    return form.keyboard_scene;
  }
};
</script>

<template>
  <div
    class="custom-node"
    :class="['input', 'output'].includes(slotProps.type) ? 'input-node' : ''"
  >
    <Handle
      type="target"
      v-if="slotProps.type !== 'input'"
      :position="Position.Left"
    />
    <div class="node-div">
      <span
        class="iconfont node-icon"
        :class="slotProps.type == 'input' ? 'kaishi' : nodesData.data.iconfont"
        :style="[`background-color:${nodesData.data.bgcolor}`]"
      />
      {{ nodesData.data.label || slotProps.label }}
      <el-dropdown
        style="float: right; margin-top: 4px"
        v-if="!['input', 'output'].includes(slotProps.type)"
      >
        <span class="el-dropdown-link">
          <span class="iconfont gengduo-heng" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="copyNode(slotProps)"
              >复制</el-dropdown-item
            >
            <el-dropdown-item @click="deleteNode(slotProps)"
              >删除</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div
        class="filter-box"
        v-if="!['input', 'output'].includes(slotProps.type)"
      >
        <div
          :title="nodesData.data.form.llm_prompt"
          v-if="
            nodesData.data.flowType === 'llm' && nodesData.data.form.llm_prompt
          "
          class="text-div"
        >
          {{ nodesData.data.form.llm_prompt }}
        </div>
        <div
          :title="nodesData.data.form.func_alias"
          v-if="
            nodesData.data.flowType === 'func' && nodesData.data.form.func_alias
          "
          class="text-div"
        >
          {{ nodesData.data.form.func_alias }}
        </div>
        <div
          v-if="
            nodesData.data.flowType === 'variable' &&
            nodesData.data.form.form &&
            nodesData.data.form.form.length > 0
          "
          class="text-div"
        >
          <div
            class="var-item"
            :title="item.var_name"
            v-for="(item, index) in nodesData.data.form.form"
            :key="index"
          >
            {{ item.var_name }}
          </div>
        </div>
        <div v-if="nodesData.data.flowType === 'reply'" class="text-div">
          <div class="tag-div">
            <el-tag size="large" style="margin-right: 10px">{{
              nodesData.data.form.strategy_type === "action" ? "action" : "回复"
            }}</el-tag>
            <el-tag size="large">{{
              filterCateName(nodesData.data.form.cate)
            }}</el-tag>
          </div>
          <div class="con-div" :title="filterCon(nodesData.data.form)">
            {{ filterCon(nodesData.data.form) }}
          </div>
        </div>
        <!-- <div v-if="nodesData.data.flowType === 'condition'" class="text-div">
          <div
            class="condition-item"
            :title="item.value.name"
            v-for="(item, index) in nodesData.data.form.form"
            :key="index"
          >
            {{ item.value.name }}
          </div>
        </div> -->
      </div>
    </div>
    <Handle
      type="source"
      v-if="slotProps.type !== 'output'"
      :position="Position.Right"
    />
  </div>
</template>
<style lang="scss" scoped>
.custom-node {
  width: 200px;
  padding: 12px;
  font-size: 14px;
  background: #fff;
  border-radius: 6px;

  .node-div .node-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 14px;
    color: #fff;
    border-radius: 4px;
  }

  .filter-box {
    font-size: 12px;
    color: #303133;
    background: #f6f6f7;
    border-radius: 4px;

    .text-div {
      max-width: 15em;
      padding: 8px 12px;
      margin-top: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      .var-item,
      .condition-item {
        max-width: 15em;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .condition-item {
        padding: 8px 12px;
        margin-bottom: 10px;
        background: #f6f6f7;
        border-radius: 4px;
      }

      .condition-item:last-child,
      .var-item:last-child {
        margin-bottom: 0;
      }
    }

    .con-div {
      display: -webkit-box;
      margin-top: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

.tuodong-shu {
  font-size: 14px;
}

.input-node {
  width: auto;
  height: 26px;
  min-height: auto;
  padding: 0;

  .node-icon.kaishi {
    font-size: 16px;
    color: #909399;
  }
}
</style>
<style lang="scss">
.vue-flow__node-input {
  width: 92px !important;
  padding: 10px 10px 10px 2px !important;
}

.vue-flow__node-output {
  width: 110px !important;
}

.vue-flow__node.selected {
  border: 1px dashed #409eff !important;
  border-radius: 4px !important;
}

.vue-flow__node {
  border: 1px solid #e4e7ed !important;
}

.vue-flow__node-default .vue-flow__handle,
.vue-flow__node-input .vue-flow__handle,
.vue-flow__node-output .vue-flow__handle,
.vue-flow__node-custom .vue-flow__handle {
  width: 10px !important;
  height: 10px !important;
  background: #fff !important;
  border: 3px solid #409eff !important;
}
</style>
