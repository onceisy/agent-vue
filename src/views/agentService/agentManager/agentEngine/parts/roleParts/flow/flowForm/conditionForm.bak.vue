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
        <div class="font-bold">
          <span>条件规则</span>
          <span class="iconfont jiahao" @click="openDialog">添加规则</span>
        </div>
      </template>
    </el-form-item>
    <!-- table条件 -->
    <div class="condition-draggable">
      <el-table
        header-cell-class-name="bg-table_header"
        :data="sForm.form"
        style="width: 100%"
        row-key="name"
        border
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
        <el-table-column label="规则名称" width="180">
          <template #default="scope">
            <span>{{ scope.row.value.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="条件" width="180">
          <template #default="scope">
            <span>{{ filterCondition(scope.row.value.rule.cond_group) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <div class="flex items-center">
              <el-button
                type="primary"
                text
                size="small"
                @click="handleEdit(scope.row)"
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
    <p class="tip-p">当以上条件均不满足时，将执行「默认」分支。</p>
  </el-form>
  <!-- 点击添加规则，打开规则的弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑规则' : '添加规则'"
    append-to-body
    width="800"
  >
    <el-form
      ref="dialogFormRef"
      :model="conForm"
      label-position="top"
      :rules="rules"
    >
      <el-form-item label="规则名称" prop="name">
        <el-input
          v-model.trim="conForm.name"
          autocomplete="off"
          maxlength="50"
          show-word-limit
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item>
        <div
          class="variable-box"
          v-for="(listItem, index) in conForm.rule.cond_group"
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
            placeholder="请输入"
          />
          <span class="iconfont shanchuquan" @click="deleteCondition(index)" />
        </div>
        <div class="iconfont jiahao" @click="addCondition">添加</div>
      </el-form-item>
      <el-form-item label="执行逻辑" prop="cond_type">
        <el-radio-group v-model="conForm.rule.cond_type">
          <el-radio label="all">满足所有条件</el-radio>
          <el-radio label="any">满足任意条件</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from "vue";
import VarNameSelect from "@/components/AgentForm/VarNameSelect.vue";
import { Rank } from "@element-plus/icons-vue";
import useFlowForm from "./hooks/use-flow-form";
import { generateUUID } from "@/utils/common";
import Sortable from "sortablejs";
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
const isEdit = ref("");
const formRef = ref(null);
const formNode = ref({
  name: "条件判断",
  form: []
});
const conForm = ref({
  name: "",
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
const dialogVisible = ref(false);
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
const openDialog = () => {
  dialogVisible.value = true;
  isEdit.value = "";
  conForm.value = {
    name: "",
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
  };
};
const filterCondition = data => {
  let str = "";
  const conMap = {
    A: "为空",
    B: "不为空",
    C: "等于",
    D: "不等于",
    E: "包含",
    F: "不包含"
  };
  data.forEach(conItem => {
    if (conItem.type == "variable") {
      // 类型选择变量 展示： 变量名称+运算符+值
      str += `${conItem.var_name}${conMap[conItem.condition]}${
        conItem.value
      }，`;
    } else if (conItem.type == "llm") {
      // 类型选择LLM结果
      if (conItem.json_parser == "1") {
        // 选择全部信息 展示： LLM结果+运算符+值
        str += `LLM结果${conMap[conItem.condition]}${conItem.value}，`;
      } else {
        // 选择指定信息 展示：输入的变量名称+运算符+值
        str += `${conItem.var_name}${conMap[conItem.condition]}${
          conItem.value
        }，`;
      }
    }
  });
  return (str = str.substr(0, str.length - 1));
};
// 添加条件项
const addCondition = () => {
  conForm.value.rule.cond_group.push({
    condition: "B",
    value: "",
    var_name: "action",
    json_parser: "2",
    type: "llm"
  });
};
// 删除条件项
const deleteCondition = index => {
  conForm.value.rule.cond_group.splice(index, 1);
};
// 保存条件项
const handleSave = () => {
  dialogVisible.value = false;
  if (isEdit.value) {
    // 编辑
    sForm.value.form.forEach((item, index) => {
      if (item.id == isEdit.value) {
        sForm.value.form[index].value = conForm.value;
      }
    });
  } else {
    // 新增
    sForm.value.form.push({
      value: conForm.value,
      id: generateUUID()
    });
  }
};
// 编辑table中的某个条件
const handleEdit = row => {
  dialogVisible.value = true;
  isEdit.value = row.id || "";
  conForm.value = row.value;
};
// 删除table中的某个条件
const handleDelete = index => {
  sForm.value.form.splice(index, 1);
};
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
        const currRow = sForm.value.form.splice(oldIndex, 1)[0];
        sForm.value.form.splice(newIndex, 0, currRow);
      });
    }
  });
}
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
onMounted(() => {
  initTableRowDrag();
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
