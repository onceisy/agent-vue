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
    <el-form-item prop="strategy_type">
      <template #label>
        <div class="flex items-center">
          <svg class="icon text-base" aria-hidden="true">
            <use xlink:href="#celveleixing" />
          </svg>
          <span class="ml-1">策略类型</span>
        </div>
      </template>
      <el-radio-group v-model="sForm.strategy_type">
        <el-radio label="answer">回复</el-radio>
        <el-radio label="action">Action</el-radio>
      </el-radio-group>
    </el-form-item>
    <template v-if="sForm.strategy_type == 'answer'">
      <el-form-item prop="cate">
        <template #label>
          <div class="flex items-center">
            <svg class="icon text-base" aria-hidden="true">
              <use xlink:href="#huifuleixing" />
            </svg>
            <span class="ml-1">回复类型</span>
          </div>
        </template>
        <el-radio-group v-model="sForm.cate">
          <el-radio label="1">LLM回答</el-radio>
          <el-radio label="3">固定话术</el-radio>
          <el-radio label="4">润色回复</el-radio>
          <el-radio label="8">知识库回答</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="direct_answer" v-if="sForm.cate === '3'">
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
      <template v-if="['1', '4'].includes(sForm.cate)">
        <el-form-item prop="llm_prompt" v-if="sForm.cate === '1'">
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
        <el-form-item prop="json_parser" v-if="sForm.cate === '1'">
          <el-radio-group v-model="sForm.json_parser">
            <el-radio-button label="1">全部内容输出</el-radio-button>
            <el-radio-button label="2">Json解析</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="json_field" v-if="sForm.cate === '1'">
          <el-input
            v-show="sForm.json_parser === '2'"
            v-model="sForm.json_field"
            placeholder="请输入参数名称"
          />
        </el-form-item>
      </template>
      <el-form-item prop="polish_prompt" v-if="sForm.cate === '4'">
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
      <!-- 知识库回答 -->
      <el-form-item v-if="sForm.cate === '8'" label="知识库名称">
        <el-select
          v-model="sForm.kbs"
          filterable
          value-key="id"
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
    </template>
    <template v-if="sForm.strategy_type == 'action'">
      <el-form-item label="回复类型">
        <template #label>
          <div class="flex items-center">
            <svg class="icon text-base" aria-hidden="true">
              <use xlink:href="#huifuleixing" />
            </svg>
            <span class="ml-1">回复类型</span>
          </div>
        </template>
        <el-radio-group v-model="sForm.cate">
          <el-radio label="5">人工服务</el-radio>
          <el-radio label="6">按键服务</el-radio>
          <el-radio label="7">挂机服务</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 优先技能组 -->
      <el-form-item v-show="sForm.cate === '5'" label="优先技能组">
        <el-input
          v-model="sForm.skill_num"
          autocomplete="off"
          maxlength="50"
          show-word-limit
          placeholder="请输入优先技能组编号，为空则转默认技能组"
        />
      </el-form-item>
      <p class="mb-3 text-sm" v-show="sForm.cate === '2'">
        会话进入Agent协助的会话工作台中。
      </p>
      <el-form-item v-show="sForm.cate === '6'" label="按键场景">
        <el-input
          v-model="sForm.keyboard_scene"
          autocomplete="off"
          maxlength="50"
          show-word-limit
          placeholder="请输入按键的场景信息，例如英文或者数字，为空则为默认场景"
        />
      </el-form-item>
      <p class="mb-3 text-sm" v-show="sForm.cate === '7'">Agent结束会话。</p>
    </template>
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
import { ref } from "vue";
import useFlowForm from "./hooks/use-flow-form";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
const agentTemplateStore = useAgentTemplateHook();
const formNode = ref({
  name: "回复节点",
  strategy_type: "answer",
  keyboard_scene: "",
  cate: "3",
  direct_answer: "",
  skill_num: "",
  polish_prompt: "",
  llm_prompt: "",
  tool_llm: "minimax",
  json_parser: "",
  json_field: "",
  kbs: []
});
const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  llm_prompt: [
    {
      required: true,
      message: "请输入回答提示词",
      trigger: "blur"
    }
  ],
  direct_answer: [
    {
      required: true,
      message: "请输入话术内容",
      trigger: "blur"
    }
  ],
  polish_prompt: [
    {
      required: true,
      message: "请输入润色内容",
      trigger: "blur"
    }
  ]
};
const formRef = ref(null);
const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  id: {
    type: String,
    default: ""
  },
  kbList: {
    type: Array,
    default: () => [] as any
  }
});
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
<style lang="scss" socped>
.label-div {
  width: 100%;
  color: #303133;

  .iconfont {
    float: right;
    color: #409eff;
    cursor: pointer;
  }
}

.label-div::before {
  margin-right: 4px;
  color: var(--el-color-danger);
  content: "*";
}
</style>
