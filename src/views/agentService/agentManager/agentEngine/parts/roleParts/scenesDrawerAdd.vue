<template>
  <div>
    <el-drawer
      v-model="drawerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      direction="rtl"
      :show-close="false"
      size="800"
      append-to-body
      class="custom-drawer"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h4 class="text-text_color_black text-base font-medium">
            {{ form.uid ? "编辑" : "添加" }}Agent回答场景
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
          <SceneInfoForm
            type="scenes"
            ref="sceneInfoRef"
            v-model:form="sceneInfoForm"
          />
        </div>
        <div class="mt-5">
          <ScenePreAction ref="preActionRef" v-model:form="preActionForm" />
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

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import SceneInfoForm from "@/components/AgentForm/SceneInfoForm.vue";
import ScenePreAction from "@/components/AgentForm/ScenePreAction.vue";
import ConditionalStrategy from "@/components/AgentForm/ConditionalStrategy.vue";
import StandardStrategy from "@/components/AgentForm/StandardStrategy.vue";
import { cloneDeep } from "lodash";
defineOptions({
  name: "scenesDrawerAdd"
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  form: {
    type: Object,
    default: () => ({})
  },
  toolChildMaps: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["update:visible", "updateInfo"]);
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

let copiedForm = {} as any;

watch(
  () => props.form,
  () => {
    copiedForm = cloneDeep(props.form);
  }
);

// const toolChildMaps = computed(() => {
//   const toolMap = agentTemplateStore.getCurrentAgent.tool_map || [];
//   const childMap = [];
//   toolMap.map(item => {
//     if (item.child?.length > 0) {
//       item.child.map(res => {
//         if (res.name) {
//           childMap.push(res);
//         }
//       });
//     }
//   });
//   return childMap;
// });

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
    return {
      strategy_type,
      cate: props.form.cate,
      role_type: "0",
      value: props.form.value,
      tool_llm: props.form.tool_llm,
      json_parser: props.form.json_parser,
      json_field: props.form.json_field,
      skill_num: props.form.skill_num,
      keyboard_scene: props.form.keyboard_scene,
      kbs: props.form.kbs,
      llm_prompt: props.form.llm_prompt || "",
      direct_answer: props.form.direct_answer || "",
      polish_prompt: props.form.polish_prompt || ""
    };
  },
  set(form) {
    copiedForm = {
      ...copiedForm,
      ...form
    };
  }
});
</script>

<style lang="scss" scoped></style>
