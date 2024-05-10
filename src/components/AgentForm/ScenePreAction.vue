<template>
  <el-form ref="formRef" :model="form" label-position="left">
    <div class="px-5 pt-5 pb-1 bg-white rounded">
      <h4
        v-if="type !== 'engine'"
        class="mb-5 text-text_color_black text-base font-medium"
      >
        {{ actionText === "role" ? "角色前置动作" : "场景前置动作" }}
      </h4>
      <el-form-item>
        <template #label>
          <div class="pre-label before:bg-primary_blue flex items-center">
            <span>变量赋值</span>
          </div>
        </template>
        <el-switch v-model="form.is_enable_entity" />
      </el-form-item>
      <!-- 变量类型选项 -->
      <div v-show="form.is_enable_entity" style="margin-bottom: 10px">
        <el-row
          :gutter="12"
          v-for="(item, index) in form.entity_arr"
          :key="index"
        >
          <el-col :span="5">
            <!-- 实体 -->
            <el-form-item>
              <VarNameSelect v-model="form.entity_arr[index].var_name" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item>
              <el-select
                v-model="form.entity_arr[index].entity_type"
                placeholder="请选择"
              >
                <el-option
                  v-for="(item, index) in entityTypeOptions"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="form.entity_arr[index].entity_type === 1" :span="10">
            <el-form-item>
              <el-select
                v-model="form.entity_arr[index].entity_name"
                placeholder="请选择实体"
              >
                <el-option
                  v-for="option in asyncOptionStore.getAllAiEntity"
                  :key="option.entity_id"
                  :label="
                    option.entity_id.startsWith('system_ent')
                      ? option.entity_desc
                      : option.entity_name
                  "
                  :value="option.entity_id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col v-show="form.entity_arr[index].entity_type === 1" :span="5">
            <el-form-item>
              <el-select
                v-model="form.entity_arr[index].region_num"
                placeholder="请选择"
              >
                <el-option label="Zone one" value="shanghai" />
                <el-option label="Zone two" value="beijing" />
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col v-show="form.entity_arr[index].entity_type === 2" :span="10">
            <el-form-item>
              <el-input
                v-model="form.entity_arr[index].value"
                placeholder="输入常量"
              />
            </el-form-item>
          </el-col>
          <el-col v-show="form.entity_arr[index].entity_type === 3" :span="10">
            <el-form-item>
              <p>变量数量递增加1。</p>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item>
              <div
                v-show="form.entity_arr.length > 1"
                class="h-8 cursor-pointer flex items-center"
                @click="removeEntityItem(index)"
              >
                <el-icon size="18"><Remove /></el-icon>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <div>
          <el-button type="primary" text :icon="Plus" @click="addEntityItem">
            添加
          </el-button>
        </div>
      </div>
      <el-form-item>
        <template #label>
          <div class="pre-label before:bg-primary_blue flex items-center">
            <span>函数服务</span>
          </div>
        </template>
        <el-switch v-model="form.is_enable_function" />
      </el-form-item>
      <div v-show="form.is_enable_function" style="margin-bottom: 10px">
        <el-form-item>
          <el-select v-model="form.function_name" placeholder="请选择">
            <el-option
              v-for="func in asyncOptionStore.getFuncOptions"
              :key="func.id"
              :label="func.otherName"
              :value="func.name"
            />
          </el-select>
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { Remove, Plus } from "@element-plus/icons-vue";
import useAgentForm from "./hooks/use-agent-form";
import { entityTypeOptions } from "@/constant/options";
import { useAsyncOptionsHook } from "@/store/modules/asyncOptions";
import VarNameSelect from "./VarNameSelect.vue";
import { watch } from "vue";
import { cloneDeep } from "lodash";

const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: ""
  },
  actionText: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["update:form"]);

const asyncOptionStore = useAsyncOptionsHook();

const initForm = {
  is_enable_function: false,
  is_enable_entity: false,
  entity_type: 1,
  function_name: "",
  entity_arr: []
};

const { formRef, form, validate } = useAgentForm({ props, emit, initForm });

const entityItem = {
  // 实体
  var_name: "",
  // 变量
  entity_name: "",
  // region_num: "",
  value: "",
  entity_type: 1
};

function addEntityItem() {
  form.entity_arr.push({
    ...entityItem
  });
}

function removeEntityItem(index: number) {
  form.entity_arr.splice(index, 1);
}

watch(
  () => form.is_enable_entity,
  val => {
    if (val && !form.entity_arr.length) {
      form.entity_arr.push(cloneDeep(entityItem));
    }
  }
);

defineExpose({
  validate
});
</script>

<style lang="scss" scoped>
.pre-label::before {
  display: inline-block;
  width: 4px;
  height: 16px;
  margin-right: 8px;
  content: "";
}

.el-select {
  width: 100%;
}
</style>
