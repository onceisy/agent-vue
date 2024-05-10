<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import { ref, reactive, onBeforeMount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getAccountList,
  getRoleList,
  addAccountUser,
  updateAccountUser,
  deleteAccountUser
} from "@/api/account";
defineOptions({
  name: "accountManagerIndex"
});
const small = ref(false);
const editDialogFormVisible = ref(false);
const formLoading = ref(false);
const formRef = ref(null);
const isEdit = ref(false);
const validatePass = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入密码"));
  } else if (value.length < 6 || value.length > 12) {
    callback(new Error("请设置6-12位字符密码"));
  } else {
    callback();
  }
};
const validateRePass = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入确认密码"));
  } else if (value !== accountForm.password) {
    callback(new Error("两次密码不一致，请重新输入"));
  } else {
    callback();
  }
};
const validateNickname = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入账号名"));
  } else if (value.replace(/^[a-zA-Z0-9]+$/, "")) {
    callback(new Error("账号名只支持字母和数字"));
  } else {
    callback();
  }
};
const rules = reactive({
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  nickname: [
    {
      required: true,
      validator: validateNickname,
      trigger: "blur"
    }
  ],
  password: [
    {
      required: true,
      validator: validatePass,
      trigger: "blur"
    }
  ],
  rePassword: [
    {
      required: true,
      validator: validateRePass,
      trigger: "blur"
    }
  ],
  role_ids: [{ required: true, message: "请选择角色", trigger: "change" }]
});
const query = reactive({
  nickname: "",
  roles: []
});
const state = reactive({
  tableData: [],
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,
  totalCount: 0,
  rolesList: []
});
const accountForm = reactive({
  name: "",
  nickname: "",
  password: "",
  rePassword: "",
  role_ids: [],
  id: ""
});
const handleSizeChange = (val: number) => {
  state.pageSize = val;
  fetchAccountList();
};
const handleCurrentChange = (val: number) => {
  state.currentPage = val;
  fetchAccountList();
};
const handleEdit = async (row: any) => {
  editDialogFormVisible.value = true;
  if (row == null) {
    // 添加
    isEdit.value = false;
    accountForm.name = "";
    accountForm.nickname = "";
    accountForm.password = "";
    accountForm.rePassword = "";
    accountForm.role_ids = [];
    accountForm.id = "";
  } else {
    // 编辑
    isEdit.value = true;
    accountForm.name = row.name;
    accountForm.nickname = row.nickname;
    accountForm.password = row.password;
    const newArr = [];
    row.roles?.forEach((item: any) => {
      newArr.push(item.role_id);
    });
    accountForm.role_ids = newArr;
    accountForm.id = row.id;
  }
};
// 随机字符
const randomWord = (min, max) => {
  let str = "";
  let range = min;
  const arr = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z"
  ];
  // 随机产生
  range = Math.round(Math.random() * (max - min)) + min;
  for (let i = 0; i < range; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
};
// 自动生成密码
const updatePassword = () => {
  const _pattern = "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,10}$";
  let _pwd = randomWord(8, 11);
  while (!_pwd.match(_pattern)) {
    _pwd = randomWord(8, 11);
  }
  const teStr = "#_!";
  const _numRan = Math.floor(Math.random() * 4);
  const _arrayStr = _pwd.split("");
  _arrayStr.splice(_numRan, 0, teStr.charAt(_numRan));
  accountForm.password = _arrayStr.join("");
};
// 保存数据
const saveData = () => {
  formRef.value.validate(async valid => {
    if (valid) {
      formLoading.value = true;
      let actionFun = addAccountUser;
      const actionForm = accountForm;
      if (accountForm.id) {
        // 有id是编辑，反之是新增
        actionFun = updateAccountUser;
      } else {
        delete actionForm.id;
      }
      delete actionForm.rePassword;
      try {
        await actionFun(actionForm);
        formLoading.value = false;
        ElMessage.success("保存成功");
        editDialogFormVisible.value = false;
        handleCurrentChange(1);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          ElMessage.error(error.response.data.message);
        } else {
          ElMessage.error("保存失败！");
        }
      }
    }
  });
};
// 删除
const handleDel = async (id: string) => {
  ElMessageBox.confirm("确定要删除吗?", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      await deleteAccountUser(id);
      ElMessage.success("删除成功");
      handleCurrentChange(1);
    })
    .catch(() => {
      ElMessage.error("删除失败");
    });
};
const handleTableData = (data: any) => {
  data.forEach((item: any) => {
    let str = "";
    item.roles.forEach((roleItem: any) => {
      str += `${roleItem.name} 、`;
    });
    item.rolesName = str.slice(0, -1);
  });
  return data;
};
const normalFetch = () => {
  // 表单搜索
  state.currentPage = 1;
  fetchAccountList();
};
const fetchAccountList = async () => {
  const filters = { filters: [] } as any;
  if (query.nickname) {
    //%为模糊搜索，不加的话是完全匹配
    filters.filters.push({
      name: "nickname",
      op: "like",
      val: `%${query.nickname}%`
    });
  }
  if (query.roles.length > 0) {
    filters.filters.push({ name: "role", op: "in", val: query.roles });
  }
  const newFilters = JSON.stringify(filters);
  const str = `?q=${newFilters}&page=${state.currentPage}&results_per_page=${state.pageSize}`;
  await getAccountList(str).then((res: any) => {
    state.tableData = handleTableData(res.objects || []);
    state.currentPage = res.page || 1;
    state.totalCount = res.num_results || 0;
  });
};
const fetchRoleList = async () => {
  await getRoleList("").then((res: any) => {
    state.rolesList = res.objects || [];
  });
};
onBeforeMount(() => {
  fetchAccountList();
  fetchRoleList();
});
</script>

<template>
  <div class="account main-continer">
    <div class="title">
      <el-form
        ref="formRef"
        :model="query"
        label-position="left"
        style="display: flex"
      >
        <el-form-item label="账号名">
          <el-input
            :clearable="true"
            v-model.trim="query.nickname"
            @keyup.enter="normalFetch"
            @blur="normalFetch"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item label="权限" class="margin-left--24">
          <el-select
            v-model="query.roles"
            multiple
            placeholder="请选择"
            @change="normalFetch"
          >
            <el-option
              v-for="item in state.rolesList"
              :value="item.role_id"
              :label="item.name"
              :key="item.role_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" :icon="Plus" @click.stop="handleEdit(null)"
        >添加账号</el-button
      >
    </div>
    <div class="account-content">
      <el-table :data="state.tableData" border style="width: 100%">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="nickname" label="账号名" />
        <el-table-column prop="corp_id" label="账户ID" />
        <el-table-column prop="rolesName" label="角色" />
        <el-table-column prop="operate" label="操作">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button type="primary" link @click="handleDel(scope.row?.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="page">
        <el-pagination
          v-model:current-page="state.currentPage"
          v-model:page-size="state.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :small="small"
          :disabled="false"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="state.totalCount"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <!-- 添加账号弹窗 -->
    <el-dialog
      :size="500"
      v-model="editDialogFormVisible"
      :title="isEdit ? '编辑账号' : '添加账号'"
      direction="rtl"
      v-loading="formLoading"
    >
      <el-form
        :model="accountForm"
        ref="formRef"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="姓名" prop="name">
          <el-input
            :disabled="isEdit"
            v-model.trim="accountForm.name"
            autocomplete="off"
            placeholder="请输入姓名"
            maxlength="10"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="账户名" prop="nickname">
          <el-input
            :disabled="isEdit"
            v-model.trim="accountForm.nickname"
            autocomplete="off"
            placeholder="请输入账户名"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item prop="password" v-if="!isEdit">
          <slot name="label">
            <span>密码</span>

            <span
              class="iconfont suiji"
              @click="updatePassword"
              style="
                margin-left: 504px;
                font-size: 14px;
                color: #409eff;
                cursor: pointer;
              "
              >生成随机码</span
            >
          </slot>
          <el-input
            v-model.trim="accountForm.password"
            type="password"
            autocomplete="new-password"
            placeholder="请输入密码"
            minlength="6"
            maxlength="12"
            show-word-limit
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="rePassword" v-if="!isEdit">
          <el-input
            v-model.trim="accountForm.rePassword"
            autocomplete="new-password"
            type="password"
            placeholder="请再次确认密码"
            minlength="6"
            maxlength="12"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role_ids">
          <el-select
            v-model="accountForm.role_ids"
            multiple
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in state.rolesList"
              :value="item.role_id"
              :label="item.name"
              :key="item.role_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveData"> 保存 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page {
  display: flex;
  justify-content: right;
  margin-top: 20px;
}

.margin-left--24 {
  margin-left: 24px;
}
</style>
