<script setup lang="ts">
import { EditPen, Delete } from "@element-plus/icons-vue";
import type { DataItem } from "@/store/modules/types";
import { ElMessageBox } from "element-plus";
import { onMounted, ref } from "vue";
import { convert_bytes } from "@/utils/common";

defineOptions({
  name: "carts"
});
defineProps({
  kbList: {
    type: Array,
    default: () => {
      return [];
    }
  }
});

const emit = defineEmits(["handleClickItem", "delCart", "editCart"]);

const activeCart = ref({ id: "" });
function handleClickItem(cart: DataItem) {
  activeCart.value = cart;
  emit("handleClickItem", cart);
}
// 删除
const delCart = info => {
  ElMessageBox.confirm("确认删除?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      emit("delCart", info.id);
    })
    .catch(() => {});
};
// 编辑
const editCart = info => {
  emit("editCart", info);
};

onMounted(() => {});
</script>

<template>
  <div class="cart-draggable">
    <div
      v-for="item in kbList"
      :key="item.id"
      @click="handleClickItem(item)"
      class="cart-item"
      :class="
        activeCart.id === item.id ? 'bg-slate-100 active-border' : 'bg-white'
      "
    >
      <div class="cart">
        <div class="top">
          <div class="title">{{ item.title }}</div>
          <el-icon @click.stop="editCart(item)" class="editBtn"
            ><EditPen
          /></el-icon>
          <el-icon @click.stop="delCart(item)" class="delIcon"
            ><Delete
          /></el-icon>
        </div>
        <div class="middle">
          <div class="flex-div">
            {{ item.count }}
            <p>文件数</p>
          </div>
          <div class="flex-div">
            {{ convert_bytes(item.bytes) }}
            <p>文件大小</p>
          </div>
          <div class="flex-div">
            {{ item.characters }}
            <p>总字符数</p>
          </div>
        </div>
        <div class="bottom">
          <span>添加时间</span>
          <span class="right-span">{{
            item.create_datetime?.replace("T", " ")
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.active-border {
  border-left: 3px solid #409eff;
}

.answer-tag {
  color: #e6a23c;
  background: rgb(252 246 236);
}

.role-tag {
  color: #67c23a;
  background: rgb(240 249 235);
}

.cart {
  height: 144px;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 4px;

  .top {
    display: flex;
    align-items: center;
    margin-bottom: 11px;
    margin-left: 6px;
    cursor: pointer;

    .title {
      flex: 1;
      max-width: max-content;
      overflow: hidden;
      font-size: 16px;
      font-weight: 500;
      color: #3d3d3d;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .editBtn {
      margin-right: 10px;
      margin-left: auto;
      color: #909399;
    }

    .delIcon {
      color: #909399;
    }
  }

  .middle {
    display: flex;
    flex-direction: row;
    align-items: center;
    align-self: stretch;
    justify-content: space-between;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    text-align: center;
    background: #f5f7fa;
    border-radius: 4px;

    p {
      font-size: 12px;
      font-weight: normal;
      color: #606266;
    }

    .flex-div {
      flex: 1;
    }
  }

  .bottom {
    margin-top: 10px;
    font-size: 12px;
    font-weight: normal;
    line-height: 22px;
    color: #606266;

    .right-span {
      float: right;
    }

    &::before {
      display: block;
      width: 0;
      height: 0;
      clear: both;
      content: "";
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
