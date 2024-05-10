<template>
  <div>
    <el-form ref="formRef" :model="conditionForm" label-position="left">
      <el-form-item>
        <template #label>
          <div class="pre-label before:bg-primary_blue flex items-center">
            <span>条件策略</span>
          </div>
        </template>
        <el-switch v-model="conditionForm.is_condition_answer" />
      </el-form-item>
    </el-form>
    <div v-show="conditionForm.is_condition_answer">
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-bold text-sm text-text_color_black2">条件规则</h4>
        <el-button type="primary" text :icon="Plus" @click="handleAddRule">
          添加规则
        </el-button>
      </div>
      <div class="condition-draggable">
        <el-table
          header-cell-class-name="bg-table_header"
          :data="conditionForm.condition_answer_arr"
          style="width: 100%"
          row-key="name"
        >
          <el-table-column label="排序" width="80">
            <template #default>
              <span class="drag-icon">
                <el-icon style="cursor: move">
                  <Rank />
                </el-icon>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="规则名称" width="180" />
          <el-table-column label="条件" width="180">
            <template #default="scope">
              <span>{{ showRuleText(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="回复策略">
            <template #default="scope">
              <span>{{ showRuleCateText(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="话术">
            <template #default="scope">
              <el-tooltip
                effect="dark"
                placement="top-start"
                popper-class="max-w-xs"
                :content="showPromptText(scope.row)"
              >
                <el-text class="agent-name" truncated>
                  {{ showPromptText(scope.row) }}
                </el-text>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <div class="flex items-center">
                <el-button
                  type="primary"
                  text
                  size="small"
                  @click="handleEdit(scope.$index, scope.row)"
                  >编辑</el-button
                >
                <el-button
                  size="small"
                  type="danger"
                  text
                  @click="handleDelete(scope.$index)"
                  >删除</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 添加规则 -->
    <el-drawer
      v-model="drawerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      direction="rtl"
      :show-close="false"
      size="50%"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h4 class="text-text_color_black text-base font-medium">添加规则</h4>
          <div>
            <el-button @click="cancel">取消</el-button>
            <el-button type="primary" @click="saveRule">保存</el-button>
          </div>
        </div>
      </template>
      <template v-if="drawerVisible" #default>
        <div class="px-5 pt-5 pb-1 bg-white rounded">
          <el-form
            ref="subFormRef"
            :model="subForm"
            :rules="subFormRules"
            label-position="top"
          >
            <el-form-item prop="name" label="规则名称">
              <el-input
                v-model="subForm.name"
                autocomplete="off"
                maxlength="50"
                show-word-limit
                placeholder="请输入"
              />
            </el-form-item>

            <el-row :gutter="12">
              <el-form-item prop="rule.cond_group">
                <template #label>
                  <div class="font-bold inline-block">
                    <span>条件</span>
                  </div>
                </template>
                <div style="min-width: 100px; height: 1px" />
              </el-form-item>
            </el-row>
            <el-row
              :gutter="12"
              v-for="(item, index) in subForm.rule.cond_group"
              :key="index"
            >
              <el-col :span="1">
                <el-form-item>
                  {{ (index + 1).toString() + "：" }}</el-form-item
                >
              </el-col>
              <!-- 变量 -->
              <el-col :span="7">
                <el-form-item>
                  <VarNameSelect v-model="item.varName" />
                </el-form-item>
              </el-col>
              <!-- 条件 -->
              <el-col :span="7">
                <el-form-item>
                  <el-select
                    v-model="item.condition"
                    class="mr-5"
                    placeholder="选择运算符"
                    style="width: 240px"
                  >
                    <el-option
                      v-for="(i, index) in conditionRule"
                      :key="index"
                      :label="i.label"
                      :value="i.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col v-show="['C', 'D'].includes(item.condition)" :span="8">
                <el-form-item>
                  <el-input
                    v-model="item.value"
                    autocomplete="off"
                    placeholder="请输入"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="1">
                <div
                  v-show="subForm.rule.cond_group.length > 1"
                  class="flex items-center h-8 cursor-pointer"
                  @click="handleRemoveCondition(index)"
                >
                  <el-icon class="delIcon"><Remove /></el-icon>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="12">
              <div class="pb-4">
                <el-button
                  type="primary"
                  text
                  :icon="Plus"
                  @click="handleAddCondition"
                >
                  添加条件
                </el-button>
              </div>
            </el-row>
            <el-row :gutter="12">
              <el-form-item label="执行逻辑">
                <el-radio-group v-model="subForm.rule.cond_type">
                  <el-radio :label="CondType.ALL">满足所有条件</el-radio>
                  <el-radio :label="CondType.ANY">满足任意条件</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-row>
          </el-form>
          <StandardStrategy
            ref="standardFormRef"
            isConditionModule
            v-model:form="standardForm"
            :showTitle="false"
          />
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from "vue";
import { Plus, Remove, Rank } from "@element-plus/icons-vue";
import StandardStrategy from "./StandardStrategy.vue";
import useAgentForm from "./hooks/use-agent-form";
import { conditionRule, cateTypes } from "@/constant/options";
import { cloneDeep } from "lodash";
import VarNameSelect from "./VarNameSelect.vue";
import { ElMessage } from "element-plus";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import Sortable from "sortablejs";
import { onMounted } from "vue";

const agentTemplateStore = useAgentTemplateHook();

const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:form"]);
// 当前正在编辑的条件策略的索引 -1 新增 其他-
let editIndex = -1;
const initForm = {
  is_condition_answer: true,
  condition_answer_arr: []
};

const {
  formRef,
  form: conditionForm,
  validate
} = useAgentForm({ props, emit, initForm });

function handleAddRule() {
  editIndex = -1;
  subForm.value = cloneDeep(subInitForm);
  drawerVisible.value = true;
}

function handleDelete(index) {
  conditionForm.condition_answer_arr.splice(index, 1);
}

function handleEdit(index, row) {
  editIndex = index;
  console.log("row-------");
  console.log(row);

  subForm.value = cloneDeep({
    ...subInitForm,
    ...row
  });
  drawerVisible.value = true;
}

const drawerVisible = ref(false);

// 保存规则，关闭弹窗
async function saveRule() {
  const newForm = {
    name: subForm.value.name,
    rule: {
      ...subForm.value.rule,
      ...copiedStandardForm
    }
  };
  const { condition_answer_arr = [] } = conditionForm;
  const isHas = condition_answer_arr.find(i => i.name === newForm.name);
  if (isHas && editIndex === -1) {
    ElMessage.error("规则名称不可重复！");
    return;
  }
  delete newForm.rule.cate;
  delete newForm.rule.value;
  try {
    const passed1 = await subFormRef.value.validate();
    const passed2 = await standardFormRef.value.validate();
    if (passed1 && passed2) {
      if (editIndex === -1) {
        conditionForm.condition_answer_arr.unshift(newForm);
      } else {
        conditionForm.condition_answer_arr.splice(editIndex, 1, newForm);
      }
      subFormRef.value.resetFields();
      standardFormRef.value.resetFields();
      cancel();
    }
  } catch (error) {
    console.log(error);
  }
}
function cancel() {
  drawerVisible.value = false;
}

enum CondType {
  ALL = "all",
  ANY = "any"
}
const subFormRef = ref(null);
const subCondition = {
  varName: "",
  condition: "",
  value: ""
};

const subInitForm = {
  name: "",
  rule: {
    cond_group: [
      {
        varName: "",
        value: "",
        condition: ""
      }
    ],
    cond_type: "all",
    json_parser: "",
    json_field: "",
    name: "",
    rule_cate: "",
    // ...
    strategy_type: "",
    tool_llm: "",
    keyboard_scene: "",
    skill_num: "",
    llm_prompt: "",
    direct_answer: "",
    polish_prompt: "",
    answer_prompt: ""
  }
};

const subForm = ref(cloneDeep(subInitForm));
const subFormRules = {
  "rule.cond_group": [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value && value.length) {
          callback();
        } else {
          callback(new Error("请添加条件"));
        }
      },
      trigger: "blur",
      required: true
    }
  ]
};
function handleAddCondition() {
  subForm.value.rule.cond_group.push({ ...subCondition });
}
function handleRemoveCondition(index: number) {
  subForm.value.rule.cond_group.splice(index, 1);
}

// 标准策略
const standardFormRef = ref(null);
// 这个对象用来暂存修改后的 标准策略组件数据，点击确定后再更新到条件策略
let copiedStandardForm: any = {};
const standardForm = computed({
  get() {
    const { rule } = subForm.value;
    // 兼容老数据
    let strategy_type = props.form.strategy_type;
    if (!strategy_type && props.form.rule_cate) {
      if (["1", "3", "4"].includes(props.form.rule_cate)) {
        strategy_type = "answer";
      } else {
        strategy_type = "action";
      }
    }
    // 兼容老数据answer_prompt
    let llm_prompt, direct_answer, polish_prompt;
    if (rule.rule_cate === "1") {
      llm_prompt = rule.answer_prompt;
    }
    if (rule.rule_cate === "3") {
      direct_answer = rule.answer_prompt;
    }
    if (rule.rule_cate === "4") {
      polish_prompt = rule.answer_prompt;
    }

    return {
      strategy_type: strategy_type || "answer",
      rule_cate: rule.rule_cate || "1",
      tool_llm:
        rule.tool_llm ||
        agentTemplateStore.getCurrentAgent.default_sub_tool_llm ||
        "",
      json_parser: rule.json_parser || "1",
      json_field: rule.json_field || "",
      skill_num: rule.skill_num || "",
      keyboard_scene: rule.keyboard_scene || "",
      llm_prompt: rule.llm_prompt || llm_prompt || "",
      direct_answer: rule.direct_answer || direct_answer || "",
      polish_prompt: rule.polish_prompt || polish_prompt || ""
    };
  },
  set(form) {
    console.log("form------");
    console.log(form);

    copiedStandardForm = {
      ...copiedStandardForm,
      ...form
    };
  }
});
// const standardForm = {
//   answerStrategy: "answer",
//   rule_cate: "",
//   content: "",
//   answer_model: "",
//   runse_content: "",
//   answer_tips: "",
//   json_parser: "",
//   json_field: "",
//   jnz: "",
//   press_action: ""
// };

// 显示条件策略的文本信息
function showRuleText(row: any) {
  console.log(row);
  let text = "";
  const cond_group = row.rule ? row.rule.cond_group || [] : [];
  console.log(cond_group);
  cond_group.forEach(i => {
    const { condition, value, varName } = i;
    let ruleLabel = "";
    const rule = conditionRule.find(c => c.value === condition);
    if (rule) ruleLabel = rule.label;
    text += `${varName} ${ruleLabel} ${value},`;
  });
  return text.substring(0, text.length - 1);
}

function showRuleCateText(row: any) {
  const allTypes = [];
  cateTypes.forEach(c => allTypes.push(...c.options));
  const type = allTypes.find(i => i.value === row.rule.rule_cate) || {
    label: ""
  };
  return type.label || "";
}

function showPromptText(row: any) {
  const { rule_cate, llm_prompt, direct_answer, polish_prompt, answer_prompt } =
    row.rule || {};
  let text = "";
  switch (rule_cate) {
    case "1":
      text = llm_prompt;
      break;
    case "3":
      text = direct_answer;
      break;
    case "4":
      text = polish_prompt;
      break;
    default:
      break;
  }
  if (!text && answer_prompt) {
    text = answer_prompt;
  }
  return text || "";
}
// 表格行拖拽
function initTableRowDrag() {
  // 要拖拽元素的父容器
  const tbody: HTMLElement = document.querySelector(
    ".condition-draggable .el-table__body-wrapper tbody"
  );
  Sortable.create(tbody, {
    //  可被拖拽的子元素
    draggable: ".condition-draggable .el-table__row",
    onEnd({ newIndex, oldIndex }) {
      if (newIndex === oldIndex) {
        return;
      }
      nextTick(() => {
        const currRow = conditionForm.condition_answer_arr.splice(
          oldIndex,
          1
        )[0];
        conditionForm.condition_answer_arr.splice(newIndex, 0, currRow);
      });
    }
  });
}
onMounted(() => {
  initTableRowDrag();
});

defineExpose({
  validate
});
</script>
