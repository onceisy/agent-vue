import { reactive, ref, watch } from "vue";
import { cloneDeep } from "lodash";
/**
 * @description: Agent引擎表单hook
 * @param {props} 表单组件的props，用于获取传入的form
 * @param {emit} 表单组件的emit，更新父组件form
 * @param {initForm} 表单默认值
 * @return {*}
 */
export default function useAgentForm({ props, emit, initForm }) {
  const formRef = ref(null);

  const form = reactive({
    ...initForm,
    ...cloneDeep(props.form)
  });

  watch(
    form,
    val => {
      emit("update:form", val);
    },
    {
      deep: true
    }
  );

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

  function resetFields() {
    if (formRef.value && formRef.value.resetFields) {
      formRef.value.resetFields();
    }
  }
  return {
    formRef,
    form,
    validate,
    resetFields
  };
}
