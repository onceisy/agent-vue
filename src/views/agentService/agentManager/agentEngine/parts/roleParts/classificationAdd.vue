<template>
  <div>
    <el-drawer
      v-model="drawerVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      direction="rtl"
      :show-close="false"
      size="50%"
      class="custom-drawer"
      append-to-body
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h4 class="text-text_color_black text-base font-medium">
            {{ form.uid ? "编辑" : "添加" }}Agent分类角色
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
      </template>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import SceneInfoForm from "@/components/AgentForm/SceneInfoForm.vue";
import ScenePreAction from "@/components/AgentForm/ScenePreAction.vue";
import { cloneDeep } from "lodash";
import { DataItem } from "@/store/modules/types";

defineOptions({
  name: "classificationAdd"
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  form: {
    type: Object as () => DataItem,
    default: () => ({} as DataItem)
  },
  toolMaps: {
    type: Array,
    default() {
      return [];
    }
  }
});

// // 场景信息
// const sceneInfoRef = ref(null);
// const sceneInfoForm = ref({
//   name: "",
//   desc: "",
//   input: ""
// });

// // 场景前置动作
// const preActionRef = ref(null);
// const preActionForm = ref({
//   is_enable_function: false,
//   is_enable_entity: false,
//   entity_type: 1,
//   function_name: "",
//   entity_arr: []
// });

let copiedForm = {} as DataItem;

watch(
  () => props.form,
  () => {
    copiedForm = cloneDeep(props.form);
  }
);

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
      entity_arr: props.form.entity_arr || [],
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

async function handleSaveAnswerModel() {
  const pass1 = await sceneInfoRef.value.validate();
  const pass2 = await preActionRef.value.validate();
  if (pass1 && pass2) {
    emit("updateInfo", copiedForm);
  }
}
</script>

<style lang="scss" scoped></style>
