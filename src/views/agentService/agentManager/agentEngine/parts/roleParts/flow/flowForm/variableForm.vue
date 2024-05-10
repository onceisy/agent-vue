<template>
  <el-form
    class="px-5 pt-5 pb-1 bg-white rounded"
    ref="formRef"
    :model="sForm"
    label-position="top"
    :rules="rules"
  >
    <el-form-item label="节点名称" prop="name">
      <el-input
        v-model="sForm.name"
        autocomplete="off"
        maxlength="50"
        show-word-limit
        placeholder="请输入"
      />
    </el-form-item>
    <el-form-item>
      <template #label>
        <div
          class="pre-label before:bg-primary_blue flex items-center font-bold"
        >
          <span>变量赋值</span>
        </div>
      </template>
    </el-form-item>
    <el-form-item>
      <div
        class="variable-box"
        v-for="(listItem, index) in sForm.form"
        :key="index"
      >
        <!-- 选择变量 -->
        <VarNameSelect class="mg-r-12" v-model="listItem.var_name" />
        <el-select
          class="mg-r-12"
          v-model="listItem.entity_type"
          placeholder="请选择"
          filterable
        >
          <el-option
            v-for="item in variableArr"
            :value="item.value"
            :label="item.label"
            :key="item.value"
          />
        </el-select>
        <el-select
          class="mg-r-12"
          v-if="listItem.entity_type === '1'"
          v-model="listItem.entity_name"
          placeholder="请选择"
          filterable
        >
          <el-option
            v-for="item in aiEntityList"
            :value="item.entity_id"
            :label="item.entity_desc"
            :key="item.entity_id"
          />
        </el-select>
        <el-checkbox
          class="mg-r-12"
          v-if="listItem.entity_type === '1'"
          v-model="listItem.is_array"
          label="数组"
          size="large"
        />
        <el-input
          class="mg-r-12"
          v-if="listItem.entity_type === '2'"
          v-model="listItem.value"
          autocomplete="off"
          maxlength="50"
          show-word-limit
          placeholder="请输入"
        />
        <span class="mg-r-12 normal-text" v-if="listItem.entity_type === '3'"
          >变量数值递增加1</span
        >
        <span class="iconfont shanchuquan" @click="deleteVarable(index)" />
      </div>
      <div class="iconfont jiahao" @click="addVarable">添加</div>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import useFlowForm from "./hooks/use-flow-form";
import VarNameSelect from "@/components/AgentForm/VarNameSelect.vue";
const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  id: {
    type: String,
    default: ""
  },
  aiEntityList: {
    type: Array,
    default: () => [] as any
  }
});
const formRef = ref(null);
const formNode = ref({
  name: "赋值节点",
  form: []
});
const variableArr = ref([
  { label: "保存实体", value: "1" },
  { label: "直接赋值", value: "2" },
  { label: "自增变量", value: "3" }
]);
const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
};
// 添加赋值项
const addVarable = () => {
  sForm.value.form.push({
    entity_name: "",
    entity_type: "1",
    value: "",
    var_name: "",
    is_array: false
  });
};
// 删除赋值项
const deleteVarable = index => {
  sForm.value.form.splice(index, 1);
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
.variable-box {
  display: flex;
  align-items: center;
  justify-items: center;
  width: 100%;
  margin-bottom: 12px;
}

.jiahao {
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

.normal-text {
  font-size: 14px;
  font-weight: normal;
  line-height: 22px;
  color: #303133;
}
</style>
