<template>
  <div class="resize-table" ref="configTableCon" style="width: 100%">
    <el-table
      :data="data"
      style="width: 100%"
      :highlight-current-row="light"
      ref="tableRef"
      v-loading="showLoading"
      @select="selectChange"
      @select-all="selectAll"
      @current-change="currentChange"
      :border="true"
      row-key="id"
      size="small"
    >
      <template #empty>
        <p>没有查询到符合条件的记录</p>
      </template>
      <el-table-column
        reserve-selection="true"
        type="selection"
        v-if="selection"
        fixed="left"
        width="55"
        :border-line="false"
      />
      <template v-for="item in headersNew">
        <!-- 父组件自定义 -->
        <el-table-column
          v-if="item.custom && item.show"
          :width="item.width || defaultCellWidth"
          :key="item.prop || item.name"
          :label="item.label || item.displayName"
          :sortable="item.isSort"
          :show-overflow-tooltip="!item.noTip"
          v-bind="item"
        >
          <template v-slot:header="{ column }">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="column.label || column.displayName"
              :show-arrow="false"
              placement="top-start"
            >
              <span>{{ column.label || column.displayName }}</span>
            </el-tooltip>
          </template>
          <template #default="scope">
            <slot :name="item.prop || item.name" :scope="scope" :item="item" />
          </template>
        </el-table-column>
        <!-- 操作栏 -->
        <el-table-column
          v-else-if="item.prop === 'oprate' && item.show"
          :key="item.prop + 'a'"
          :sortable="item.isSort"
          v-bind="item"
          v-has
          fixed="right"
          :width="item.width || defaultCellWidth"
        >
          <template #default="scope">
            <slot :name="item.prop" :scope="scope" :item="item" />
          </template>
        </el-table-column>
        <!-- 缓存数据匹配 -->
        <el-table-column
          v-else-if="item.cache && item.show"
          :key="(item.name || item.prop) + 'c'"
          :prop="item.prop || item.name"
          :label="item.label || item.displayName"
          :sortable="item.isSort"
          :width="item.width || defaultCellWidth"
          :show-overflow-tooltip="!item.noTip"
        >
          <template v-slot:header="{ column }">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="column.label || column.displayName"
              :show-arrow="false"
              placement="top-start"
            >
              <span>{{ column.label || column.displayName }}</span>
            </el-tooltip>
          </template>
          <template #default="scope">
            <span>{{
              getCacheName(item.cache, scope.row[item.prop || item.name])
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-else-if="item.show"
          :sortable="item.isSort"
          :prop="item.prop || item.name"
          :label="item.label || item.displayName"
          :width="item.width || defaultCellWidth"
          :key="(item.name || item.prop) + 'b'"
          :show-overflow-tooltip="!item.noTip"
          :formatter="item.formatter"
        >
          <template v-slot:header="{ column }">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="column.label || column.displayName"
              :show-arrow="false"
              placement="top-start"
            >
              <span>{{ column.label || column.displayName }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
      </template>
      <!-- 表头自定义 -->
      <el-table-column
        fixed="right"
        width="56"
        :resizable="false"
        v-if="headersConfig"
      >
        <template #header>
          <el-dropdown
            ref="customConfig"
            trigger="contextmenu"
            @visible-change="visibleChange"
          >
            <span
              class="el-dropdown-link"
              :style="{ background: isClick ? '#E6E6E6' : '' }"
              @click="showConfig"
            >
              <el-icon :class="{ 'icon-active': isClick }"><Setting /></el-icon>
            </span>
            <template #dropdown>
              <custom-config
                :header="header"
                :query="querys"
                :tip="tip"
                :tableType="tableType"
                :tableName="tableName"
                :tableHeaderConfigType="tableHeaderConfigType"
                @onHeaderChange="headerChange"
                @onQueryChange="queryChange"
                @onShow="showConfig"
              />
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <template v-if="showPagination">
      <div class="page">
        <slot name="showSummary" />
        <el-pagination
          class="pages"
          :disabled="isAllCheck"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="pagingData.page"
          :page-sizes="[10, 20, 50]"
          :page-size="pagingData.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagingData.total"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  watch,
  getCurrentInstance,
  nextTick,
  computed,
  onMounted,
  ref,
  onBeforeUnmount
} from "vue";
import customConfig from "./customConfig.vue";
import { globalDataModule } from "@/common/stores/globalData";
import { round } from "lodash";
import { userStore } from "@/common/stores/user";

const defaultPaging = {
  total: 0,
  "page-size": 10,
  "page-sizes": [5, 10, 30],
  "current-page": 1
};
const GLOBALDATAMODULE = globalDataModule();
export default defineComponent({
  name: "ResizeTable",
  components: { customConfig },
  props: {
    showPagination: {
      // 是否展示翻页，默认展示
      type: Boolean,
      default: true
    },
    headers: {
      // 表头数据
      type: Object,
      required: true,
      default: () => [] as any
    },
    querys: {
      // 常用筛选
      type: Array,
      default: () => []
    },
    data: {
      // 表格数据
      type: Array,
      default: () => []
    },
    pagingData: {
      // 分页
      type: Object,
      default: () => defaultPaging
    },
    selection: {
      // 是否展示表格前面的多选框
      type: Boolean,
      default: false
    },

    light: {
      // 是否要高亮当前行
      type: Boolean,
      default: true
    },
    headersConfig: {
      // 是否展示配置表头，默认不展示
      type: Boolean,
      default: false
    },
    tip: {
      type: String,
      default: ""
    },
    /* 用于更新表头 */
    tableType: {
      type: String,
      default: ""
    },
    tableName: {
      type: String,
      default: ""
    },
    tableHeaderConfigType: {
      type: String,
      default: ""
    },
    isWatch: {
      type: String
    }
  },
  emits: [
    "onChangeSelect",
    "onPageChange",
    "onPageSizeChange",
    "onHeaderChange",
    "onQueryChange",
    "onCurrentChange"
  ],
  setup(props, { emit }) {
    const instance: any = getCurrentInstance();
    const state = reactive({
      checkList: [], // 表头数据
      isClick: false, // 表头操作按钮的显隐
      isAllCheck: false, // 是否全选
      pageSelect: {} as any, // 根据选择存储数据
      selectList: [], // 选中数据
      checkInit: false, // 是否初始化
      showLoading: false, // loading...
      dicMap: []
    });

    const header: any = computed(() => {
      return props.headers;
    });
    const headersNew: any = computed(() => {
      return props.headers;
    });
    const dicMap = computed(() => {
      return GLOBALDATAMODULE.dicMap || {};
    });

    const getCacheName = computed(() => {
      return function (type, prop) {
        const cacheData =
          (type === "systemUser"
            ? GLOBALDATAMODULE.systemUser
            : dicMap.value[type]) || [];
        let codeName = "";
        if (cacheData && cacheData.length) {
          cacheData.forEach(item => {
            if (item.codeValue === prop) {
              codeName = item.codeName;
            }
          });
          return codeName;
        }
      };
    });

    function handleCurrentChange(page: any) {
      // 翻页
      emit("onPageChange", page);
    }

    function handleSizeChange(size: any) {
      // limit变化
      emit("onPageSizeChange", size);
    }

    function selectChange(selection: any) {
      emit("onChangeSelect", selection);
    }

    function selectAll(selection: any) {
      emit("onChangeSelect", selection);
    }

    function currentChange(currentRow) {
      emit("onCurrentChange", currentRow);
    }

    function clearSelection() {
      // 清空选择
      instance?.refs.tableRef.clearSelection();
    }
    function headerChange(headerData: any) {
      // 表头配置变化
      state.showLoading = true;
      setTimeout(() => {
        state.showLoading = false;
      }, 400);
      emit("onHeaderChange", headerData);
    }

    const showConfig = () => {
      state.isClick = true;
      nextTick(() => {
        instance?.refs.customConfig.handleOpen();
      });
    };

    const visibleChange = (visible: boolean) => {
      state.isClick = visible;
    };

    const queryChange = (data: any) => {
      // 筛选配置变化
      emit("onQueryChange", data);
    };

    watch(
      // 监听表格数据变化
      () => props.data,
      () => {
        if (props.isWatch != "no") {
          clearSelection();
        }
      }
    );
    const configTableCon = ref(null);
    const defaultCellWidth = ref<number>(50);

    const userState = userStore();
    const isCollapse = computed(() => userState.isCollapse);

    function resizeTableColumnWidth() {
      const tableWidth = configTableCon.value.clientWidth;
      if (tableWidth > 0 && headersNew.value.length > 0) {
        const visibleHeaders = headersNew.value.filter(i => i.show);
        let w = 0;
        visibleHeaders.forEach(i => {
          if (i.width) {
            w = w + i.width;
          }
        });
        const headers2 = visibleHeaders.filter(o => !o.width);
        // 减去手动设置了width的宽度，减去headerConfig的宽度
        if (props.headersConfig) {
          w = w + 56;
        }
        // 进去多选列宽度
        if (props.selection) {
          w = w + 55;
        }
        const width = round((tableWidth - w) / headers2.length, 1);
        if (width >= 50) {
          defaultCellWidth.value = width;
        } else {
          defaultCellWidth.value = 50;
        }
      }
    }

    watch(
      [headersNew, isCollapse],
      () => {
        nextTick(resizeTableColumnWidth);
      },
      {
        immediate: true,
        deep: true
      }
    );

    onMounted(() => {
      console.log(props.data);
      window.addEventListener("resize", resizeTableColumnWidth);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeTableColumnWidth);
    });
    return {
      handleCurrentChange,
      handleSizeChange,
      cellDblclick,
      selectChange,
      selectAll,
      visibleChange,
      showConfig,
      queryChange,
      headerChange,
      getCacheName,
      header,
      dicMap,
      headersNew,
      rowClick,
      rowdblClick,
      currentChange,
      ...toRefs(props),
      ...toRefs(state),
      configTableCon,
      defaultCellWidth
    };
  }
});
</script>

<style lang="scss" scoped>
.resize-table {
  width: 100%;
  height: 100%;

  .page {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .el-dropdown-link {
    width: 24px;
    height: 24px;
    padding: 5px 0;
    text-align: center;
    border-radius: 4px;

    .el-icon {
      color: rgb(0 0 0 / 88%);
      cursor: pointer;
    }

    .icon-active {
      color: #008cee;
    }
  }

  & :deep {
    .sort-caret {
      left: 70px;
    }

    .el-table-column--selection {
      .cell {
        display: flex;
      }

      .el-checkbox__inner {
        border-color: rgb(0 0 0 / 38%);
      }

      .el-checkbox__input.is-checked .el-checkbox__inner {
        border-color: #1e63f5;
      }
    }

    .px-2 {
      .cell {
        padding-right: 2px;
        padding-left: 2px;
      }
    }

    .text-row-1 {
      .cell {
        width: inherit;
        overflow: hidden;
        text-overflow: clip;
        white-space: nowrap;
      }
    }
  }

  .batch-oprate {
    position: relative;
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 18px;
    margin-top: 16px;
    line-height: 36px;
    background: rgb(30 99 245 / 10%);
    border-radius: 4px;

    .selected-count {
      margin: 0 24px 0 18px;
      color: #303753;

      .selectedNum {
        margin: 0 4px;
        color: #1e63f5;
      }
    }

    .selectedBtn {
      display: flex;
      align-items: center;

      .line {
        width: 1px;
        height: 10px;
        margin: 0 8px;
        background: rgb(30 99 245 / 30%);
      }
    }

    .oprate-close {
      position: absolute;
      right: 18px;
      color: #1e63f5;
      cursor: pointer;
    }
  }

  .pages {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 48px;
  }

  & :deep(.el-table__empty-text) {
    line-height: 20px;

    img {
      margin-top: 10px;
    }
  }
}
</style>
