// 实体类型选项
export const entityTypeOptions = [
  { value: 1, label: "保存实体" },
  { value: 2, label: "直接赋值" },
  { value: 3, label: "自增变量" }
];

export const CateEnum = {
  DIRECT_ANSWER: "1",
  CATE: "2",
  FIXED_SPEECH: "3",
  POLISH: "4"
};

// 角色类型 2.0目前只有回答和分类
export const roleTypeOptions = [
  {
    label: "回答",
    value: CateEnum.DIRECT_ANSWER
  },
  {
    label: "分类",
    value: CateEnum.CATE
  },
  {
    label: "固定话术",
    value: CateEnum.FIXED_SPEECH
  },
  {
    label: "标准润色",
    value: CateEnum.POLISH
  }
];

// 标准策略表单的类型
export const cateTypes = [
  {
    type: "answer",
    options: [
      {
        label: "LLM回答",
        value: "1"
      },
      {
        label: "固定话术",
        value: "3"
      },
      {
        label: "润色回复",
        value: "4"
      },
      {
        label: "知识库回答",
        value: "8"
      }
    ]
  },
  {
    type: "action",
    options: [
      {
        label: "人工服务",
        value: "5"
      },
      {
        label: "按键服务",
        value: "6"
      },
      {
        label: "挂机服务",
        value: "7"
      }
    ]
  }
];

// 条件判断
export const conditionRule = [
  {
    label: "为空",
    value: "A"
  },
  {
    label: "不为空",
    value: "B"
  },
  {
    label: "等于",
    value: "C"
  },
  {
    label: "不等于",
    value: "D"
  }
];
