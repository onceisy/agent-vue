import { http } from "@/utils/http";

type Result = {
  code: number;
  description?: string;
  data: Array<any>;
  debug?: any;
  log?: any;
  message?: string;
  msg_time?: string;
  response_time?: string;
};

export const getAgentList = () => {
  return http.request<Result>("get", "/agent/all_template");
};

export const queryAgentList = (params: Object) => {
  return http.request<Result>("post", "/agent/query_agent", {
    data: params
  });
};

export const saveAgentTemplate = (params: Object) => {
  return http.request<Result>("post", "/agent/save_agent", {
    data: params
  });
};

export const copyAgentTemplate = (params: Object) => {
  return http.request<Result>("post", "/agent/copy_agent", {
    data: params
  });
};

export const queryAgentConfig = (params: Object) => {
  return http.request<Result>("post", "/agent/query_agent_config", {
    data: params
  });
};

export const queryAgentRole = (params: Object) => {
  return http.request<Result>("post", "/agent/query_agent_role", {
    data: params
  });
};

export const updateAgentTemplate = (params: Object) => {
  return http.request<Result>("post", "/agent/update_template", {
    data: params
  });
};
export const deleteAgentTemplate = (params: Object) => {
  return http.request<Result>("post", "/agent/delete_template", {
    data: params
  });
};

export const savePrompt = (params: Object) => {
  return http.request<Result>("post", "/agent/save_prompt", {
    data: params
  });
};

export const saveEngine = (params: Object) => {
  return http.request<Result>("post", "/agent/save_engine", {
    data: params
  });
};

export const saveRagConfig = (params: Object) => {
  return http.request<Result>("post", "/agent/save_rag_config", {
    data: params
  });
};

export const saveChatConfig = (params: Object) => {
  return http.request<Result>("post", "/agent/save_chat_config", {
    data: params
  });
};

export const saveAgentRole = (params: Object) => {
  return http.request<Result>("post", "/agent/save_agent_role", {
    data: params
  });
};

export const bindAgentFloor = (params: Object) => {
  return http.request<Result>("post", "/agent/bind_role_floor", {
    data: params
  });
};

export const bindCateFloor = (params: Object) => {
  return http.request<Result>("post", "/agent/bind_cate_floor", {
    data: params
  });
};

export const deleteRole = (params: Object) => {
  return http.request<Result>("post", "/agent/delete_role", {
    data: params
  });
};

export const roleSort = (params: Object) => {
  return http.request<Result>("post", "/agent/role_sort", {
    data: params
  });
};

// 获取函数列表
export const queryFunctionList = (params: Object) => {
  return http.request<Result>("get", "/agent/get_fission", { params });
};

export const queryAllAiEntity = (params: Object) => {
  return http.request<Result>("post", "/agent/query_all_ai_entity", {
    data: params
  });
};
export const queryVarListByAgent = (params: Object) => {
  return http.request<Result>("get", "/agent/varlist", { params });
};
export const createFission = (params: Object) => {
  return http.request<Result>("post", "/agent/create_fission", {
    data: params
  });
};
export const putFission = (params: Object) => {
  return http.request<Result>("put", "/agent/put_fission", { data: params });
};
export const getFission = (params: { id: string }) => {
  return http.request<Result>(
    "get",
    "/agent/get_single_fission?id=" + params?.id
  );
};
export const deleteFission = (params: Object) => {
  return http.request<Result>("delete", "/agent/delete_fission", {
    data: params
  });
};
export const addVarListByAgent = (params: Object) => {
  return http.request<Result>("post", "/agent/varlist", { data: params });
};
export const getAiEntity = (params: Object) => {
  return http.request<Result>("post", "/agent/query_all_ai_entity", {
    data: params
  });
};
export const saveEntity = (params: Object) => {
  return http.request<Result>("post", "/agent/edit_ai_entity", {
    data: params
  });
};
export const delEntity = (params: Object) => {
  return http.request<Result>("post", "/agent/delete_ai_entity", {
    data: params
  });
};
export const getLogList = (params: Object) => {
  return http.request<Result>("post", "/agent/query_session_log", {
    data: params
  });
};
export const getLogDetail = (params: Object) => {
  return http.request<Result>("post", "/agent/query_all_session_detail", {
    data: params
  });
};
export const queryLlm = (params: Object) => {
  return http.request<Result>("post", "/agent/query_llm", {
    data: params
  });
};
export const queryWithHistory = (params: Object) => {
  return http.request<Result>("post", "/agent/query_with_history", {
    data: params
  });
};
export const saveFlow = (params: Object) => {
  return http.request<Result>("post", "/agent/save_flow", {
    data: params
  });
};
export const upFlow = (params: Object) => {
  return http.request<Result>("post", "/agent/up_flow", {
    data: params
  });
};
export const updateRoleStatus = (params: Object) => {
  return http.request<Result>("post", "/agent/update_role_status", {
    data: params
  });
};
export const saveGuidance = (params: Object) => {
  return http.request<Result>("post", "/agent/save_guidance", {
    data: params
  });
};
export const queryGuidanceList = (params: Object) => {
  return http.request<Result>("post", "/agent/query_guidance_list", {
    data: params
  });
};
export const guidanceSort = (params: Object) => {
  return http.request<Result>("post", "/agent/guidance_sort", {
    data: params
  });
};
