import { defineStore } from "pinia";
import { store } from "@/store";
import {
  queryFunctionList,
  queryAllAiEntity,
  queryVarListByAgent,
  addVarListByAgent
} from "@/api/agent";
import { ElMessage } from "element-plus";

export const useAsyncOptions = defineStore({
  id: "async-options",
  state: () => ({
    // 函数
    funcOptions: [],
    // 实体
    allAiEntity: [],
    // 变量
    varList: []
  }),
  getters: {
    getFuncOptions(state) {
      return state.funcOptions;
    },
    getAllAiEntity(state) {
      return state.allAiEntity;
    },
    getVarList(state) {
      return state.varList;
    }
  },
  actions: {
    /**
     * @description: 获取函数服务，后面改为统一管理，不绑定单个agent
     * @param {string} bot_id
     * @return {*}
     */
    queryFunctionList(params) {
      const { bot_id = "68abbfa2de722a659b1c875c9c7d1a22", agent_id } = params;
      queryFunctionList({
        page: 1,
        size: 9999,
        otherName: "",
        bot_id,
        agent_id
      }).then(res => {
        if (res.code == 200) {
          // @ts-ignore
          this.funcOptions = res.data.result || [];
          window.localStorage.setItem(
            "funcOptions",
            JSON.stringify(this.funcOptions)
          );
        }
      });
    },

    queryAllAiEntity(agent_id) {
      queryAllAiEntity({
        page: 1,
        size: 1000,
        agent_id
      }).then(res => {
        if (res.code == 200) {
          // @ts-ignore
          this.allAiEntity = res.data.result || [];
          window.localStorage.setItem(
            "allAiEntity",
            JSON.stringify(this.allAiEntity)
          );
        }
      });
    },

    /**
     * @description: 查询变量列表
     * @param {*} agent_id
     * @return {*}
     */
    queryVarListByAgent(agent_id) {
      return queryVarListByAgent({
        agent_id
      })
        .then((res: any) => {
          if (res.code === 200) {
            this.varList = res.data.result || [];
          } else {
            ElMessage.error("获取变量失败！");
          }
        })
        .catch(() => {
          ElMessage.error("获取变量失败！");
        });
    },

    /**
     * @description: 更新变量到服务端
     * @param {*} param1
     * @return {*}
     */
    async updateVarListByAgent({ agent_id, varname }) {
      try {
        const res = await addVarListByAgent({
          varname,
          agent_id
        });
        if (res.code === 200) {
          this.varList.push({
            varname: varname,
            agent_id: agent_id
          });
        } else {
          ElMessage.error("创建变量失败！");
        }
      } catch (error) {
        ElMessage.error("创建变量失败！");
      }
    },
    persistence() {
      const funcOptions = window.localStorage.getItem("funcOptions");
      const allAiEntity = window.localStorage.getItem("allAiEntity");
      this.funcOptions = JSON.parse(funcOptions);
      this.allAiEntity = JSON.parse(allAiEntity);
    },

    queryAllOptions(agent_id) {
      this.queryFunctionList({ agent_id });
      this.queryAllAiEntity(agent_id);
    }
  }
});

export function useAsyncOptionsHook() {
  return useAsyncOptions(store);
}
