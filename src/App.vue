<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import en from "element-plus/lib/locale/lang/en";
import { ReDialog } from "@/components/ReDialog";
import { useAgentTemplateHook } from "./store/modules/agentTemplate";
import { useAsyncOptionsHook } from "./store/modules/asyncOptions";
const agentTemplateStore = useAgentTemplateHook();
const asyncOptionStore = useAsyncOptionsHook();
export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog
  },
  computed: {
    currentLocale() {
      return this.$storage.locale?.locale === "zh" ? zhCn : en;
    }
  },
  mounted() {
    window.addEventListener("load", function () {
      agentTemplateStore.persistence();
      asyncOptionStore.persistence();
    });
  }
});
</script>
