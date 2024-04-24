const defData = `# 请在这里写文章标题，为了方便搜索最好以关键字开头！！！
请在这里输入此文章的描述，鼠标移动到保存文章按钮上，数据将会自动的识别文章标题和描述。

## 目录

[TOC]

![文章的封面](image/logo.png "文章的封面")
## 开始

在这里可以书写文章正文，请不要忘记保存您写的内容哦!!!

\`\`\`java
public static boolean main() {
\tSystem.out.println("您也可以在这里写一个代码块哦！")
\treturn false;
}\`\`\`
`;

function init(str) {
    // 新增状态的 初始化可见性 以及 文章数据
    return editormd("article_editor", {
        width: "100%",
        height: '92.5%',
        htmlDecode: "video,style,iframe,sub,sup|on*",
        markdown: str ? str : defData,
        // Editor.md theme, default or dark, change at v1.5.0
        // You can also custom css class .editormd-theme-xxxx
        theme: "dark",

        // Preview container theme, added v1.5.0
        // You can also custom css class .editormd-preview-theme-xxxx
        previewTheme: "dark",

        // Added @v1.5.0 & after version this is CodeMirror (editor area) theme
        editorTheme: "twilight",
        emoji: true,
        path: "editor.md/lib/"  // Autoload modules mode, codemirror, marked... dependents libs path
    });
}


