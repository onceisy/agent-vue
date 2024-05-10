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
            {{ isEdit ? "编辑" : "添加" }}Agent流程{{
              propsType ? "场景" : "角色"
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
      <template #default>
        <el-form
          ref="formRef"
          :model="sForm"
          label-position="top"
          :rules="rules"
          scroll-to-error
        >
          <div class="px-5 pt-5 pb-1 bg-white rounded">
            <h4 class="mb-5 text-text_color_black text-base font-medium">
              {{ propsType ? "场景信息" : "角色信息" }}
            </h4>
            <el-form-item
              :label="propsType ? '场景名称' : '角色名称'"
              prop="name"
            >
              <el-input
                v-model="sForm.name"
                autocomplete="off"
                maxlength="50"
                show-word-limit
                placeholder="请输入"
              />
            </el-form-item>
            <el-form-item
              :label="propsType ? '场景描述' : '角色描述'"
              prop="desc"
            >
              <el-input
                v-model="sForm.desc"
                :rows="3"
                maxlength="500"
                show-word-limit
                type="textarea"
                placeholder="请输入备注"
              />
            </el-form-item>
            <el-form-item label="input指令" prop="input">
              <el-input
                v-model="sForm.input"
                autocomplete="off"
                maxlength="50"
                show-word-limit
                placeholder="请输入"
              />
            </el-form-item>
          </div>
          <div class="mt-5" v-if="isSenesFlow">
            <div class="px-5 pt-5 pb-1 bg-white rounded">
              <el-form-item prop="active_guidance">
                <template #label>
                  <h4
                    class="mb-5 text-text_color_black text-base font-medium"
                    style="margin-top: 4px"
                  >
                    主动引导
                  </h4>
                </template>
                <el-switch v-model="sForm.active_guidance" />
              </el-form-item>
              <template v-if="sForm.active_guidance">
                <el-form-item prop="rule_cate">
                  <template #label>
                    <div class="flex items-center">
                      <svg class="icon text-base" aria-hidden="true">
                        <use xlink:href="#huifuleixing" />
                      </svg>
                      <span class="ml-1">回复类型</span>
                    </div>
                  </template>
                  <el-radio-group v-model="sForm.rule_cate">
                    <el-radio label="3">固定话术</el-radio>
                    <el-radio label="4">润色回复</el-radio>
                    <el-radio label="1">LLM回答</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item
                  prop="direct_answer"
                  v-if="sForm.rule_cate === '3'"
                >
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
                <el-form-item v-if="sForm.rule_cate === '1'">
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
                <el-form-item
                  prop="polish_prompt"
                  v-if="sForm.rule_cate === '4'"
                >
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
                <el-form-item prop="llm_prompt" v-if="sForm.rule_cate == '1'">
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
              </template>
            </div>
          </div>
        </el-form>
        <div class="mt-5">
          <el-form :model="sForm" label-position="left" scroll-to-error>
            <div class="px-5 pt-5 pb-1 bg-white rounded">
              <h4 class="mb-5 text-text_color_black text-base font-medium">
                状态
              </h4>
              <el-form-item label="生效状态">
                <el-switch
                  :active-value="1"
                  :inactive-value="0"
                  v-model="sForm.status"
                />
              </el-form-item>
            </div>
          </el-form>
        </div>
      </template>
    </el-drawer>
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
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { generateUUID } from "@/utils/common";
import { saveAgentRole } from "@/api/agent";
import { ElMessage, ElMessageBox } from "element-plus";

const agentTemplateStore = useAgentTemplateHook();

const drawerVisible = ref(false);
const isEdit = ref(false);
const dialogVisible = ref(false);
const formRef = ref();
const bigType = ref("");
const propsType = ref("");
const emit = defineEmits(["fetchList", "goToFlow"]);
const props = defineProps({
  isSenesFlow: {
    type: Boolean,
    default: false
  },
  pid: {
    type: String,
    default: ""
  }
});
const sForm = ref({
  name: "",
  desc: "",
  input: "",
  polish_prompt: "",
  llm_prompt: "",
  rule_cate: "3",
  tool_llm: "",
  direct_answer: "",
  active_guidance: false,
  status: 0
});
const rules = {
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
  ],
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  desc: [{ required: true, message: "请输入场景描述", trigger: "blur" }],
  input: [{ required: true, message: "input指令", trigger: "blur" }]
};
const cancel = () => {
  drawerVisible.value = false;
};
const filtersTitle = (type: string) => {
  const typeMap = {
    direct_answer: "话术内容",
    llm_prompt: "回答提示词",
    polish_prompt: "润色内容"
  };
  return typeMap[type];
};
const resetForm = () => {
  sForm.value = {
    name: "",
    desc: "",
    input: "",
    polish_prompt: "",
    llm_prompt: "",
    rule_cate: "3",
    tool_llm: "",
    direct_answer: "",
    active_guidance: false,
    status: 0
  };
};
const openInputDialog = (type: string) => {
  bigType.value = type;
  dialogVisible.value = true;
};
// 打开弹窗
const openDialog = (data?: any, type?: string) => {
  drawerVisible.value = true;
  propsType.value = type;
  if (data) {
    isEdit.value = true;
    Object.keys(data).forEach(item => {
      sForm.value[item] = data[item];
    });
  } else {
    isEdit.value = false;
    resetForm();
  }
};
const handleSaveAnswerModel = async () => {
  const pass = await formRef.value.validate();
  if (pass) {
    const obj = {
      uid: generateUUID(),
      pid: propsType.value ? props.pid : "",
      role_type: "2",
      cate: "10",
      agent_id: agentTemplateStore.currentAgent.agent_id
    };
    const relObj = { ...obj, ...sForm.value };
    saveAgentRole(relObj).then(res => {
      if (res.code === 200) {
        if (isEdit.value) {
          drawerVisible.value = false;
          emit("fetchList", propsType.value ? props.pid : "");
          return;
        }
        ElMessageBox.confirm("新建成功，是否现在进入流程编辑页面", "提示", {
          confirmButtonText: "现在进入",
          cancelButtonText: "待会再说",
          type: "warning"
        })
          .then(async () => {
            drawerVisible.value = false;
            emit("goToFlow", {
              info: relObj,
              type: propsType.value ? "scenes" : ""
            });
            emit("fetchList", propsType.value ? props.pid : "");
          })
          .catch(() => {
            drawerVisible.value = false;
            emit("fetchList", propsType.value ? props.pid : "");
          });
      } else {
        ElMessage.error(res.message || "添加失败");
      }
    });
  }
};
defineExpose({
  openDialog
});
</script>

<style lang="scss" scoped>
.label-div::before {
  margin-right: 4px;
  color: var(--el-color-danger);
  content: "*";
}
</style>
