import { RouteRecordName } from "vue-router";

export type cacheType = {
  mode: string;
  name?: RouteRecordName;
};

export type positionType = {
  startIndex?: number;
  length?: number;
};

export type appType = {
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
    // 判断是否手动点击Collapse
    isClickCollapse: boolean;
  };
  layout: string;
  device: string;
};

export type multiType = {
  path: string;
  name: string;
  meta: any;
  query?: object;
  params?: object;
};

export type setType = {
  title: string;
  fixedHeader: boolean;
  hiddenSideBar: boolean;
};

export type userType = {
  username?: string;
  roles?: Array<string>;
  verifyCode?: string;
  currentPage?: number;
};

export interface AgentTemplateType {
  agent_id: string;
  name?: string;
  desc?: string;
  tool_map?: any[];
  uid?: string;
  tool_llm?: string;
  default_sub_tool_llm?: string;
  rag_llm?: string;
  floor?: string;
}

export interface EntityItem {
  index?: number;
  var_name: string;
  entity_name: string;
  entity_type?: number;
  value?: string;
}

export interface CondItem {
  condition: string;
  varName: string;
  value: string;
}

export interface RuleData {
  name: string;
  json_parser: string;
  json_field: string;
  rule_cate?: string | number;
  answer_prompt: string;
  cond_type: string;
  cond_group: CondItem[];
}

export interface ConditionAnswer {
  name: string;
  rule: RuleData;
}

export interface DataItem {
  /**
   * 当前节点id
   */
  uid?: string;
  collapseActiveNames?: string[];
  /**
   * 父节点id
   */
  pid?: string;
  /**
   * 角色名称
   */
  name?: string;
  value?: string;
  tool_llm?: string;
  /**
   * 是否启用变量赋值
   */
  is_enable_entity?: boolean;
  /**
   * 变量赋值的数组
   */
  entity_arr?: EntityItem[];
  /**
   * entityTypeOptions 自增变量/直接赋值/保存实体
   */
  entity_type?: number;
  /**
   * 是否启用函数服务
   */
  is_enable_function?: boolean;
  /**
   * 函数名称
   */
  function_name?: string;
  /**
   * 角色描述
   */
  desc?: string;
  /**
   * input指令
   */
  input?: string;
  /**
   * 是否开启条件策略
   */
  is_condition_answer?: boolean;
  /**
   * 条件策略数组
   */
  condition_answer_arr?: ConditionAnswer[];
  floor?: string;
  /**
   * 回答/分类
   */
  cate?: string;
  rule_cate?: string;
  /**
   * 1 全部内容输出、2 json解析
   */
  json_parser?: string;
  /**
   * json解析的字段内容
   */
  json_field?: string;
  child?: DataItem[];
  strategy_type?: string;
  answer_prompt?: string;
  skill_num?: string;
  keyboard_scene?: string;
  /**
   * LLM回答-prompt 1
   */
  llm_prompt?: string;
  /**
   * 固定话术-prompt 3
   */
  direct_answer?: string;
  /**
   * 润色回复-prompt 4
   */
  polish_prompt?: string;
  kbs?: [];
}
