export function generateUUID() {
  const array = new Uint32Array(4);
  window.crypto.getRandomValues(array);
  return Array.from(array, value => value.toString(16).padStart(8, "0")).join(
    "-"
  );
}
export const getAppId = () => {
  return "68abbfa2de722a659b1c875c9c7d1a22";
};
/**
 * @description: 生成回答角色初始数据
 * @param {*} param1
 * @return {*}
 */
export function generateDataItem({ pid, role_type = undefined }) {
  return {
    name: "",
    desc: "",
    input: "",
    is_enable_entity: false,
    entity_arr: [],
    entity_type: "",
    is_enable_function: false,
    function_name: "",
    is_condition_answer: false,
    condition_answer_arr: [],
    strategy_type: "answer",
    cate: "1",
    value: "",
    tool_llm: "minimax",
    json_parser: "1",
    json_field: "",
    skill_num: "",
    keyboard_scene: "",
    pid,
    role_type
  };
}
export const convert_bytes = (byte_size: number | undefined) => {
  if (byte_size == undefined) {
    return "0K";
  }
  if (byte_size < 1024) {
    return byte_size.toFixed(1) + "K";
  }
  const kb_size = byte_size / 1024;
  if (kb_size < 1024) {
    return kb_size.toFixed(1) + "KB";
  }
  const mb_size = kb_size / 1024;
  if (mb_size < 1024) {
    return mb_size.toFixed(1) + "MB";
  }
  const gb_size = mb_size / 1024;
  return gb_size.toFixed(1) + "GB";
};
