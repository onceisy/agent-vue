<script setup lang="ts">
defineOptions({
  name: "mainCart"
});

const props = defineProps({
  info: {
    type: Object,
    default: () => {}
  },
  uid: {
    type: String,
    default: ""
  }
});
const emit = defineEmits([
  "delScenes",
  "editScenes",
  "changeStatus",
  "goToFlow"
]);

const delScenes = () => {
  emit("delScenes", { uid: props.info.uid, type: "scenes" });
};

const editScenes = () => {
  emit("editScenes", { info: props.info, type: "scenes" });
};
const changeStatus = () => {
  emit("changeStatus", { info: props.info, type: "scenes" });
};
const goToFlow = () => {
  emit("goToFlow", { info: props.info, type: "scenes" });
};
const showRoleType = (type: string) => {
  return type === "0" ? "回答" : type === "1" ? "分类" : "流程";
};
</script>

<template>
  <div class="mainCart">
    <div class="top">
      <span
        class="status-span"
        :class="info.status == '0' ? 'disabled-span' : ''"
        ><span class="iconfont wancheng-mian" />{{
          info.status == "0" ? "已下线" : "已上线"
        }}</span
      >
      <el-tag
        v-if="info.role_type"
        style="margin: -3px 8px 0 0"
        :type="
          info.role_type == '2'
            ? 'primary'
            : info.role_type == '1'
            ? 'success'
            : 'warning'
        "
        >{{ showRoleType(info.role_type) }}</el-tag
      >
      <div class="title">{{ info.name }}</div>
      <div class="btn-wrap">
        <span
          v-if="info.role_type == '2'"
          class="iconfont iconfont agentguanli"
          @click="goToFlow"
        />
        <el-tooltip
          effect="dark"
          :content="info.status == '0' ? '上线' : '下线'"
          placement="top"
        >
          <span
            class="iconfont status-btn"
            :class="info.status == '0' ? 'shangxian' : 'xiaxian'"
            @click.stop="changeStatus"
          />
        </el-tooltip>
        <span class="iconfont bianji edit-btn" @click.stop="editScenes" />
        <span class="iconfont shanchu del-icon" @click.stop="delScenes" />
      </div>
    </div>
    <div class="describe">
      {{ info.desc }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mainCart {
  height: 88px;
  padding: 16px 20px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  background: #fff;
  border: 1px solid #f6f6f7;
  border-radius: 5px;

  .top {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .btn-wrap {
      display: none;
      margin-left: 10px;
      color: #909399;

      .iconfont {
        margin-right: 10px;
        cursor: pointer;
      }

      .iconfont:last-child {
        margin-right: 0;
      }
    }

    .title {
      flex: 1;
      max-width: 100%;
      overflow: hidden;
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

.mainCart:hover {
  border: 1.5px solid #409eff;
  border-radius: 5px;

  .btn-wrap {
    display: block;
  }
}

.status-span {
  box-sizing: border-box;
  display: inline-block;
  height: 24px;
  padding: 0 2px;
  margin-top: -3px;
  margin-right: 8px;
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

.disabled-span {
  background: #f6f6f7;

  .iconfont {
    color: #c0c4cc;
  }
}
</style>
