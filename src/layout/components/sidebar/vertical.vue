<script setup lang="ts">
import Logo from "./logo.vue";
import { useRoute, useRouter } from "vue-router";
import { emitter } from "@/utils/mitt";
import SidebarItem from "./sidebarItem.vue";
import leftCollapse from "./leftCollapse.vue";
import { useNav } from "@/layout/hooks/useNav";
import { responsiveStorageNameSpace } from "@/config";
import { storageLocal, isAllEmpty } from "@pureadmin/utils";
import { findRouteByPath, getParentPaths } from "@/router/utils";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { Back } from "@element-plus/icons-vue";
import { menuType } from "@/layout/types";
const agentTemplateStore = useAgentTemplateHook();

const outerMenuRoutes = [
  {
    path: "/agentService",
    name: "agentService",
    title: "menus.agentService",
    icon: "agentfuwu",
    rank: 10,
    meta: {
      title: "menus.agentService",
      icon: "agentfuwu",
      rank: 10
    },
    children: [
      {
        path: "/agentService/llmAgent/index",
        name: "llmAgentIndex",
        title: "menus.llmAgent",
        meta: {
          title: "menus.llmAgent",
          showParent: true
        }
      }
    ]
  },
  {
    path: "/accountManager",
    name: "accountManager",
    title: "menus.accountManager",
    icon: "zhanghaoguanli",
    rank: 10,
    meta: {
      title: "menus.accountManager",
      icon: "zhanghaoguanli",
      rank: 10
    },
    children: [
      {
        path: "/accountManager/index",
        name: "accountManagerIndex",
        title: "menus.accountManager",
        meta: {
          title: "menus.accountManager",
          showParent: false
        }
      }
    ]
  }
];

const route = useRoute();
const router = useRouter();
const showLogo = ref(
  storageLocal().getItem<StorageConfigs>(
    `${responsiveStorageNameSpace()}configure`
  )?.showLogo ?? true
);

const { device, pureApp, isCollapse, menuSelect, toggleSideBar } = useNav();

const subMenuData = ref([]);

const menuData = computed(() => {
  return pureApp.layout === "mix" && device.value !== "mobile"
    ? subMenuData.value
    : usePermissionStoreHook().wholeMenus.filter(
        m => !["agentService", "accountManager"].includes(m.name)
      );
});

const loading = computed(() =>
  pureApp.layout === "mix" ? false : menuData.value.length === 0 ? true : false
);

const defaultActive = computed(() =>
  !isAllEmpty(route.meta?.activePath) ? route.meta.activePath : route.path
);

function getSubMenuData() {
  let path = "";
  path = defaultActive.value;
  subMenuData.value = [];
  // path的上级路由组成的数组
  const parentPathArr = getParentPaths(
    path,
    usePermissionStoreHook().wholeMenus
  );
  // 当前路由的父级路由信息
  const parenetRoute = findRouteByPath(
    parentPathArr[0] || path,
    usePermissionStoreHook().wholeMenus
  );
  if (!parenetRoute?.children) return;
  subMenuData.value = parenetRoute?.children;
}

function backToIndex() {
  agentTemplateStore.resetCurrentAgent();
  router.push("/agentService/llmAgent/index");
}

watch(
  () => [route.path, usePermissionStoreHook().wholeMenus],
  () => {
    if (route.path.includes("/redirect")) return;
    getSubMenuData();
    menuSelect(route.path);
  }
);

onMounted(() => {
  getSubMenuData();

  emitter.on("logoChange", key => {
    showLogo.value = key;
  });
});

onBeforeUnmount(() => {
  // 解绑`logoChange`公共事件，防止多次触发
  emitter.off("logoChange");
});
const currentAgent = computed(
  () => agentTemplateStore.currentAgent || { agent_id: "" }
);

const isShowOuterMenu = computed(() => {
  return (
    agentTemplateStore.getCurrentAgent &&
    agentTemplateStore.getCurrentAgent.agent_id &&
    !route.fullPath.includes("agentService/llmAgent/index") &&
    !route.fullPath.includes("accountManager/index")
  );
});
</script>

<template>
  <div
    v-loading="loading"
    :class="[
      'sidebar-container',
      showLogo ? 'has-logo' : '',
      { 'has-cancel': currentAgent.agent_id }
    ]"
  >
    <Logo v-if="showLogo" :collapse="isCollapse" />
    <div v-if="currentAgent.agent_id" class="menu-cancel" @click="backToIndex">
      <el-icon size="16"><Back /></el-icon>
      <el-text class="agent-name" truncated>
        {{ currentAgent.name }}
      </el-text>
    </div>
    <el-scrollbar
      wrap-class="scrollbar-wrapper"
      :class="[device === 'mobile' ? 'mobile' : 'pc']"
    >
      <el-menu
        v-show="isShowOuterMenu"
        router
        unique-opened
        mode="vertical"
        class="outer-most select-none"
        :collapse="isCollapse"
        :default-active="defaultActive"
        :collapse-transition="false"
      >
        <sidebar-item
          v-for="routes in menuData"
          :key="routes.path"
          :item="routes"
          :base-path="routes.path"
          class="outer-most select-none"
        />
      </el-menu>
      <el-menu
        v-show="!isShowOuterMenu"
        router
        unique-opened
        mode="vertical"
        class="outer-most select-none"
        :collapse="isCollapse"
        :default-active="defaultActive"
        :collapse-transition="false"
      >
        <sidebar-item
          v-for="routes in outerMenuRoutes"
          :key="routes.path"
          :item="((routes as unknown) as menuType)"
          :base-path="routes.path"
          class="outer-most select-none"
        />
      </el-menu>
    </el-scrollbar>
    <leftCollapse
      v-if="device !== 'mobile'"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />
  </div>
</template>

<style scoped>
:deep(.el-loading-mask) {
  opacity: 0.45;
}
</style>
