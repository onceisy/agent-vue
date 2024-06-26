<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
// import { useNav } from "@/layout/hooks/useNav";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
// import { bg, avatar, illustration } from "./utils/static";
// import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
// import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
// import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

// import dayIcon from "@/assets/svg/day.svg?component";
// import darkIcon from "@/assets/svg/dark.svg?component";
// import globalization from "@/assets/svg/globalization.svg?component";
// import Lock from "@iconify-icons/ri/lock-fill";
// import Check from "@iconify-icons/ep/check";
// import User from "@iconify-icons/ri/user-3-fill";

defineOptions({
  name: "Login"
});
const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { t } = useI18n();
// const { dataTheme, dataThemeChange } = useDataThemeChange();
// dataThemeChange();
// const { title, getDropdownItemStyle, getDropdownItemClass } = useNav();
// const { locale, translationCh, translationEn } = useTranslationLang();

const ruleForm = reactive({
  username: "",
  password: ""
});

const onLogin = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.code === 200) {
            // 获取后端路由
            initRouter().then(() => {
              // console.log("第一个路由", getTopMenu(true).path);
              router.push(getTopMenu(true).path);
              message("登录成功", { type: "success" });
            });
          }
        });
    } else {
      loading.value = false;
      return fields;
    }
  });
};

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (code === "Enter") {
    onLogin(ruleFormRef.value);
  }
}

onMounted(() => {
  window.document.addEventListener("keypress", onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});
</script>

<template>
  <div class="select-none">
    <!-- <img :src="bg" class="wave" /> -->
    <!-- <div class="flex-c absolute right-5 top-3"> -->
    <!-- 主题 -->
    <!-- <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      /> -->
    <!-- 国际化 -->
    <!-- <el-dropdown trigger="click">
        <globalization
          class="hover:text-primary hover:!bg-[transparent] w-[20px] h-[20px] ml-1.5 cursor-pointer outline-none duration-300"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <IconifyIconOffline
                class="check-zh"
                v-show="locale === 'zh'"
                :icon="Check"
              />
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span class="check-en" v-show="locale === 'en'">
                <IconifyIconOffline :icon="Check" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown> -->
    <!-- </div> -->
    <div class="login-container">
      <div class="img">
        <div class="color-bg" />
        <div class="img-bg" />
        <!-- <component :is="toRaw(illustration)" /> -->
        <!-- <img src="@/assets/images/login.png" alt="login" /> -->
      </div>
      <div class="login-box">
        <div class="login-form">
          <!-- <avatar
            style="display: inline-block; width: auto; height: auto"
            class="avatar"
          />
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion> -->
          <div class="login-title">登录</div>
          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: transformI18n($t('login.usernameReg')),
                    trigger: 'blur'
                  }
                ]"
                prop="username"
                style="margin-bottom: 20px"
              >
                <el-input
                  clearable
                  v-model="ruleForm.username"
                  :placeholder="t('login.username')"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  clearable
                  show-password
                  v-model="ruleForm.password"
                  :placeholder="t('login.password')"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4 login-btn"
                size="default"
                type="primary"
                :loading="loading"
                @click="onLogin(ruleFormRef)"
              >
                {{ t("login.login") }}
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}

.login-title {
  padding-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  text-align: left;
}

.login-btn {
  height: 38px;
  margin-top: 6px;
}
</style>
