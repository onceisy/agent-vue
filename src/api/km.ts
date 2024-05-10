import { http } from "@/utils/http";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";

type Result = {
  code: number;
  message?: string;
  data: Array<any>;
};
const agentTemplateStore = useAgentTemplateHook();
// 新建/编辑知识库
export const saveKb = (params: Object) => {
  return http.request<Result>("post", "/agent/platform/v2/openapi/save_kb", {
    data: params,
    headers: { Apikey: agentTemplateStore.getCurrentAgent.agent_id || "" }
  });
};
// 查询知识库
export const queryKb = (params: Object) => {
  return http.request<Result>("post", "/agent/platform/v2/openapi/query_kb", {
    data: params,
    headers: { Apikey: agentTemplateStore.getCurrentAgent.agent_id || "" }
  });
};
// 删除知识库
export const deleteKb = (params: Object) => {
  return http.request<Result>("post", "/agent/platform/v2/openapi/delete_kb", {
    data: params,
    headers: { Apikey: agentTemplateStore.getCurrentAgent.agent_id || "" }
  });
};
// 新增知识点
export const saveFiles = (params: Object) => {
  return http.request<Result>("post", "/agent/platform/v2/openapi/save_files", {
    data: params,
    headers: {
      Apikey: agentTemplateStore.getCurrentAgent.agent_id || "",
      "Content-Type": "multipart/form-data"
    }
  });
};
// 查询知识点列表
export const queryFiles = (params: Object) => {
  return http.request<Result>(
    "post",
    "/agent/platform/v2/openapi/query_files",
    {
      data: params,
      headers: { Apikey: agentTemplateStore.getCurrentAgent.agent_id || "" }
    }
  );
};
// 删除知识点
export const deleteFiles = (params: Object) => {
  return http.request<Result>(
    "post",
    "/agent/platform/v2/openapi/delete_files",
    {
      data: params,
      headers: { Apikey: agentTemplateStore.getCurrentAgent.agent_id || "" }
    }
  );
};
// 修改知识点状态
export const updateFileStatus = (params: Object) => {
  return http.request<Result>(
    "post",
    "/agent/platform/v2/openapi/update_file_status",
    {
      data: params,
      headers: { Apikey: agentTemplateStore.getCurrentAgent.agent_id || "" }
    }
  );
};
