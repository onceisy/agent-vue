// 模拟后端动态生成路由
import { MockMethod } from "vite-plugin-mock";

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */

const permissionRouter = {
  path: "/permission",
  hideNav: true,
  meta: {
    title: "menus.permission",
    icon: "agentguanli",
    rank: 100
  },
  children: [
    {
      path: "/permission/page/index",
      name: "PermissionPage",
      meta: {
        title: "menus.permissionPage",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/permission/button/index",
      name: "PermissionButton",
      meta: {
        title: "menus.permissionButton",
        roles: ["admin", "common"],
        auths: ["btn_add", "btn_edit", "btn_delete"]
      }
    }
  ]
};
const agentRouter = [
  // agent服务路由
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
          showParent: true // 是否显示父级菜单
        }
      }
    ]
  },
  // // Agent协助
  // {
  //   path: "/agentAssist",
  //   name: "agentAssist",
  //   title: "menus.agentAssist",
  //   icon: "agentfuwu",
  //   rank: 10,
  //   meta: {
  //     title: "menus.agentAssist",
  //     icon: "agentfuwu",
  //     rank: 10
  //   },
  //   children: [
  //     {
  //       path: "/agentAssist/sessionWorkbench/index",
  //       name: "sessionWorkbenchIndex",
  //       title: "menus.sessionWorkbench",
  //       meta: {
  //         title: "menus.sessionWorkbench",
  //         showParent: true // 是否显示父级菜单
  //       }
  //     }
  //   ]
  // },
  // 账号管理
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
          showParent: false // 是否显示父级菜单
        }
      }
    ]
  }
];

export default [
  {
    url: "/getAsyncRoutes",
    method: "get",
    response: () => {
      return {
        code: 2000,
        description: "获取数据成功",
        data: [...agentRouter, permissionRouter]
      };
    }
  }
] as MockMethod[];
