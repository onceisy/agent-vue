import { defineStore } from "pinia";
import { store } from "@/store";
import { AgentTemplateType, DataItem } from "./types";
import { generateUUID } from "@/utils/common";
// import { updateAgentTemplate } from "@/api/agent";
// import { ElMessage } from "element-plus";

interface AgentTemplateStoreType {
  currentAgent: AgentTemplateType;
  modelEnum: any[];
}

const initData: AgentTemplateType = {
  agent_id: "",
  uid: "",
  tool_llm: "",
  default_sub_tool_llm: "",
  rag_llm: ""
};

export const useAgentTemplate = defineStore({
  id: "agent-template",
  state: (): AgentTemplateStoreType => ({
    currentAgent: initData,
    modelEnum: [
      "gpt4",
      "gpt4-32",
      "baidu",
      "minimax",
      "minimax6",
      "baichuan",
      "qwen-7b-chat",
      "qwen-14b-chat",
      "qwen-72b-chat",
      "gpt3.5-turbo",
      "groq-LLaMA2",
      "groq-Mixtral",
      "skylark2-pro-4k",
      "skylark2-pro-32k"
    ]
  }),
  getters: {
    getCurrentAgent(state) {
      return state.currentAgent;
    }
  },
  actions: {
    async setCurrentAgent(data) {
      // let tips = "保存成功！";
      // if (type === "delete") {
      //   tips = "删除成功！";
      // }
      // 改为服务端更新
      // this.currentAgent.update_time = dayjs().format("YYYY-DD-MM HH:mm:ss");
      // if (type !== "id") {
      // // 兼容老数据 -- 给role_type=== "1"的角色添加cate字段 start
      // const { tool_map } = this.currentAgent;
      // if (tool_map && tool_map.length) {
      //   tool_map.forEach(t => {
      //     if (!t.cate && t.role_type && t.role_type === "1") {
      //       t.cate = "2";
      //     }
      //     const role_type = t.role_type;
      //     if (!role_type && t.cate) {
      //       if (["1", "3", "4"].includes(t.cate)) {
      //         t.role_type = "0";
      //       }
      //       if (t.cate === "2") {
      //         t.role_type = "1";
      //       }
      //     }
      //     if (t.cate === "2") {
      //       t.tool_llm = this.currentAgent.tool_llm; // 后端让补充的字段
      //     }
      //   });
      // }
      // // 兼容老数据 -- end
      // return await updateAgentTemplate(this.currentAgent).then(res => {
      //   if (res.code === 200) {
      //     ElMessage.success(tips);
      //     this.currentAgent = data;
      //     window.localStorage.setItem(
      //       "currentAgent",
      //       JSON.stringify(this.currentAgent)
      //     );
      //     return res;
      //   }
      // });
      // } else {
      //   this.currentAgent = data;
      //   window.localStorage.setItem(
      //     "currentAgent",
      //     JSON.stringify(this.currentAgent)
      //   );
      //   return data;
      // }
      this.currentAgent = data;
      window.localStorage.setItem(
        "currentAgent",
        JSON.stringify(this.currentAgent)
      );
      return data;
    },
    resetCurrentAgent() {
      this.currentAgent = initData;
    },
    persistence() {
      const current = window.localStorage.getItem("currentAgent");
      if (current) {
        this.setCurrentAgent(JSON.parse(current));
      }
    },

    // 新增/编辑tool_map的子项数据，都直接传入整个对象即可
    updateToolMapItem(data: DataItem) {
      const { uid } = data;
      if (!this.currentAgent.tool_map) {
        this.currentAgent.tool_map = [];
      }
      // 新增
      if (!uid) {
        this.currentAgent.tool_map.push({
          ...data,
          uid: generateUUID()
        });
      } else {
        // 编辑
        const index = this.currentAgent.tool_map.findIndex(i => i.uid === uid);
        if (index >= 0) {
          this.currentAgent.tool_map[index] = {
            ...data
          };
        }
      }
    }
  }
});

export function useAgentTemplateHook() {
  return useAgentTemplate(store);
}
