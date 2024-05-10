import { h } from "vue";
import text from "./TextComp.vue";
import DateRange from "./DateRange.vue";
// 基础表单配置
const formConfig: any = {
  text,
  dateRange: DateRange
};

// 动态表单
export default {
  name: "InitForm",
  props: {
    data: {
      type: Object,
      required: true
    },
    form: Object
  },
  setup(props: any) {
    const type = props.data.type;
    const baseFrom = formConfig[type];
    return () => h(baseFrom, { ...props });
  }
};
