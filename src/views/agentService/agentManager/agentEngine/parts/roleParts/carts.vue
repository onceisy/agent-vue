<script setup lang="ts">
import type { DataItem } from "@/store/modules/types";
import { roleTypeOptions } from "@/constant/options";
import { ElMessageBox } from "element-plus";
import Sortable from "sortablejs";
import { onMounted, ref } from "vue";
import { roleSort } from "@/api/agent";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";

defineOptions({
  name: "carts"
});

const props = defineProps({
  selectName: {
    type: String,
    default: ""
  },
  toolMaps: {
    type: Array,
    default() {
      return [];
    }
  }
});

const emit = defineEmits([
  "edit",
  "delCart",
  "editCart",
  "refreshRole",
  "changeStatus"
]);

const activeCart = ref({ uid: "" });

function handleEdit(cart: DataItem) {
  activeCart.value = cart;
  emit("edit", cart);
}

const changeStatus = data => {
  emit("changeStatus", { info: data, type: "" });
};
const delCart = info => {
  ElMessageBox.confirm("确认删除角色?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    emit("delCart", { uid: info.uid, type: "" });
  });
};

const editCart = info => {
  emit("editCart", info);
};

function showRoleLabel(type: string) {
  const item = roleTypeOptions.find(i => i.value === type) || { label: "" };
  return item.label || "";
}
function showRoleType(type: string) {
  return type === "0" ? "回答" : type === "1" ? "分类" : "流程";
}

/**
 * @description: 是否显示编辑按钮
 * @param {*} agent
 * @return {*}
 */
function isShowEditIcon(agent) {
  let isShow = false;
  if (agent.role_type) {
    isShow = agent.role_type === "1" || agent.role_type === "2";
  } else if (agent.cate) {
    isShow = agent.cate === "2";
  }
  return isShow;
}

const agentTemplateStore = useAgentTemplateHook();
// 卡片拖拽
function initCartDrag() {
  // 要拖拽元素的父容器
  const tbody: HTMLElement = document.querySelector(".cart-draggable");
  Sortable.create(tbody, {
    //  可被拖拽的子元素
    draggable: ".cart-draggable .cart-item",
    onEnd({ newIndex, oldIndex }) {
      if (newIndex === oldIndex) {
        return;
      }
      const moveType = ref("");
      const data = ref();
      if (oldIndex > newIndex) {
        moveType.value = "up";
        data.value = [
          {
            uid: props.toolMaps[oldIndex].uid,
            sort: props.toolMaps[oldIndex].sort
          },
          {
            uid: props.toolMaps[newIndex].uid,
            sort: props.toolMaps[newIndex].sort
          }
        ];
      } else {
        moveType.value = "down";
        data.value = [
          {
            uid: props.toolMaps[newIndex].uid,
            sort: props.toolMaps[newIndex].sort
          },
          {
            uid: props.toolMaps[oldIndex].uid,
            sort: props.toolMaps[oldIndex].sort
          }
        ];
      }
      roleSort({
        data: data.value,
        move_type: moveType.value,
        agent_id: agentTemplateStore.getCurrentAgent.agent_id
      }).then(res => {
        if (res.code === 200) {
          emit("refreshRole");
        }
      });
    }
  });
}

onMounted(() => {
  initCartDrag();
});
</script>

<template>
  <div class="cart-draggable">
    <div
      v-for="item in toolMaps"
      :key="item.uid"
      @click="handleEdit(item)"
      class="cart-item"
      :class="activeCart.uid === item.uid ? 'active-border' : 'bg-white'"
    >
      <div class="cart">
        <div class="top">
          <el-tag
            v-if="item.role_type"
            style="margin-right: 5px"
            size="small"
            :type="
              item.role_type == '2'
                ? 'primary'
                : item.role_type == '1'
                ? 'success'
                : 'warning'
            "
            >{{ showRoleType(item.role_type) }}</el-tag
          >
          <el-tag
            v-else-if="item.cate"
            style="margin-right: 5px"
            size="small"
            >{{ showRoleLabel(item.cate) }}</el-tag
          >
          <div class="title">{{ item.name }}</div>
          <span class="iconfont tuodong-shu" />
        </div>
        <el-tooltip effect="dark" placement="top-start" :content="item.desc">
          <el-text truncated>{{ item.desc }}</el-text>
        </el-tooltip>
        <div class="btn-wrap">
          <el-tooltip
            effect="dark"
            :content="item.status == '0' ? '上线' : '下线'"
            placement="top"
          >
            <span
              class="iconfont status-btn"
              :class="item.status == '0' ? 'shangxian' : 'xiaxian'"
              @click.stop="changeStatus(item)"
            />
          </el-tooltip>
          <span
            class="iconfont bianji edit-btn"
            v-if="isShowEditIcon(item)"
            @click.stop="editCart(item)"
          />
          <span class="iconfont shanchu del-icon" @click.stop="delCart(item)" />
          <span
            class="status-span"
            :class="item.status == '0' ? 'disabled-span' : ''"
            ><span class="iconfont wancheng-mian" />{{
              item.status == "0" ? "已下线" : "已上线"
            }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.active-border {
  background: #fff;
  border: 1px solid #409eff;
  border-radius: 4px;
}

.cart-draggable {
  padding: 10px 10px 0;
  background: #fafafa;
}

.cart-item {
  margin-bottom: 10px;
}

.cart {
  height: 125px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;

  .btn-wrap {
    height: 34px;
    padding: 10px 0;
    margin-top: 5px;
    color: #909399;
    border-top: 1px solid #e4e7ed;

    .status-span {
      box-sizing: border-box;
      display: inline-block;
      float: right;
      padding: 0 2px;
      margin-top: -2px;
      font-size: 14px;
      font-weight: normal;
      line-height: 22px;
      color: #3d3d3d;
      text-align: center;
      border: 1px solid #e4e7ed;
      border-radius: 4px;

      .iconfont {
        margin-right: 2px;
        color: #67c23a;
      }
    }

    .iconfont {
      cursor: pointer;
    }

    .disabled-span {
      background: #f6f6f7;

      .iconfont {
        color: #c0c4cc;
      }
    }

    .edit-btn,
    .del-icon,
    .status-btn {
      margin-right: 10px;
      margin-left: auto;
    }
  }

  .top {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    cursor: pointer;

    .title {
      flex: 1;
      max-width: 13em;
      overflow: hidden;
      font-size: 16px;
      font-weight: 500;
      color: #3d3d3d;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .describe {
    overflow: hidden;
    font-size: 14px;
    font-weight: normal;
    color: #606266;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
