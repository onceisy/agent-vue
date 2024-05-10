<template>
  <div>
    <el-drawer
      v-model="drawerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      direction="rtl"
      append-to-body
      :show-close="false"
      size="800"
      class="custom-drawer"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h4 class="text-text_color_black text-base font-medium">
            {{ form.uid ? "编辑" : "添加" }}Agent{{
              module === "answer" ? "角色" : "场景"
            }}
          </h4>
          <div>
            <el-button @click="cancel">取消</el-button>
            <el-button type="primary" @click="handleSaveAnswerModel"
              >保存</el-button
            >
          </div>
        </div>
      </template>
      <template v-if="drawerVisible" #default>
        <div>
          <SceneInfoForm ref="sceneInfoRef" v-model:form="sceneInfoForm" />
        </div>
        <div class="mt-5">
          <ScenePreAction
            actionText="role"
            ref="preActionRef"
            v-model:form="preActionForm"
          />
        </div>
        <div class="mt-5">
          <div class="px-5 pt-5 pb-1 bg-white rounded">
            <h4 class="mb-4 text-text_color_black text-base font-medium">
              回答策略
            </h4>
            <ConditionalStrategy
              ref="conditionFormRef"
              v-model:form="conditionForm"
            />
            <StandardStrategy
              ref="standardFormRef"
              v-model:form="standardForm"
            />
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import SceneInfoForm from "@/components/AgentForm/SceneInfoForm.vue";
import ScenePreAction from "@/components/AgentForm/ScenePreAction.vue";
import ConditionalStrategy from "@/components/AgentForm/ConditionalStrategy.vue";
import StandardStrategy from "@/components/AgentForm/StandardStrategy.vue";
import type { DataItem } from "@/store/modules/types.ts";
import { cloneDeep } from "lodash";
import { watch } from "vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";

const agentTemplateStore = useAgentTemplateHook();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  form: {
    type: Object as () => DataItem,
    default: () => ({} as DataItem)
  },
  module: {
    type: String,
    default: "answer"
  },
  toolMaps: {
    type: Array,
    default() {
      return [];
    }
  }
});

const emit = defineEmits(["update:visible", "undateInfo"]);

const drawerVisible = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emit("update:visible", val);
  }
});

function cancel() {
  drawerVisible.value = false;
}

let copiedForm: DataItem = {} as DataItem;

watch(
  () => props.form,
  () => {
    copiedForm = cloneDeep(props.form);
  }
);

// 把表单保存到store
async function handleSaveAnswerModel() {
  const pass1 = await sceneInfoRef.value.validate();
  const pass2 = await preActionRef.value.validate();
  const pass3 = await standardFormRef.value.validate();
  const pass4 = await conditionFormRef.value.validate();
  if (pass1 && pass2 && pass3 && pass4) {
    emit("updateInfo", copiedForm);
  }
}
// 场景信息
const sceneInfoRef = ref(null);
const sceneInfoForm = computed({
  get() {
    return {
      name: props.form.name,
      desc: props.form.desc,
      input: props.form.input
    };
  },
  set(form) {
    copiedForm = {
      ...copiedForm,
      ...form
    };
  }
});

// 场景前置动作
const preActionRef = ref(null);
const preActionForm = computed({
  get() {
    return {
      is_enable_entity: props.form.is_enable_entity,
      entity_arr: props.form.entity_arr,
      entity_type: props.form.entity_type,
      is_enable_function: props.form.is_enable_function,
      function_name: props.form.function_name
    };
  },
  set(form) {
    copiedForm = {
      ...copiedForm,
      ...form
    };
  }
});

// 条件策略
const conditionFormRef = ref(null);
const conditionForm = computed({
  get() {
    return {
      is_condition_answer: props.form.is_condition_answer,
      condition_answer_arr: props.form.condition_answer_arr || []
    };
  },
  set(form) {
    copiedForm = {
      ...copiedForm,
      ...form
    };
  }
});
// 标准策略
const standardFormRef = ref(null);
const standardForm = computed({
  get() {
    let strategy_type = props.form.strategy_type;
    if (!strategy_type && props.form.cate) {
      if (["1", "3", "4"].includes(props.form.cate)) {
        strategy_type = "answer";
      } else {
        strategy_type = "action";
      }
    }

    // 兼容老数据value
    let llm_prompt, direct_answer, polish_prompt;
    if (props.form.cate === "1") {
      llm_prompt = props.form.value;
    }
    if (props.form.cate === "3") {
      direct_answer = props.form.value;
    }
    if (props.form.cate === "4") {
      polish_prompt = props.form.value;
    }
    return {
      strategy_type,
      cate: props.form.cate,
      value: props.form.value,
      tool_llm:
        props.form.tool_llm ||
        agentTemplateStore.getCurrentAgent.default_sub_tool_llm,
      json_parser: props.form.json_parser,
      json_field: props.form.json_field,
      skill_num: props.form.skill_num,
      keyboard_scene: props.form.keyboard_scene,
      kbs: props.form.kbs,
      llm_prompt: props.form.llm_prompt || llm_prompt || "",
      direct_answer: props.form.direct_answer || direct_answer || "",
      polish_prompt: props.form.polish_prompt || polish_prompt || ""
    };
  },
  set(form) {
    copiedForm = {
      ...copiedForm,
      ...form
    };
  }
});
// const standardForm = ref({
// // 后端没有这个字段，只是前端用来做区分
// strategy_type: "answer",
// // 回复类型
// cate: "",
// rule_cate: "",
// content: "",
// tool_llm: "",
// runse_content: "",
// answer_prompt: "",
// json_parser: "",
// json_field: "",
// skill_num: "",
// keyboard_scene: ""
// });
</script>

<style lang="scss" scoped></style>
