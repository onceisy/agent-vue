<template>
  <el-form
    ref="formRef"
    class="px-5 pt-5 pb-1 bg-white rounded"
    :model="sForm"
    label-position="top"
    :rules="rules"
  >
    <el-form-item label="规则名称" prop="name">
      <el-input
        v-model.trim="sForm.name"
        autocomplete="off"
        maxlength="50"
        show-word-limit
        placeholder="请输入"
      />
    </el-form-item>
    <el-form-item label="规则类型" prop="rule_type">
      <el-radio-group v-model="sForm.rule_type">
        <el-radio label="custom">自定义</el-radio>
        <el-radio label="default">默认兜底</el-radio>
      </el-radio-group>
    </el-form-item>
    <p class="tip-p" v-if="sForm.rule_type === 'default'">
      当自定义规则均不满足时，将执行「默认兜底」分支。
    </p>
    <template v-if="sForm.rule_type === 'custom'">
      <el-form-item>
        <div
          class="variable-box"
          v-for="(listItem, index) in sForm.rule.cond_group"
          :key="index"
        >
          <el-select
            class="mg-r-12"
            v-model="listItem.type"
            placeholder="请选择"
            filterable
          >
            <el-option
              v-for="item in typeArr"
              :value="item.value"
              :label="item.label"
              :key="item.value"
            />
          </el-select>
          <!-- 选择变量 -->
          <VarNameSelect
            class="mg-r-12"
            v-if="listItem.type == 'variable'"
            v-model="listItem.var_name"
          />
          <el-select
            class="mg-r-12"
            v-model="listItem.json_parser"
            placeholder="请选择"
            v-if="listItem.type == 'llm'"
            filterable
          >
            <el-option
              v-for="item in parseArr"
              :value="item.value"
              :label="item.label"
              :key="item.value"
            />
          </el-select>
          <!-- 选择指定信息 -->
          <el-input
            class="mg-r-12"
            v-if="listItem.json_parser == '2' && listItem.type != 'variable'"
            v-model="listItem.var_name"
            autocomplete="off"
            placeholder="请输入"
          />
          <el-select
            class="mg-r-12"
            v-model="listItem.condition"
            placeholder="请选择运算符"
            filterable
          >
            <el-option
              v-for="item in condArr"
              :value="item.value"
              :label="item.label"
              :key="item.value"
            />
          </el-select>
          <!-- 为空 || 不为空 不展示输入框 -->
          <el-input
            class="mg-r-12"
            v-if="!['A', 'B'].includes(listItem.condition)"
            v-model="listItem.value"
            autocomplete="off"
            maxlength="50"
            show-word-limit
            :placeholder="
              ['E', 'F'].includes(listItem.condition)
                ? '多值以##隔开'
                : '请输入'
            "
          />
          <span class="iconfont shanchuquan" @click="deleteCondition(index)" />
        </div>
        <div class="iconfont jiahao" @click="addCondition">添加</div>
      </el-form-item>
      <el-form-item label="执行逻辑" prop="cond_type">
        <el-radio-group v-model="sForm.rule.cond_type">
          <el-radio label="all">满足所有条件</el-radio>
          <el-radio label="any">满足任意条件</el-radio>
        </el-radio-group>
      </el-form-item>
    </template>
  </el-form>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import VarNameSelect from "@/components/AgentForm/VarNameSelect.vue";
import useFlowForm from "./hooks/use-flow-form";
const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  id: {
    type: String,
    default: ""
  }
});
const formRef = ref(null);
const formNode = ref({
  name: "",
  rule_type: "custom",
  rule: {
    cond_group: [
      {
        condition: "B",
        value: "",
        var_name: "action",
        json_parser: "2",
        type: "llm"
      }
    ],
    cond_type: "all"
  }
});
const condArr = ref([
  { label: "为空", value: "A" },
  { label: "不为空", value: "B" },
  { label: "等于", value: "C" },
  { label: "不等于", value: "D" },
  { label: "包含", value: "E" },
  { label: "不包含", value: "F" }
]);
const typeArr = ref([
  { label: "变量", value: "variable" },
  { label: "LLM结果", value: "llm" }
]);
const parseArr = ref([
  { label: "全部信息", value: "1" },
  { label: "指定信息", value: "2" }
]);
const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  func: [{ required: true, message: "请输入场景描述", trigger: "change" }]
};
// 添加条件项
const addCondition = () => {
  sForm.value.rule.cond_group.push({
    condition: "B",
    value: "",
    var_name: "action",
    json_parser: "2",
    type: "llm"
  });
};
// 删除条件项
const deleteCondition = index => {
  sForm.value.rule.cond_group.splice(index, 1);
};
const {
  validate,
  resetFields,
  formNode: sForm,
  getForm
} = useFlowForm({ props, formRef, formNode });
defineExpose({
  validate,
  resetFields,
  getForm
});
</script>
<style lang="scss" scoped>
.tip-p {
  height: 32px;
  margin: 20px 0;
  font-size: 14px;
  font-weight: normal;
  line-height: 32px;
  color: #303133;
  text-indent: 1em;
  background: #ecf5ff;
  border-left: 3px solid #409eff;
  border-radius: 4px;
}

.variable-box {
  display: flex;
  align-items: center;
  justify-items: center;
  width: 100%;
  margin-bottom: 12px;
}

.jiahao {
  float: right;
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
}

.shanchuquan {
  font-size: 14px;
  color: #909399;
  cursor: pointer;
}

.mg-r-12 {
  flex: 1;
  margin-right: 12px;
}
</style>
