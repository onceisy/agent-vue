import { http } from "@/utils/http";

type Result = {
  code: number;
  description?: string;
  data: Array<any>;
};
// 账号管理
export const getAccountList = paramsStr => {
  return http.request<Result>("get", `/agent/manage/user${paramsStr}`);
};
export const getRoleList = paramsStr => {
  return http.request<Result>("get", `/agent/manage/role${paramsStr}`);
};
export const addAccountUser = (params: Object) => {
  return http.request<Result>("post", "/agent/manage/user", {
    data: params
  });
};
export const updateAccountUser = (params: any) => {
  const id = params.id;
  delete params.id;
  return http.request<Result>("put", `/agent/manage/user/${id}`, {
    data: params
  });
};
export const deleteAccountUser = (params: String) => {
  return http.request<Result>("delete", `/agent/manage/user/${params}`);
};
