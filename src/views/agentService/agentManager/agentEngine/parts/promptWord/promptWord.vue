<script setup lang="ts">
import { useAgentTemplateHook } from "@/store/modules/agentTemplate";
import { reactive, ref } from "vue";
import { cloneDeep } from "lodash";
import { savePrompt } from "@/api/agent";
import { ElMessage } from "element-plus";
const agentTemplateStore = useAgentTemplateHook();

defineOptions({
  name: "promptWord"
});
const ruleFormRef = ref();
const formInfo = reactive({
  tool_prompt: "",
  polish_prompt: "",
  json_field: "",
  json_parser: "1",
  personality: ""
});
const rules = {
  tool_prompt: [{ required: true, message: "请填写提示词", trigger: "blur" }]
};
const dialogVisible = ref(false);
const bigType = ref("");
const openInputDialog = (type: string) => {
  bigType.value = type;
  dialogVisible.value = true;
};
const filtersTitle = (type: string) => {
  const typeMap = {
    tool_prompt: "角色分类prompt",
    polish_prompt: "标准润色回复prompt",
    personality: "知识库回复prompt"
  };
  return typeMap[type];
};

const saveBtn = () => {
  ruleFormRef.value.validate(valid => {
    if (valid) {
      const info = agentTemplateStore.currentAgent as any;
      const actionForm = cloneDeep(formInfo);
      const agent_id = info.agent_id;
      savePrompt({
        agent_id,
        ...actionForm
      }).then(res => {
        if (res.code === 200) {
          ElMessage.success("保存成功");
        } else {
          ElMessage.error(res.message ? res.message : "保存失败");
        }
      });
    }
  });
};

function initData() {
  const { tool_prompt, polish_prompt, json_field, json_parser, personality } =
    agentTemplateStore.currentAgent as any;
  formInfo.tool_prompt = tool_prompt || "";
  formInfo.polish_prompt = polish_prompt || "";
  formInfo.json_field = json_field || "";
  formInfo.json_parser = json_parser || "";
  formInfo.personality = personality || "";
}

defineExpose({
  initData
});
</script>

<template>
  <div class="promptWord">
    <el-form
      ref="ruleFormRef"
      :model="formInfo"
      :rules="rules"
      class="demo-ruleForm"
      status-icon
    >
      <div class="reply">
        <div class="tip">
          <div class="common-title reply-title">
            <span class="require">*</span>角色分类prompt<el-tag
              class="tag"
              size="small"
              >{system_conditions}</el-tag
            >
            <el-button
              @click="saveBtn"
              class="saveBtn"
              type="primary"
              size="small"
              >保存</el-button
            >
          </div>
          <el-form-item prop="tool_prompt">
            <slot name="label">
              <div class="label-div">
                <span
                  class="iconfont quanping"
                  @click="openInputDialog('tool_prompt')"
                />
              </div>
            </slot>
            <el-input
              v-model="formInfo.tool_prompt"
              :rows="5"
              maxlength="10000"
              show-word-limit
              type="textarea"
            />
          </el-form-item>
        </div>
      </div>
      <div style="margin-bottom: 30px">
        <el-radio-group
          v-model="formInfo.json_parser"
          style="margin-bottom: 10px"
        >
          <el-radio-button label="1">全部内容输出</el-radio-button>
          <el-radio-button label="2">Json解析</el-radio-button>
        </el-radio-group>
        <el-input
          v-if="formInfo.json_parser == '2'"
          v-model="formInfo.json_field"
        />
      </div>
      <div class="reply">
        <div class="tip">
          <div class="common-title reply-title">
            标准润色回复prompt<el-tag class="tag" size="small"
              >{polish_text}</el-tag
            >
          </div>
          <el-form-item prop="word">
            <slot name="label">
              <div class="label-div">
                <span
                  class="iconfont quanping"
                  @click="openInputDialog('polish_prompt')"
                />
              </div>
            </slot>
            <el-input
              v-model="formInfo.polish_prompt"
              :rows="5"
              maxlength="10000"
              show-word-limit
              type="textarea"
            />
          </el-form-item>
        </div>
      </div>
      <div class="reply">
        <div class="tip">
          <div class="common-title reply-title">
            知识库回复prompt
            <el-tag class="tag" size="small">{context_str}</el-tag>
          </div>
          <el-form-item prop="word">
            <slot name="label">
              <div class="label-div">
                <span
                  class="iconfont quanping"
                  @click="openInputDialog('personality')"
                />
              </div>
            </slot>
            <el-input
              v-model="formInfo.personality"
              :rows="5"
              maxlength="10000"
              show-word-limit
              type="textarea"
            />
          </el-form-item>
        </div>
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
        v-model="formInfo[bigType]"
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

<style lang="scss" scoped>
.promptWord {
  margin-top: 16px;
  background-color: #fff;

  .top {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #dcdfe6;

    .title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .saveBtn {
    float: right;
  }

  .demo-ruleForm {
    padding: 0 20px 20px;
    margin-top: 16px;

    .reply {
      .reply-title {
        padding-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        border-bottom: 1px solid #dcdfe6;
      }

      .tip {
        padding-top: 16px;
      }
    }
  }

  .common-title {
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: normal;
    color: #303133;
  }

  .require {
    margin-right: 4px;
    color: #f56c6c;
  }

  .tag {
    margin-left: 8px;
  }

  .label-div {
    width: 100%;

    .iconfont {
      float: right;
      color: #409eff;
      cursor: pointer;
    }
  }
}
</style>
