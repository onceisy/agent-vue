// 表单校验有问题时，滚动到第一个el-error的位置
export function formRollToFirstError(paneNode: any, revise = 0) {
  setTimeout(() => {
    // 延时是为了解决偶发异步取不到is-error节点
    const pane = paneNode.getElementsByClassName("is-error")[0];
    if (pane) {
      paneNode.scrollTop = pane.offsetTop + revise;
      const textareaNode = pane.getElementsByClassName("el-textarea__inner"); // 多行文本
      const inputNode = pane.getElementsByClassName("el-input__inner"); // 单行文本，日期，日期时间，下拉框，数字等
      if (textareaNode && textareaNode[0]) {
        textareaNode[0].focus();
      } else if (inputNode && inputNode[0]) {
        inputNode[0].focus();
      }
    }
  }, 100);
}
