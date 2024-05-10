<script setup lang="ts">
import { getLogDetail, queryLlm } from "@/api/agent";
import { ref } from "vue";
import robotAvatar from "@/assets/images/bot.png";
import userAvatar from "@/assets/images/user.png";
import codeAvatar from "@/assets/images/code.png";
import kefuAvatar from "@/assets/images/kefu.png";
import greenCircle from "@/assets/images/greenCircle.png";
import partTag from "@/assets/images/partTag.png";
import checkDoc from "@/components/CheckDoc/index.vue";
import { FullScreen } from "@element-plus/icons-vue";
import { Close, Document } from "@element-plus/icons-vue";
defineOptions({
  name: "sessionDetail"
});
const dialog = ref(false);
const size = ref(600);
const currentAgent = ref<any>({});
const messages = ref<any>([]);
const debugInfo = ref<any>([]);
const dialogTableVisible = ref(false);
const checkDocVisible = ref(false);
const checkDocRef = ref();
// const dialogPromptVisible = ref(false);
// const fullDialogVisible = ref(false);
enum ModelEnum {
  GPT4 = "gpt4",
  GPT32 = "gpt4-32",
  BAIDU = "baidu",
  MINIMAX = "minimax",
  MINIMAX6 = "minimax6",
  BAICHUAN = "baichuan",
  QWEN_7B = "qwen-7b-chat",
  QWEN_14B = "qwen-14b-chat",
  QWEN_72B = "qwen-72b-chat",
  GPT3_5 = "gpt3.5-turbo",
  GROP_LLAMA2 = "groq-LLaMA2",
  GROP_MIXTRAL = "groq-Mixtral",
  SKYLARK2_4K = "skylark2-pro-4k",
  SKYLARK2_32K = "skylark2-pro-32k"
}
const LogMap = {
  "1": "LLM回答",
  "2": "分类",
  "3": "固定话术",
  "4": "润色回复",
  "5": "人工服务",
  "6": "按键服务",
  "7": "挂机服务"
};
// 查看知识库文档
const showDoc = data => {
  size.value = 1200;
  checkDocVisible.value = true;
  dialogTableVisible.value = false;
  checkDocRef.value.checkDoc(data);
};
// 关闭知识库文档
const closeDoc = () => {
  size.value = 600;
  checkDocVisible.value = false;
};
const handleDebug = row => {
  const obj = { related_docs: [] };
  const log = row.debug_info || [];
  // 有调试信息
  log.forEach((item: any) => {
    if (item.query_log && item.query_log.rag_log) {
      Object.assign(obj, item.query_log.rag_log);
    }
  });
  return obj;
};
const closeDebug = () => {
  size.value = 600;
  dialogTableVisible.value = false;
};
const startDebug = (row: any) => {
  debugInfo.value = [];
  size.value = 1200;
  dialogTableVisible.value = true;
  checkDocVisible.value = false;
  if ("debug_info" in row) {
    // 有调试信息
    row["debug_info"].forEach((o: any) => {
      let one;
      let key = "tool_prompt";
      if ("tool_log" in o) {
        key = "tool_prompt";
        one = o["tool_log"];
      }
      if ("query_log" in o) {
        key = "tool_map";
        one = o["query_log"];
      }
      if (one) {
        debugInfo.value.push({
          sid: row["sid"],
          title: key,
          content: one["content"],
          prompt: one["prompt"],
          response: one["response"],
          info: one["info"],
          tool_llm: "tool_llm" in one ? one["tool_llm"] : ModelEnum.MINIMAX,
          ai_slots: "ai_slots" in one ? one["ai_slots"] : "{}",
          messages: "messages" in one ? one["messages"] : null,
          add_info: "add_info" in o ? o["add_info"] : {},
          json_parser: one["json_parser"] || "",
          option: one["option"] || []
        });
      }
      if (o["query_log"] && "rag_log" in o["query_log"]) {
        if (o["query_log"].rag_log) {
          debugInfo.value.push({
            title: "rag_log",
            question: o["query_log"].rag_log.question || ""
          });
          if (o["query_log"].rag_log.prompt) {
            debugInfo.value.push({
              title: "rag_prompt",
              prompt: o["query_log"].rag_log.prompt || ""
            });
          }
        }
      }
    });
  }
};
// const getLastMessage = (targetId: string) => {
//   // 查找指定 _id 的机器人消息在数组中的位置
//   const robotMessageIndex = messages.value.findIndex(function (message: any) {
//     return message["id"] === targetId && message.type === 1;
//   });

//   // 如果找到了机器人消息
//   if (robotMessageIndex !== -1) {
//     // 从机器人消息位置向前搜索最近的访客消息
//     for (let i = robotMessageIndex - 1; i >= 0; i--) {
//       if (messages.value[i].type === 2) {
//         console.log("最近的上一条访客消息是：", messages.value[i]);
//         return messages.value[i];
//       }
//     }
//   } else {
//     console.log("未找到指定 _id 的机器人消息");
//     return {};
//   }
// };
const openDetail = async (row: any) => {
  currentAgent.value = row;
  // dialogTableVisible.value = true
  dialog.value = true;
  size.value = 600;
  dialogPromptVisible.value = false;
  dialogTableVisible.value = false;
  checkDocVisible.value = false;
  const res: any = await getLogDetail({ sid: row.sid });
  if (res.code == 200) {
    messages.value = res.data;
  }
};
const msgTypeMap = {
  4: "未启用",
  3: "部分采纳",
  2: "完全采纳",
  1: "未采纳"
};
const currentDebug = ref<any>();
const dialogPromptVisible = ref(false);
const queryLoading = ref(false);
const debugPrompt = (item: any) => {
  dialogPromptVisible.value = true;
  currentDebug.value = item;
};
const fullDialogVisible = ref(false);
const handleFullScreen = () => {
  fullDialogVisible.value = true;
};
const testPrompt = async () => {
  queryLoading.value = true;

  const params = {
    sid: currentDebug.value.sid,
    content: currentDebug.value.content,
    prompt: currentDebug.value.prompt,
    llm_name: currentDebug.value.tool_llm,
    messages: currentDebug.value.messages,
    json_parser: "",
    option: []
  };
  debugInfo.value.forEach(item => {
    if (item.title == "tool_prompt") {
      params.json_parser = item.json_parser;
      params.option = item.option;
    }
  });
  try {
    const res: any = await queryLlm(params);
    console.log("保存响应", res);
    if (res.code == 200) {
      currentDebug.value.response = res.data;
    } else {
      currentDebug.value.response = res.message;
    }
    queryLoading.value = false;
  } catch (error) {
    currentDebug.value.response = "请求异常！";
    queryLoading.value = false;
  }
};
defineExpose({
  openDetail
});
</script>

<template>
  <div>
    <el-drawer
      v-model="dialog"
      title="会话详情"
      direction="rtl"
      class="session-drawer"
      :size="size"
    >
      <div style="display: flex; height: 100%">
        <div class="session-container">
          <div class="session-window">
            <div class="card">
              <div class="title">基本信息</div>
              <div class="base-content">
                <div class="base-content--item">
                  <div>会话ID</div>
                  {{ currentAgent.sid }}
                </div>
                <div class="base-content--item">
                  <div>Agent名称</div>
                  {{ currentAgent.agent_name }}
                </div>
                <div class="base-content--item">
                  <div>开始时间</div>
                  {{ currentAgent.start_time }}
                </div>
                <div class="base-content--item">
                  <div>最近对话时间</div>
                  {{ currentAgent.last_time }}
                </div>
              </div>
            </div>
          </div>
          <div class="chat-window">
            <!-- 开始时间 -->
            <div class="start-time">
              {{ currentAgent.start_time }}
            </div>
            <div
              v-for="message in messages"
              :key="message.id"
              :class="{
                'robot-message': message.type === 1,
                'user-message': message.type === 2
              }"
            >
              <div class="message-content">
                <!-- 头像 -->
                <div class="avatar-img">
                  <img
                    :src="message.type === 1 ? robotAvatar : userAvatar"
                    alt="avatar"
                    class="avatar"
                  />
                </div>

                <div class="msg-block">
                  <!-- 名称以及时间 -->
                  <div class="flex align-center agent-name">
                    {{ message.type == 1 ? currentAgent.agent_name : "访客" }}
                    {{ message.msg_time.split(" ")[1] }}
                    <img
                      v-if="message.type == 1"
                      @click="startDebug(message)"
                      class="pointer code"
                      :src="codeAvatar"
                      alt=""
                    />
                  </div>
                  <div
                    class="msg"
                    style="color: #09c"
                    v-if="
                      message.log &&
                      message.log.action != '8' &&
                      !message.message
                    "
                  >
                    <p>Action: &nbsp;{{ LogMap[message.log.action] }}</p>
                    <p
                      style="margin-top: 10px"
                      v-if="['5', '6'].includes(message.log.action)"
                    >
                      {{
                        message.log.action == "5" ? "优先技能组:" : "按键服务:"
                      }}
                      &nbsp;
                      {{
                        message.log.action == "5"
                          ? message.log.skill_num
                          : message.log.keyboard_scene
                      }}
                    </p>
                  </div>
                  <div class="msg" v-else>
                    {{ message.message }}
                    <div v-if="message.log && message.log.action == '8'">
                      <div class="icon-div">
                        <el-icon>
                          <Document />
                        </el-icon>
                        参考文献
                      </div>
                      <div class="flex flex-wrap">
                        <div
                          class="docs-list"
                          v-for="(item, index) in handleDebug(message)
                            .related_docs"
                          :key="index"
                        >
                          <span class="border-span">{{ index + 1 }}</span>
                          <span @click="showDoc(item)" class="source-span">{{
                            item.source
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <template v-if="message.type == 1 && message.source == 1">
                    <!-- 辅助类型的才展示是否采纳，其他类型不展示 -->
                    <div class="flex msg-tag" style="background-color: #ecf5ff">
                      <div style="flex-shrink: 0">
                        <div :class="'font-12 tag-' + message.msg_tag">
                          {{ msgTypeMap[message.msg_tag] }}
                          <img
                            :src="greenCircle"
                            v-if="message.msg_tag === 2"
                            style="width: 12px; margin-left: 8px"
                          />
                          <img
                            :src="partTag"
                            v-if="message.msg_tag === 3"
                            style="width: 12px; margin-left: 8px"
                          />
                        </div>
                      </div>
                      <div class="flex">
                        <img class="kefu" :src="kefuAvatar" alt="" />
                        <div class="tag-content">{{ message.agent_msg }}</div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="log-container" v-if="dialogTableVisible === true">
          <div class="debug-title">
            <el-button
              :icon="Close"
              circle
              class="close-btn"
              @click.stop="closeDebug"
            />
            调用日志
          </div>
          <div class="log-view">
            <div
              class="debug-content"
              v-for="(item, index) in debugInfo"
              :key="index"
            >
              <div class="el-form-item__label">
                <div class="pre-label before:bg-primary_blue">
                  <span>{{
                    item.title === "tool_prompt"
                      ? "角色"
                      : item.title === "tool_map"
                      ? "回答策略"
                      : item.title === "rag_log"
                      ? "最终问题"
                      : item.title === "rag_prompt"
                      ? "prompt"
                      : item.title
                  }}</span>
                </div>
              </div>
              <div class="rag-ques" v-if="item.title === 'rag_log'">
                {{ item.question }}
              </div>
              <div v-else-if="item.title === 'rag_prompt'">
                <el-input
                  disabled
                  v-model="item.prompt"
                  type="textarea"
                  :rows="15"
                />
              </div>
              <div v-else>
                <div class="sub-title" v-if="item.content">
                  <label style="font-weight: 500">请求</label>
                  <el-button type="primary" link @click.stop="debugPrompt(item)"
                    >调试</el-button
                  >
                </div>
                <div class="flex-1" v-if="item.content">
                  <el-input
                    disabled
                    v-model="item.content"
                    type="textarea"
                    :rows="15"
                  />
                </div>
                <div
                  class="flex flex-container"
                  v-if="item.title === 'tool_prompt'"
                >
                  <div class="flex-column align-center">
                    <div class="text-black">prompt</div>
                  </div>
                  <div class="content">{{ item.prompt }}</div>
                </div>
                <div class="flex flex-container" v-else>
                  <div class="flex-column align-center">
                    <div class="text-black">messages</div>
                  </div>
                  <div class="content">{{ item.messages }}</div>
                </div>
                <div class="flex flex-container">
                  <div class="flex-column align-center">
                    <div class="text-black">响应</div>
                  </div>
                  <div class="content">{{ item.response }}</div>
                </div>
                <div class="flex flex-container">
                  <div class="flex-column align-center">
                    <div class="text-black">变量</div>
                  </div>
                  <div class="font-style">{{ item.ai_slots }}</div>
                </div>
                <div class="flex flex-container">
                  <div class="flex-column align-center">
                    <div class="text-black">模型</div>
                  </div>
                  <div class="font-style">{{ item.add_info?.model }}</div>
                </div>
                <div class="flex flex-container">
                  <div class="flex-column align-center">
                    <div class="text-black">token</div>
                  </div>
                  <div class="font-style">
                    请求：{{ item.add_info?.prompt_tokens }} 响应：{{
                      item.add_info?.completion_tokens
                    }}
                    总数：{{ item.add_info?.total_tokens }}
                  </div>
                </div>
                <div class="flex flex-container">
                  <div class="flex-column align-center">
                    <div class="text-black">消费金额</div>
                  </div>
                  <div class="font-style">{{ item.add_info?.billing }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 知识库回答查看文档 -->
        <checkDoc
          @closeDoc="closeDoc"
          v-show="checkDocVisible"
          ref="checkDocRef"
        />
      </div>
    </el-drawer>
    <el-dialog v-model="dialogPromptVisible" title="prompt调试">
      <div>
        <div class="current-title">
          {{
            currentDebug.title === "tool_prompt"
              ? "角色"
              : currentDebug.title === "tool_map"
              ? "回答策略"
              : currentDebug.title
          }}
        </div>
        <div class="prompt-content">
          <div class="flex-column align-center">
            <div
              class="flex text-black"
              style="justify-content: space-between; margin-bottom: 8px"
            >
              <div>请求</div>
              <div class="flex flex-end">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="点击全屏"
                  placement="top-start"
                >
                  <div class="pointer" @click="handleFullScreen">
                    <el-icon>
                      <FullScreen />
                    </el-icon>
                  </div>
                </el-tooltip>
              </div>
            </div>
          </div>
          <el-input v-model="currentDebug.content" type="textarea" :rows="15" />
          <div class="flex select-model">
            <el-select
              v-model="currentDebug.tool_llm"
              placeholder="请选择模型"
              class="model"
            >
              <el-option :label="ModelEnum.GPT4" :value="ModelEnum.GPT4" />
              <el-option :label="ModelEnum.GPT32" :value="ModelEnum.GPT32" />
              <el-option :label="ModelEnum.BAIDU" :value="ModelEnum.BAIDU" />
              <el-option
                :label="ModelEnum.MINIMAX"
                :value="ModelEnum.MINIMAX"
              />
              <el-option
                :label="ModelEnum.MINIMAX6"
                :value="ModelEnum.MINIMAX6"
              />
              <el-option
                :label="ModelEnum.BAICHUAN"
                :value="ModelEnum.BAICHUAN"
              />
              <el-option
                :label="ModelEnum.QWEN_7B"
                :value="ModelEnum.QWEN_7B"
              />
              <el-option
                :label="ModelEnum.QWEN_14B"
                :value="ModelEnum.QWEN_14B"
              />
              <el-option
                :label="ModelEnum.QWEN_72B"
                :value="ModelEnum.QWEN_72B"
              />
              <el-option :label="ModelEnum.GPT3_5" :value="ModelEnum.GPT3_5" />
              <el-option
                :label="ModelEnum.GROP_LLAMA2"
                :value="ModelEnum.GROP_LLAMA2"
              />
              <el-option
                :label="ModelEnum.GROP_MIXTRAL"
                :value="ModelEnum.GROP_MIXTRAL"
              />
              <el-option
                :label="ModelEnum.SKYLARK2_4K"
                :value="ModelEnum.SKYLARK2_4K"
              />
              <el-option
                :label="ModelEnum.SKYLARK2_32K"
                :value="ModelEnum.SKYLARK2_32K"
              />
            </el-select>
            <el-button class="test-btn" type="primary" @click="testPrompt"
              >测试</el-button
            >
          </div>
        </div>

        <div class="flex">
          <div class="text-black" style="flex-shrink: 0; width: 80px">响应</div>
          <div v-loading="queryLoading">{{ currentDebug.response }}</div>
        </div>
        <div class="flex">
          <div class="text-black" style="flex-shrink: 0; width: 80px">模型</div>
          <div>{{ currentDebug.tool_llm }}</div>
        </div>
        <div class="flex">
          <div class="text-black" style="flex-shrink: 0; width: 80px">
            token
          </div>
          <div>
            请求：{{ currentDebug.add_info?.prompt_tokens }} 响应：{{
              currentDebug.add_info?.completion_tokens
            }}
            总数：{{ currentDebug.add_info?.total_tokens }}
          </div>
        </div>
        <div class="flex">
          <div class="text-black" style="flex-shrink: 0; width: 80px">
            消费金额
          </div>
          <div>{{ currentDebug.add_info?.billing }}</div>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      v-model="fullDialogVisible"
      title="编辑prompt"
      :fullscreen="true"
      align-center
    >
      <el-input
        v-model="currentDebug.content"
        :rows="40"
        type="textarea"
        height="100%"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.rag-ques {
  font-size: 14px;
  color: #606266;
}

.docs-list {
  padding: 2px 6px;
  margin: 0 20px 6px 0;
  color: #909399;
  text-align: center;
  cursor: pointer;
  background: #f4f4f5;
  border-radius: 0 4px 4px 0;
  opacity: 1;
}

.docs-list:hover {
  color: #409eff;

  .border-span {
    border-right: 1px solid #409eff;
  }
}

.border-span {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-right: 1px solid #e6e6e6;
}

.source-span {
  display: inline-block;
  height: 24px;
  padding: 0 6px;
  line-height: 24px;
}

.icon-div {
  margin: 16px 0 6px;
  margin-top: 16px;
  font-size: 12px;

  i {
    display: inline-block;
    vertical-align: middle;
  }
}

.session-window {
  width: 100%;
}

.title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.base-content--item {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 22px;
  color: #303133;

  div {
    width: 90px;
    margin-right: 10px;
    font-weight: normal;
    color: #606266;
  }
}

.card {
  padding-bottom: 14px;
  border-bottom: 1px solid #dcdfe6;
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 0;
  margin: auto;

  /* background-color: #52C31A; */
  // overflow: auto;
}

.message-content {
  position: relative;
  display: flex;
  align-items: center;
  align-items: flex-start !important;
  font-size: 12px;
  color: #a8abb2;
}

.code,
.kefu {
  width: 20px;
  height: 20px;
  margin-left: 10px;
  cursor: pointer;
}

/* 1为未采纳；2为完全采纳；3为部分采纳；4为未启用 */
.tag-1 {
  padding: 2px 4px;
  color: #f56c6c;
  background-color: #fcf1f0;
  border: 1px solid #f56c6c;
  border-radius: 4px;
}

.tag-2 {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  color: #67c23a;
  background-color: #f0f9ec;
  border: 1px solid #67c23a;
  border-radius: 4px;
}

.tag-3 {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  color: #e6a23c;
  background-color: #fbf6ed;
  border: 1px solid #e6a23c;
  border-radius: 4px;
}

.tag-4 {
  padding: 2px 4px;
  color: #a8abb2;
  background-color: #f1f1f1;
  border: 1px solid #a8abb2;
  border-radius: 4px;
}

.avatar-img {
  width: 30px;
  margin-top: 10px;
  margin-right: 10px;
  border-radius: 50%;
}

.start-time {
  margin-bottom: 20px;
  font-size: 12px;
  color: #a8abb2;
  text-align: center;
}

.msg {
  max-width: 480px;
  color: #303133;
}

.msg-tag {
  max-width: 480px;
  padding: 6px 8px;
  margin-top: 4px;
  border-radius: 4px;
}

.robot-message .message-content {
  flex-direction: row;
  justify-content: flex-start;
}

.robot-message .msg {
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
}

.robot-message,
.user-message {
  padding-bottom: 20px;
}

.user-message .msg {
  padding: 10px 12px;
  margin-right: 10px;
  background: rgb(64 158 255 / 20%);
  border-radius: 4px;
}

.user-message .message-content {
  flex-direction: row-reverse;
}

.avatar {
  width: 30px;
  border-radius: 50%;
}

.agent-name {
  position: absolute;
  top: 10px;
}

.user-message .agent-name {
  right: 50px;
}

.tag-content {
  margin-left: 16px;
  color: #606266;
}

.msg-block {
  margin-top: 30px;
}

.session-container {
  flex: 1;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
}

.log-container {
  flex: 1;
  height: 100%;
  background-color: #fff;

  .debug-title {
    padding: 12px 20px;
    border-bottom: 1px solid#DCDFE6;

    .close-btn {
      height: 24px;
      padding: 4px;
      margin-right: 4px;
    }
  }
}

.debug-content {
  padding: 0 20px 20px;

  .pre-label {
    display: flex;
    align-items: center;
    color: #303133;
  }

  .pre-label::before {
    display: inline-block;
    width: 4px;
    height: 16px;
    margin-right: 8px;
    content: "";
  }

  .sub-title {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
    font-size: 14px;
    font-weight: 500;
  }

  .content {
    font-size: 14px;
    font-weight: normal;
    color: #606266;
  }

  .text-black {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }

  .flex-column {
    flex-shrink: 0;
    width: 80px;
  }

  .flex-container {
    margin-top: 10px;
  }
}

.current-title {
  font-size: 14px;
  font-weight: 700;
  color: #409eff;
}

.prompt-content {
  margin-top: 10px;
}

.select-model {
  margin: 10px 0;
}

.model {
  flex: 1;
  margin-right: 10px;
}

.log-view {
  height: calc(100% - 50px);
  padding-top: 20px;
  overflow-y: auto;
}

.el-form-item__label {
  height: auto;
  line-height: normal;
}

.font-style {
  font-size: 14px;
  color: #606266;
}
</style>
