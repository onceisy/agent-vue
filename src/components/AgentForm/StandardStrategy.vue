<template>
  <el-form
    ref="formRef"
    :model="sForm"
    :rules="rules"
    label-position="left"
    scroll-to-error
  >
    <div class="bg-white rounded">
      <el-form-item>
        <template v-if="showTitle" #label>
          <div
            class="pre-label before:bg-primary_blue flex items-center font-bold"
          >
            <span>标准策略</span>
          </div>
        </template>
      </el-form-item>
      <el-form-item>
        <template #label>
          <div class="flex items-center">
            <svg class="icon text-base" aria-hidden="true">
              <use xlink:href="#celveleixing" />
            </svg>
            <span class="ml-1">策略类型</span>
          </div>
        </template>
        <el-radio-group v-model="sForm.strategy_type">
          <el-radio
            v-for="(o, index) in strategyTypes"
            :key="index"
            :label="o.value"
            border
            >{{ o.label }}</el-radio
          >
        </el-radio-group>
      </el-form-item>
      <div v-show="isAnswerType">
        <el-form-item>
          <template #label>
            <div class="flex items-center">
              <svg class="icon text-base" aria-hidden="true">
                <use xlink:href="#huifuleixing" />
              </svg>
              <span class="ml-1">回复类型</span>
            </div>
          </template>
          <el-radio-group v-if="!isConditionModule" v-model="sForm.cate">
            <el-radio
              v-for="o in answerType"
              :key="o.label + o.value"
              :label="o.value"
              border
              >{{ o.label }}</el-radio
            >
          </el-radio-group>
          <el-radio-group v-else v-model="sForm.rule_cate">
            <el-radio
              v-for="(o, index) in answerType"
              :key="index"
              :label="o.value"
              border
              >{{ o.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
      </div>
      <div
        v-show="isAnswerType && (sForm.cate === '3' || sForm.rule_cate === '3')"
      >
        <el-form-item prop="direct_answer">
          <slot name="label">
            <div class="label-div">
              <span>话术内容</span>
              <span
                class="iconfont quanping"
                @click="openInputDialog('direct_answer')"
              />
            </div>
          </slot>
          <el-input
            v-model="sForm.direct_answer"
            :rows="3"
            type="textarea"
            maxlength="5000"
            show-word-limit
            placeholder="请输入话术内容"
          />
        </el-form-item>
      </div>
      <div
        v-show="isAnswerType && (sForm.cate === '4' || sForm.rule_cate === '4')"
      >
        <el-form-item>
          <template #label>
            <div class="flex items-center">
              <svg class="icon text-base" aria-hidden="true">
                <use xlink:href="#huidamoxing" />
              </svg>
              <span class="ml-1">回答模型</span>
            </div>
          </template>
          <el-select v-model="sForm.tool_llm" placeholder="请选择">
            <el-option
              v-for="(option, index) in agentTemplateStore.modelEnum"
              :key="index"
              :label="option"
              :value="option"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="polish_prompt">
          <slot name="label">
            <div class="label-div">
              <span>润色内容</span>
              <span
                class="iconfont quanping"
                @click="openInputDialog('polish_prompt')"
              />
            </div>
          </slot>
          <el-input
            v-model="sForm.polish_prompt"
            :rows="3"
            type="textarea"
            maxlength="5000"
            show-word-limit
            placeholder="请输入润色内容"
          />
        </el-form-item>
      </div>
      <div
        v-show="isAnswerType && (sForm.cate === '1' || sForm.rule_cate === '1')"
      >
        <el-form-item label="回答模型">
          <template #label>
            <div class="flex items-center">
              <svg class="icon text-base" aria-hidden="true">
                <use xlink:href="#huidamoxing" />
              </svg>
              <span class="ml-1">回答模型</span>
            </div>
          </template>
          <el-select v-model="sForm.tool_llm" placeholder="请选择">
            <el-option
              v-for="(option, index) in agentTemplateStore.modelEnum"
              :key="index"
              :label="option"
              :value="option"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="llm_prompt">
          <slot name="label">
            <div class="label-div">
              <span>回答提示词</span>
              <span
                class="iconfont quanping"
                @click="openInputDialog('llm_prompt')"
              />
            </div>
          </slot>
          <el-input
            v-model="sForm.llm_prompt"
            :rows="3"
            type="textarea"
            maxlength="5000"
            show-word-limit
            placeholder="请输入回答提示词"
          />
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="sForm.json_parser">
            <el-radio-button label="1">全部内容输出</el-radio-button>
            <el-radio-button label="2">Json解析</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="json_field">
          <el-input
            v-show="
              isAnswerType &&
              (sForm.cate === '1' || sForm.rule_cate === '1') &&
              sForm.json_parser === '2'
            "
            v-model="sForm.json_field"
            placeholder="请输入参数名称"
          />
        </el-form-item>
      </div>
      <!-- Action 类型 -->
      <div v-show="!isAnswerType">
        <el-form-item label="回复类型">
          <template #label>
            <div class="flex items-center">
              <svg class="icon text-base" aria-hidden="true">
                <use xlink:href="#huifuleixing" />
              </svg>
              <span class="ml-1">回复类型</span>
            </div>
          </template>
          <el-radio-group v-if="!isConditionModule" v-model="sForm.cate">
            <el-radio
              v-for="o in answerType"
              :key="o.label + o.value"
              :label="o.value"
              border
              >{{ o.label }}</el-radio
            >
          </el-radio-group>
          <el-radio-group v-else v-model="sForm.rule_cate">
            <el-radio
              v-for="(o, index) in answerType"
              :key="index"
              :label="o.value"
              border
              >{{ o.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <!-- 优先技能组 -->
        <el-form-item
          v-show="sForm.cate === '5' || sForm.rule_cate === '5'"
          label="优先技能组"
        >
          <el-input
            v-model="sForm.skill_num"
            autocomplete="off"
            maxlength="50"
            show-word-limit
            placeholder="请输入优先技能组编号，为空则转默认技能组"
          />
        </el-form-item>
        <p
          class="mb-3 text-sm"
          v-show="sForm.cate === '2' || sForm.rule_cate === '2'"
        >
          会话进入Agent协助的会话工作台中。
        </p>
        <el-form-item
          v-show="sForm.cate === '6' || sForm.rule_cate === '6'"
          label="按键场景"
        >
          <el-input
            v-model="sForm.keyboard_scene"
            autocomplete="off"
            maxlength="50"
            show-word-limit
            placeholder="请输入按键的场景信息，例如英文或者数字，为空则为默认场景"
          />
        </el-form-item>
        <p
          class="mb-3 text-sm"
          v-show="sForm.cate === '7' || sForm.rule_cate === '7'"
        >
          Agent结束会话。
        </p>
      </div>
      <!-- 知识库回答 -->
      <el-form-item v-show="sForm.cate === '8'" label="知识库名称">
        <el-select
          v-model="sForm.kbs"
          value-key="id"
          filterable
          multiple
          placeholder="请选择"
        >
          <el-option
            v-for="item in kbList"
            :key="item.id"
            :label="item.title"
            :value="item"
          />
        </el-select>
      </el-form-item>
    </div>
  </el-form>
  <el-dialog
    v-model="dialogVisible"
    :title="filtersTitle(bigType)"
    append-to-body
    width="100%"
    top="0"
    style="height: 100%; margin-bottom: 0"
  >
    <el-input
      v-model="sForm[bigType]"
      :rows="22"
      type="textarea"
      maxlength="5000"
      show-word-limit
      :placeholder="`请输入${filtersTitle(bigType)}`"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">
          关闭
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, watch, ref, onBeforeMount } from "vue";
import useAgentForm from "./hooks/use-agent-form";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { cateTypes } from "@/constant/options";
import { DataItem } from "@/store/modules/types";
import { queryKb } from "@/api/km";
import { ElMessage } from "element-plus";

const agentTemplateStore = useAgentTemplateHook();
const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  // 是否是条件策略模块，条件策略模块的cate为rule_cate
  isConditionModule: {
    type: Boolean,
    default: false
  }
});
const kbList = ref([]);
const emit = defineEmits(["update:form"]);
const dialogVisible = ref(false);
const bigType = ref("");
const openInputDialog = (type: string) => {
  bigType.value = type;
  dialogVisible.value = true;
};
const filtersTitle = (type: string) => {
  const typeMap = {
    direct_answer: "话术内容",
    llm_prompt: "回答提示词",
    polish_prompt: "润色内容"
  };
  return typeMap[type];
};
// 查询知识库列表
const queryKbList = async () => {
  await queryKb({
    page: 1, // 当前页数
    per_page: 99999, // 每页数量
    title: "" // 这个title不传，中台查不出数据，硬代码！！！
  }).then((res: any) => {
    if (res.code == 200) {
      kbList.value = res.data?.list || [];
    } else {
      ElMessage.error(res.message || "获取知识库失败");
    }
  });
};
const initForm: DataItem = {
  // 后端没有这个字段，只是前端用来做区分
  strategy_type: "answer",
  // 回复类型
  cate: "",
  rule_cate: "",
  value: "",
  tool_llm: "",
  json_parser: "",
  json_field: "",
  skill_num: "",
  keyboard_scene: "",
  llm_prompt: "",
  direct_answer: "",
  polish_prompt: "",
  kbs: []
};

const {
  formRef,
  form: sForm,
  validate,
  resetFields
} = useAgentForm({
  props,
  emit,
  initForm
});
const rules = computed(() => {
  const cate = props.isConditionModule ? sForm.rule_cate : sForm.cate;
  return {
    llm_prompt: [
      {
        required: isAnswerType.value && cate === "1",
        message: "请输入回答提示词",
        trigger: "blur"
      }
    ],
    direct_answer: [
      {
        required: isAnswerType.value && cate === "3",
        message: "请输入话术内容",
        trigger: "blur"
      }
    ],
    polish_prompt: [
      {
        required: isAnswerType.value && cate === "4",
        message: "请输入润色内容",
        trigger: "blur"
      }
    ],
    json_field: [
      {
        required:
          isAnswerType.value && cate === "1" && sForm.json_parser === "2",
        message: "请输入参数名称",
        trigger: "blur"
      }
    ]
  };
});

const isAnswerType = computed(() => sForm.strategy_type === "answer");

const answerType = computed(() => {
  let strategy_type = sForm.strategy_type;
  if (!strategy_type) {
    const cate = props.isConditionModule ? sForm.rule_cate : sForm.cate;
    strategy_type = ["1", "3", "4"].includes(cate) ? "answer" : "action";
  }
  return cateTypes.find(i => i.type === strategy_type).options;
});

const strategyTypes = [
  {
    label: "回复",
    value: "answer"
  },
  {
    label: "Action",
    value: "action"
  }
];

// 选择action时，并且未选择角色类型，自动选中人工服务
watch(
  () => sForm.strategy_type,
  val => {
    if (val === "action") {
      if (props.isConditionModule && !sForm.rule_cate) {
        sForm.rule_cate = "5";
      }
      if (!props.isConditionModule && !sForm.cate) {
        sForm.cate = "5";
      }
    }
  }
);
onBeforeMount(() => {
  queryKbList();
});

defineExpose({
  validate,
  resetFields
});
</script>

<style lang="scss">
.pre-label::before {
  display: inline-block;
  width: 4px;
  height: 16px;
  margin-right: 8px;
  content: "";
}

.label-div {
  width: 100%;

  .iconfont {
    float: right;
    color: #409eff;
    cursor: pointer;
  }
}
</style>
