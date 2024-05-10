<template>
  <el-select
    v-model="data"
    filterable
    allow-create
    default-first-option
    placeholder="选择变量名称"
    @change="handleChange"
    style="width: 100%"
  >
    <el-option
      v-for="(o, i) in varList"
      :key="i"
      :label="o.varname"
      :value="o.varname"
    />
  </el-select>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { useAsyncOptionsHook } from "@/store/modules/asyncOptions";

const props = defineProps({
  value: {
    type: String,
    default: ""
  }
});
const emit = defineEmits(["update:value"]);
const agentTemplateStore = useAgentTemplateHook();
const asyncOptionStore = useAsyncOptionsHook();

const data = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit("update:value", val);
  }
});

// const varList = ref([]);
const varList = computed(() => {
  return asyncOptionStore.getVarList;
});

async function handleChange(val: string) {
  const content = val.substring(0, 50).trim();
  const isHas = varList.value.find(i => i.varname === content);
  if (!isHas) {
    asyncOptionStore.updateVarListByAgent({
      varname: content,
      agent_id: agentTemplateStore.getCurrentAgent.agent_id
    });
  }
}

watch(
  () => agentTemplateStore.getCurrentAgent.agent_id,
  async val => {
    if (val) {
      await asyncOptionStore.queryVarListByAgent(val);
    }
  },
  {
    immediate: true
  }
);
</script>
