/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  corePlugins: {
    preflight: false
  },
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg_color: "var(--el-bg-color)",
        primary: "var(--el-color-primary)",
        text_color_primary: "var(--el-text-color-primary)",
        text_color_regular: "var(--el-text-color-regular)",
        text_color_black: "#303133 !important",
        text_color_black2: "#606266 !important"
      },
      backgroundColor: {
        primary_blue: "#409EFF",
        table_header: "#F5F7FA !important"
      }
    }
  }
};
