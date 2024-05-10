<template>
  <div class="config">
    <p class="tip">
      <span
        class="iconfont jinggao"
      />适用于Agent引导用户完成事项的业务，例如：回访、贷款信审；Agent将按照环节的顺序依次完成所有的待办事项。
    </p>
    <div class="bg-white rounded">
      <p class="title-p">静默主动引导</p>
      <div>
        当用户静默不回复，超过
        <el-input-number
          v-model="state.initForm.guidance_interval"
          @blur="blurAction"
          :min="5"
          :max="300"
        />
        秒后主动触发主流程
      </div>
    </div>
    <div class="bg-white rounded">
      <p class="title-p">主动环节</p>
      <div class="cart-wrap">
        <p v-if="state.moveList.length <= 0">
          暂无主动环节，请在角色场景中开启。
        </p>
        <div class="guidace-draggable">
          <div class="cart-item" v-for="item in state.moveList" :key="item.uid">
            <div class="iconfont tuodong-shu" />
            <div class="cart-num">{{ item.guidance_sort || "" }}</div>
            <div class="cart-name">{{ item.name }}</div>
            <div class="cart-memo">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from "vue";
import Sortable from "sortablejs";
import { cloneDeep } from "lodash";
import { saveGuidance, queryGuidanceList, guidanceSort } from "@/api/agent";
import { ElMessage } from "element-plus";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
const agentTemplateStore = useAgentTemplateHook();

const state = reactive({
  initForm: {
    guidance_interval: 10
  },
  moveList: []
});

const initData = () => {
  const { guidance_interval } = agentTemplateStore.currentAgent as any;
  state.initForm.guidance_interval = guidance_interval || 10;
};
const blurAction = () => {
  saveGuidance({
    guidance_interval: state.initForm.guidance_interval,
    agent_id: agentTemplateStore.getCurrentAgent.agent_id
  })
    .then(res => {
      if (res.code == 200) {
        ElMessage.success("保存成功");
      } else {
        ElMessage.error(res.message || "保存失败！");
      }
    })
    .catch(() => {
      ElMessage.error("保存失败！");
    });
};
const getGuidanceInfo = () => {
  queryGuidanceList({ agent_id: agentTemplateStore.getCurrentAgent.agent_id })
    .then(res => {
      if (res.code == 200) {
        state.moveList = res.data || [];
      } else {
        ElMessage.error(res.message || "查询主动引导信息失败");
      }
    })
    .catch(() => {
      ElMessage.error("查询主动引导信息失败");
    });
};
// 列表拖拽
function initListDrag() {
  // 要拖拽元素的父容器
  const tbody: HTMLElement = document.querySelector(".guidace-draggable");
  Sortable.create(tbody, {
    //  可被拖拽的子元素
    draggable: ".guidace-draggable .cart-item",
    onEnd({ newIndex, oldIndex }) {
      if (newIndex === oldIndex) {
        return;
      }
      const newArr = cloneDeep(state.moveList);
      const currRow = newArr.splice(oldIndex, 1)[0];
      newArr.splice(newIndex, 0, currRow);
      guidanceSort({
        agent_id: agentTemplateStore.getCurrentAgent.agent_id,
        data: newArr
      }).then(res => {
        if (res.code == 200) {
          getGuidanceInfo();
        }
      });
    }
  });
}

onMounted(() => {
  initListDrag();
  getGuidanceInfo();
  initData();
});
</script>

<style lang="scss" scoped>
.config {
  margin-top: 16px;
  font-size: 14px;
  color: #303133;

  .bg-white {
    padding: 20px;
    margin-bottom: 16px;
  }

  .cart-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 40px;
    line-height: 40px;
    cursor: move;
    border-bottom: 1px solid #ebeef5;

    .cart-num {
      width: 50px;
      text-align: center;
      border-right: 1px solid #ebeef5;
    }

    .tuodong-shu {
      width: 44px;
      text-align: center;
      border-right: 1px solid #ebeef5;
    }

    .cart-name {
      width: 200px;
      max-width: 200px;
      padding-left: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-right: 1px solid #ebeef5;
    }

    .cart-memo {
      flex: 1;
      padding-left: 12px;
    }
  }

  .cart-item:nth-child(even) {
    background: #f5f7fa;
  }

  .tip {
    padding: 16px;
    margin-bottom: 16px;
    font-size: 14px;
    line-height: 14px;
    color: #606266;
    background: #fcf6ec;
    border-left: 4px solid #f2d09d;
    border-radius: 4px;

    .iconfont {
      margin-right: 10px;
      color: #e79d2d;
    }
  }

  .title-p {
    box-sizing: border-box;
    padding-bottom: 16px;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    color: #303133;
    border-color: #e4e7ed;
    border-style: solid;
    border-width: 0 0 1px;
  }
}
</style>
