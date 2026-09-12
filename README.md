# AI 助手 — vivo Watch GT2 / BlueOS 3

> 版本：**v1.0.0**
> 开发者：张岳
> 开发团队：小默软件工作室
> 联系方式：zy291817@outlook.com

一个面向 **vivo Watch GT2 / BlueOS 3** 的免费 AI 助手应用，**支持联网**调用兼容 OpenAI 协议的大模型接口。App 本身完全免费，模型调用通过用户自带的免费 API Key（默认接入 SiliconFlow 免费平台）实现。

## 功能

- 聊天界面：消息列表 + 输入框，对话历史本地持久化
- 联网能力：基于 BlueOS `fetch` 调用 OpenAI 兼容接口
- 设置页：可自定义接口地址、API Key、模型名、系统提示词
- 关于页：展示应用名、版本号、开发者信息
- 手表适配：`designWidth=466`，兼容方形/圆形手表

## 项目结构

```
/workspace
├── package.json
├── jsconfig.json
├── .gitignore
└── src
    ├── manifest.json          # 应用配置（声明 fetch/kvstore/router 能力）
    ├── app.ux                 # 应用入口与全局默认配置
    ├── assets/images/logo.jpg # 应用图标
    ├── helper
    │   ├── storage.js         # K-V 存储封装（设置 + 对话历史）
    │   └── ai.js              # fetch 封装的 AI 请求
    └── pages
        ├── Chat/index.ux      # 主聊天页
        └── Settings/index.ux  # 设置页（含关于）
```

## 如何编译为 rpk

> rpk 是 BlueOS 应用的安装包格式。生成 rpk 必须使用官方 **BlueOS Studio**，本仓库只包含源码。

1. 下载并安装 [BlueOS Studio](https://studio.blueos.com.cn/install)
2. 打开 BlueOS Studio → 「打开本地工程」→ 选择本仓库根目录
3. 点击预览区「安装依赖」（或终端执行 `pnpm i` / `npm i`）
4. 连接 vivo Watch GT2 真机，或使用内置预览器调试
5. 菜单 「构建 → 生成正式包」 选择签名证书后即可生成 `*.rpk` 文件
6. 输出目录通常为 `dist/`，包名形如 `com.free.aiwatch.rpk`

## 如何使用

1. 应用启动 → 点右上「设置」
2. 填入从 SiliconFlow 免费领取的 API Key（接口地址/模型已预填默认值）
3. 保存返回 → 在输入框输入问题 → 发送，即可联网获得 AI 回复

## 免费接入说明

- 默认接入 [SiliconFlow](https://cloud.siliconflow.cn)：注册即送免费额度，含 Qwen2.5-7B 等免费模型
- 也兼容 DeepSeek、Moonshot、自建 OpenAI 兼容服务：只需在设置页修改接口地址 + 模型 + Key 即可

## 联网前提

- 手表需通过手机蓝牙中转联网，或手表自带 eSIM / Wi-Fi 联网
- API Key 仅存在手表本地，不上传任何服务器

## 版本

- **v1.0.0**（首次发布）

## 联系

- 开发者：张岳
- 开发团队：小默软件工作室
- 邮箱：zy291817@outlook.com
