<script setup>
import useDragAndDrop from "./useDnD";

const { onDragStart } = useDragAndDrop();
const nodeList = [
  {
    label: "回复节点",
    iconfont: "huifujiedian",
    bgcolor: "#409EFF",
    type: "custom",
    flowType: "reply",
    tip: "根据策略回复消息给用户或者执行人工服务、按键、挂机等action",
    form: {
      name: "回复节点",
      strategy_type: "answer",
      keyboard_scene: "",
      cate: "3",
      direct_answer: "",
      skill_num: "",
      polish_prompt: "",
      llm_prompt: "",
      tool_llm: "minimax",
      kbs: []
    }
  },
  {
    label: "赋值节点",
    iconfont: "fuzhijiedian",
    bgcolor: "#67C23A",
    type: "custom",
    flowType: "variable",
    tip: "通过赋值能力采集信息",
    form: []
  },
  {
    label: "函数节点",
    iconfont: "hanshujiedian",
    bgcolor: "#E6A23C",
    type: "custom",
    flowType: "func",
    tip: "编写代码，处理信息",
    form: {
      name: "函数节点",
      function_name: "",
      func_alias: "",
      parameter: []
    }
  },
  {
    label: "条件判断",
    iconfont: "tiaojianpanduan",
    bgcolor: "#1094A3",
    type: "custom",
    flowType: "condition",
    tip: "通过条件规则，判断分支",
    form: []
  },
  {
    label: "LLM节点",
    iconfont: "LLMjiedian",
    bgcolor: "#6F25B8",
    type: "custom",
    flowType: "llm",
    tip: "调用大语言模型，进行内容处理",
    form: {
      name: "LLM节点",
      llm_prompt: "",
      tool_llm: ""
    }
  },
  {
    label: "引导结束",
    iconfont: "yindaojieshu",
    bgcolor: "#F56C6C",
    type: "output",
    flowType: "end"
  },
  {
    label: "下一环节",
    iconfont: "xiayihuanjie",
    bgcolor: "#FACA0A",
    type: "output",
    flowType: "next"
  }
];
defineProps({
  direction: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <aside>
    <div class="nodes">
      <div
        v-for="(item, index) in nodeList"
        :key="index"
        class="vue-flow__node-default node-item"
        :class="direction ? '' : 'no-lable'"
        :draggable="true"
        :name="item.label"
        :title="item.label"
        @dragstart="onDragStart($event, item)"
      >
        <span
          class="iconfont"
          :class="item.iconfont"
          :style="[`background-color:${item.bgcolor}`]"
        />
        {{ direction ? item.label : "" }}
      </div>
    </div>
  </aside>
</template>
<style lang="scss" scoped>
.dndflow aside {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-self: stretch;
  padding: 12px 30px 12px 12px;
  overflow: auto;
  background: #fff;
}

.dndflow aside .nodes > * {
  z-index: 4;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  padding: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #3d3d3d;
  background: #fff;
  border: 1px solid #e4e7ed;
}

.dndflow aside .description {
  margin-bottom: 10px;
}

.dndflow .vue-flow-wrapper {
  flex-grow: 1;
  height: 100%;
}

.node-item {
  cursor: grab;

  .iconfont {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: #fff;
    border-radius: 4px;
  }
}

.node-item:hover {
  background: #f6f6f7;
}

.no-lable {
  width: 52px;
}
</style>
