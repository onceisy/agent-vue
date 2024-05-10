import { http } from "@/utils/http";

type Result = {
  code: number;
  description?: string;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("get", "/getAsyncRoutes");
};
