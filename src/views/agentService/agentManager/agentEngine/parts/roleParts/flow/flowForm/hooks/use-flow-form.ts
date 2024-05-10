import { watch } from "vue";
import { cloneDeep } from "lodash";
/**
 * @description: 所有流程节点的表单校验hook
 * @return {*}
 */
export default function useFlowForm({ props, formRef, formNode }) {
  /**
   * @description: 校验表单
   * @return {*}
   */
  async function validate() {
    if (formRef.value && formRef.value.validate) {
      return await formRef.value.validate(valid => {
        return Promise.resolve(valid || false);
      });
    } else {
      return Promise.resolve(false);
    }
  }
  function getForm() {
    return cloneDeep(formNode.value);
  }
  // 重置表单状态
  function resetFields() {
    if (formRef.value && formRef.value.resetFields) {
      formRef.value.resetFields();
    }
  }
  watch(
    () => props.id,
    () => {
      const propsForm = cloneDeep(props.form);
      Object.keys(propsForm).forEach(key => {
        formNode.value[key] = propsForm[key];
      });
    },
    {
      immediate: true
    }
  );
  return {
    formNode,
    getForm,
    validate,
    resetFields
  };
}
