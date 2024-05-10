<script setup lang="ts">
import carts from "./carts.vue";
import mainCart from "./mainCarts.vue";
import { computed, reactive, ref } from "vue";
import { Search, Plus, CircleCloseFilled } from "@element-plus/icons-vue";
import AnswerRoleAdd from "./answerRoleAdd.vue";
import flowRoleAdd from "./flowRoleAdd.vue";
import classificationAdd from "./classificationAdd.vue";
import testChat from "./testChat.vue";
import { DataItem } from "@/store/modules/types";
import scenesDrawerAdd from "./scenesDrawerAdd.vue";
import flowCanvas from "./flow/index.vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { generateUUID, generateDataItem } from "@/utils/common";
import { cloneDeep, isEmpty } from "lodash";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  queryAgentRole,
  saveAgentRole,
  deleteRole,
  bindAgentFloor,
  updateRoleStatus,
  bindCateFloor
} from "@/api/agent";
const agentTemplateStore = useAgentTemplateHook();

const emit = defineEmits(["refreshConfig"]);

defineOptions({
  name: "characterScene"
});
const info = reactive({
  pocketRole: "",
  dirtyScene: "",
  roleName: "",
  currentClassificationInfo: []
});
const allCurrentClassificationInfo = ref({});

const role_type = ref("");
const isSenesFlow = ref(false);
const testChatRef = ref();
const toolMaps = ref([]);
const allToolMaps = ref([]);
const showFlow = ref(false);
const flowData = ref({});

const toolChildMaps = ref([]);
const toolChildSelectMaps = ref([]);

const answerDrawerVisible = ref(false);
const classificationVisible = ref(false);
const scenesDrawerVisible = ref(false);
const flowRoleAddRef = ref();
// 打开测试会话的窗口
const openChat = () => {
  testChatRef.value.openDetail({});
};
// 添加流程角色弹窗
const flowBtn = (type?: string) => {
  if (type) {
    isSenesFlow.value = false;
  } else {
    isSenesFlow.value = true;
  }
  flowRoleAddRef.value.openDialog(null, type);
};
// 添加回答角色弹窗
const answerBtn = () => {
  answerRoleAddModule.value = "answer";
  role_type.value = "0";
  const initObj = generateDataItem({
    pid: "",
    role_type: "0"
  });
  answerRoleData.value = {
    ...initObj,
    tool_llm: agentTemplateStore.getCurrentAgent.default_sub_tool_llm
  };
  answerDrawerVisible.value = true;
};
const classificationBtn = () => {
  role_type.value = "1";
  classificationVisible.value = true;
};

// 是否显示添加场景按钮
const isShowAddScenesBtn = computed(() => {
  return (
    allCurrentClassificationInfo.value?.role_type === "1" ||
    allCurrentClassificationInfo.value?.cate === "2"
  );
});

const scenesInitData = ref({});
const addScenes = () => {
  role_type.value = "";
  const initObj = generateDataItem({
    pid: allCurrentClassificationInfo.value.uid
  });
  scenesInitData.value = {
    ...initObj,
    tool_llm: agentTemplateStore.getCurrentAgent.default_sub_tool_llm
  };
  scenesDrawerVisible.value = true;
};

// 回答角色弹窗数据
const answerRoleData = ref({});
// 点击卡片进入画布，或者新建流程角色成功之后跳转画布
const goToFlow = ({ info, type }) => {
  if (type) {
    isSenesFlow.value = false;
  } else {
    isSenesFlow.value = true;
  }
  flowData.value = info;
  showFlow.value = true;
};
function handleEditCart(cart) {
  if (cart.role_type == "2") {
    // 流程角色直接跳转到画布页面
    goToFlow({ info: cart, type: "" });
    return false;
  }
  let role_type = cart.role_type;
  if (!role_type && cart.cate) {
    if (["1", "3", "4"].includes(cart.cate)) {
      role_type = "0";
    }
    if (cart.cate === "2") {
      role_type = "1";
    }
  }
  switch (role_type) {
    // 回答
    case "0":
      answerRoleAddModule.value = "answer";
      answerRoleData.value = cart;
      answerDrawerVisible.value = true;
      info.currentClassificationInfo = [];
      info.dirtyScene = undefined;
      allCurrentClassificationInfo.value = {};
      break;
    // 分类
    case "1":
      allCurrentClassificationInfo.value = cart;
      // info.currentClassificationInfo = cart.child;
      page.page = 1;
      info.dirtyScene = cart.floor;
      queryAgentRoleFn(cart.uid);
      break;
    default:
      break;
  }
}

// 分类角色编辑抽屉
const classificationRoleData = ref({});

function handleEditDrawer(cart) {
  if (cart.role_type == "2") {
    isSenesFlow.value = true;
    flowRoleAddRef.value.openDialog(cart);
  } else {
    classificationVisible.value = true;
    classificationRoleData.value = cart;
  }
}

// 删除方法
const delCart = ({ uid, type }) => {
  const info = agentTemplateStore.currentAgent as any;
  let pid = "";
  if (type) {
    pid = allCurrentClassificationInfo.value.uid;
  }
  deleteRole({
    agent_id: info.agent_id,
    pid,
    uid
  }).then(res => {
    if (res.code === 200) {
      ElMessage.success("删除成功");
      if (isMainCart.value) {
        queryAgentRoleFn(allCurrentClassificationInfo.value.uid);
        isMainCart.value = false;
      } else {
        allCurrentClassificationInfo.value = {};
        queryAgentRoleFn();
      }
    } else {
      ElMessage.error(res.message ? res.message : "删除失败");
    }
  });
};
// 上线||下线操作
const changeStatus = ({ info, type }) => {
  let pid = "";
  if (type) {
    pid = allCurrentClassificationInfo.value.uid;
  }
  updateRoleStatus({
    uid: info.uid,
    pid: pid,
    agent_id: agentTemplateStore.getCurrentAgent.agent_id,
    status: info.status == 0 ? 1 : 0
  }).then(res => {
    if (res.code === 200) {
      ElMessage.success(`${info.status == 0 ? "上线" : "下线"}成功`);
      queryAgentRoleFn(pid);
    } else {
      ElMessage.error(
        res.message ? res.message : `${info.status == 0 ? "上线" : "下线"}失败`
      );
    }
  });
};
// 流程画布点击返回
const goBack = () => {
  showFlow.value = false;
  if (!isSenesFlow.value) {
    // 场景里面钻入的，刷新场景列表
    queryAgentRoleFn(allCurrentClassificationInfo.value.uid);
  } else {
    // 角色里面钻入的，刷新角色列表
    queryAgentRoleFn();
  }
};

// 添加+更新方法
const updateInfo = infoData => {
  if (infoData.uid) {
    saveAgentRole(infoData).then(res => {
      if (res.code === 200) {
        ElMessage.success("编辑成功");
        queryAgentRoleFn(
          !infoData.pid || infoData.pid === "0" ? "" : infoData.pid
        );
        answerDrawerVisible.value = false;
        classificationVisible.value = false;
      } else {
        ElMessage.error(res.message ? res.message : "编辑失败");
      }
    });
  } else {
    const relInfo = agentTemplateStore.currentAgent as any;
    // 新增
    if (role_type.value === "0") {
      // 回答角色
      const obj = {
        uid: generateUUID(),
        pid: "",
        role_type: "0",
        agent_id: relInfo.agent_id
      };
      const relObj = Object.assign(obj, infoData);
      saveAgentRole(relObj).then(res => {
        if (res.code === 200) {
          ElMessage.success("添加成功");
          queryAgentRoleFn();
          answerDrawerVisible.value = false;
        } else {
          ElMessage.error(res.message ? res.message : "添加失败");
        }
      });
    } else if (role_type.value === "1") {
      // 分类角色
      const obj = {
        uid: generateUUID(),
        pid: "",
        role_type: "1",
        cate: "2",
        agent_id: relInfo.agent_id
      };
      const relObj = Object.assign(obj, infoData);
      saveAgentRole(relObj).then(res => {
        if (res.code === 200) {
          ElMessage.success("添加成功");
          queryAgentRoleFn();
          classificationVisible.value = false;
        } else {
          ElMessage.error(res.message ? res.message : "添加失败");
        }
      });
    } else {
      // 新增场景 (分类下
      const obj = {
        uid: generateUUID(),
        pid: allCurrentClassificationInfo.value.uid,
        role_type: "1",
        cate: "2",
        agent_id: relInfo.agent_id
      };
      const relObj = Object.assign(obj, infoData);
      saveAgentRole(relObj).then(res => {
        if (res.code === 200) {
          ElMessage.success("添加成功");
          page.page = 1;
          queryAgentRoleFn(allCurrentClassificationInfo.value.uid);
          scenesDrawerVisible.value = false;
        } else {
          ElMessage.error(res.message ? res.message : "添加失败");
        }
      });
    }
  }
};

const changeRole = data => {
  let name = "";
  data.map(item => {
    if (item.uid === info.pocketRole) {
      name = item.input;
    }
  });
  const relInfo = agentTemplateStore.currentAgent as any;
  bindAgentFloor({
    agent_id: relInfo.agent_id,
    floor: name
  }).then(res => {
    if (res.code === 200) {
      ElMessage.success("保存成功");
    } else {
      ElMessage.error(res.message ? res.message : "保存失败");
    }
    emit("refreshConfig");
  });
};

// 兜底场景，修改map的floor字段
function changeSceneFloor() {
  const relInfo = agentTemplateStore.currentAgent as any;
  bindCateFloor({
    agent_id: relInfo.agent_id,
    floor: info.dirtyScene,
    uid: allCurrentClassificationInfo.value.uid
  }).then(res => {
    if (res.code === 200) {
      ElMessage.success("保存成功");
      queryAgentRoleFn();
    } else {
      ElMessage.error(res.message ? res.message : "保存失败");
    }
  });
}

// answerRoleAdd组件，编辑场景亚龙也拿来用了，因此得区分
const answerRoleAddModule = ref("");

const editScenes = ({ info, type }) => {
  if (info.role_type == "2") {
    isSenesFlow.value = false;
    flowRoleAddRef.value.openDialog(info, type);
  } else {
    answerRoleData.value = info;
    answerRoleAddModule.value = "scenes";
    answerDrawerVisible.value = true;
  }
};
const isMainCart = ref(false);
function handleDelScenes({ uid, type }) {
  ElMessageBox.confirm("确认删除细分场景?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    delCart({ uid, type });
    isMainCart.value = true;
  });
}

const searchAgent = () => {
  queryAgentRoleFn();
};

// 是否显示右侧顶部的元素 场景数量、兜底场景、添加场景按钮
const isShowRightTop = computed(() => {
  return !isEmpty(allCurrentClassificationInfo.value);
});

function refreshRole() {
  queryAgentRoleFn();
}

async function queryAgentRoleFn(pid = "") {
  const agent_id = agentTemplateStore.getCurrentAgent.agent_id;
  if (agent_id) {
    try {
      const { code, data, message } = await queryAgentRole({
        agent_id,
        page: 1,
        size: 1000,
        name: !pid ? info.roleName : "",
        pid
      });
      if (code === 200) {
        if (!pid) {
          // 兜底角色列表
          toolMaps.value = data.result || [];
          if (info.roleName === "") {
            // 一级
            const newArr = [];
            toolMaps.value.forEach(item => {
              if (agentTemplateStore.getCurrentAgent.floor) {
                if (item.input === agentTemplateStore.getCurrentAgent.floor) {
                  info.pocketRole = item.uid;
                }
              }
              if (item.status == 1) {
                // 过滤启动状态的角色
                newArr.push(item);
              }
            });
            allToolMaps.value = newArr;
          }
        } else {
          // 二级
          info.currentClassificationInfo = cloneDeep(data.result || []);
          toolChildMaps.value = cloneDeep(data.result || []);
          const resultArr = cloneDeep(data.result || []);
          const newArr = [];
          resultArr.forEach(item => {
            if (item.status == 1) {
              // 过滤启动状态的场景
              newArr.push(item);
            }
          });
          toolChildSelectMaps.value = newArr;
          totalCount.value = data.total_count;
        }
      } else {
        ElMessage.error(message ? message : "查询失败！");
      }
    } catch (error) {
      ElMessage.error("查询失败！");
    }
  }
}

const page = reactive({
  page: 1,
  limit: 10
});

const totalCount = ref(0);

function handleSizeChange(val) {
  page.limit = val;
}

function handleCurrentChange(val) {
  page.page = val;
}

const pagedList = computed(() => {
  const start = (page.page - 1) * page.limit;
  const end = page.page * page.limit;
  return toolChildMaps.value.slice(start, end);
});

defineExpose({
  queryAgentRoleFn
});

// // 暂时写在这里，登录功能完善后修改获取位置！！
// import { useAsyncOptionsHook } from "@/store/modules/asyncOptions";
// const asyncOptionStore = useAsyncOptionsHook();
// watch(
//   () => {
//     agentTemplateStore.getCurrentAgent.agent_id;
//   },
//   () => {
//     if (agentTemplateStore.getCurrentAgent.agent_id) {
//       asyncOptionStore.queryAllOptions(
//         agentTemplateStore.getCurrentAgent.agent_id
//       );
//     }
//   },
//   {
//     immediate: true
//   }
// );
</script>

<template>
  <div class="character">
    <el-container>
      <el-aside class="left" width="300px">
        <div class="roleName">
          <el-input v-model="info.roleName" placeholder="角色名称">
            <template #suffix>
              <el-icon class="el-input__icon" @click="searchAgent"
                ><search
              /></el-icon>
            </template>
          </el-input>
          <el-dropdown trigger="click">
            <el-icon class="plus">
              <Plus />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="answerBtn"
                  ><span
                    class="iconfont huidajiaose drop-iconfont"
                  />回答角色</el-dropdown-item
                >
                <el-dropdown-item @click="classificationBtn"
                  ><span
                    class="iconfont agentfuwu drop-iconfont"
                  />分类角色</el-dropdown-item
                >
                <el-dropdown-item @click="flowBtn('')"
                  ><span
                    class="iconfont agentguanli drop-iconfont"
                  />流程角色</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="roleSelect">
          <span class="title">兜底角色</span>
          <el-select
            v-model="info.pocketRole"
            class="m-2"
            filterable
            placeholder="请选择"
            style="width: 240px"
            @change="changeRole(toolMaps)"
          >
            <el-option
              v-for="item in allToolMaps"
              :key="item.uid"
              :label="item.name"
              :value="item.uid"
            />
            <el-option label="未知忽略" value="">
              <div class="flex items-center">
                <el-icon color="red" size="16">
                  <CircleCloseFilled />
                </el-icon>
                <span class="ml-1">未知忽略</span>
              </div>
            </el-option>
          </el-select>
        </div>
        <div class="carts">
          <el-scrollbar height="calc(100vh - 296px)">
            <carts
              :selectName="info.roleName"
              :toolMaps="toolMaps"
              @delCart="delCart"
              @changeStatus="changeStatus"
              @edit="handleEditCart"
              @editCart="handleEditDrawer"
              @refreshRole="refreshRole"
            />
          </el-scrollbar>
        </div>
      </el-aside>
      <el-main class="elMain">
        <div v-show="isShowRightTop" class="top">
          <div class="total-text">共{{ totalCount }}个场景</div>
          <div class="roleSelect">
            <span class="title">兜底场景</span>
            <el-select
              v-model="info.dirtyScene"
              :disabled="!info.currentClassificationInfo.length"
              class="m-2"
              placeholder="请选择"
              style="width: 150px"
              @change="changeSceneFloor"
            >
              <el-option
                v-for="item in toolChildSelectMaps"
                :key="item.uid"
                :label="item.name"
                :value="item.input"
              />
              <el-option label="未知忽略" value="">
                <div class="flex items-center">
                  <el-icon color="red" size="16">
                    <CircleCloseFilled />
                  </el-icon>
                  <span class="ml-1">未知忽略</span>
                </div>
              </el-option>
            </el-select>
          </div>
          <el-dropdown trigger="click" v-show="isShowAddScenesBtn">
            <div class="addBtn">
              <el-icon class="plus"><Plus /></el-icon>添加场景
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="addScenes"
                  ><span
                    class="iconfont huidajiaose drop-iconfont"
                  />回答场景</el-dropdown-item
                >
                <el-dropdown-item @click="flowBtn('internal')"
                  ><span
                    class="iconfont agentguanli drop-iconfont"
                  />流程场景</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="cartList">
          <template v-if="info.currentClassificationInfo.length > 0">
            <el-scrollbar height="calc(100vh - 274px)">
              <mainCart
                v-for="item in pagedList"
                :key="item.uid"
                :info="item"
                :uid="info.dirtyScene"
                @goToFlow="goToFlow"
                @changeStatus="changeStatus"
                @delScenes="handleDelScenes"
                @editScenes="editScenes"
              />
            </el-scrollbar>
          </template>
          <div
            v-if="toolMaps.length && !info.currentClassificationInfo.length"
            class="mt-40"
          >
            <div class="flex justify-center">
              <img src="@/assets/images/message_1.png" />
            </div>
            <p class="text-center text-sm" style="color: #3d3d3d">
              选择角色，构建LLM对话新体验
            </p>
          </div>
          <div
            v-if="!toolMaps.length && !info.currentClassificationInfo.length"
            class="mt-40"
          >
            <div class="flex justify-center">
              <img src="@/assets/images/user_1.png" />
            </div>
            <p class="text-center text-sm" style="color: #3d3d3d">
              新建角色，构建LLM对话新体验
            </p>
          </div>
          <div
            class="pagination"
            v-if="info.currentClassificationInfo.length > 0"
          >
            <el-pagination
              class="justify-end"
              v-model:current-page="page.page"
              v-model:page-size="page.limit"
              :page-sizes="[10, 20, 50]"
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalCount"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        <div class="test-chat-btn iconfont ceshirukou" @click="openChat" />
      </el-main>
    </el-container>
    <AnswerRoleAdd
      v-model:visible="answerDrawerVisible"
      :form="(answerRoleData as DataItem)"
      :module="answerRoleAddModule"
      :toolMaps="toolMaps"
      @updateInfo="updateInfo"
    />
    <classificationAdd
      v-model:visible="classificationVisible"
      :form="(classificationRoleData as DataItem)"
      :toolMaps="toolMaps"
      @updateInfo="updateInfo"
    />
    <scenesDrawerAdd
      v-model:visible="scenesDrawerVisible"
      :form="scenesInitData"
      :toolChildMaps="toolChildMaps"
      @updateInfo="updateInfo"
    />
    <flowRoleAdd
      ref="flowRoleAddRef"
      @fetchList="queryAgentRoleFn"
      @goToFlow="goToFlow"
      :isSenesFlow="isSenesFlow"
      :pid="allCurrentClassificationInfo.uid"
    />
    <testChat ref="testChatRef" />
    <flowCanvas
      v-if="showFlow"
      :isSenesFlow="isSenesFlow"
      :propsFlowData="flowData"
      :pid="allCurrentClassificationInfo.uid"
      @goBack="goBack"
    />
  </div>
</template>

<style lang="scss" scoped>
.drop-iconfont {
  margin-right: 8px;
}

.character {
  position: relative;
  z-index: 1000;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
}

.left {
  width: 300px;
  min-height: calc(100vh - 207px);
  border-right: 1px solid #e4e7ed;

  .roleSelect {
    display: flex;
    align-items: center;
    padding: 0 16px 8px;
    border-bottom: 1px solid #e4e7ed;

    .title {
      width: 85px;
      font-size: 14px;
      font-weight: 500;
      color: #909399;
    }
  }

  .roleName {
    display: flex;
    align-items: center;
    padding: 16px 16px 8px;

    .plus {
      width: 32px;
      height: 32px;
      margin: 0 10px;
      line-height: 32px;
      color: #fff;
      text-align: center;
      cursor: pointer;
      background: #409eff;
    }
  }

  // .carts {
  //   max-height: 500px;
  // }
}

.test-chat-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 999;

  /* 自动布局 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(180deg, #0065ff 0%, #5598ff 100%);
  border-radius: 100px;
  box-shadow: 0 4px 20px 0 rgb(1 34 83 / 20%);
  opacity: 1;
}

.elMain {
  padding-top: 0;
  background: rgb(250 250 250);

  .top {
    display: flex;
    align-items: center;
    padding-bottom: 5px;
    border-bottom: 1px solid #e4e7ed;

    .total-text {
      font-size: 14px;
      font-weight: 500;
    }

    .roleSelect {
      margin-left: auto;
    }

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

      .plus {
        margin-right: 9px;
        cursor: pointer;
      }
    }
  }

  .cartList {
    padding-top: 16px;
  }
}

.pagination {
  float: right;
  margin-top: 20px;
}
</style>
