# 访问统计

在线阅读页使用 Google Analytics 4（GA4），在维护者的 Zhong_ads 账号中拥有独立媒体资源「软件世界模型」。三个知识库分别统计，无需按路径混合筛选。

[打开 软件世界模型 统计后台](https://analytics.google.com/analytics/web/#/a314372642p558233094/reports/intelligenthome)

## 查看数据

- 在「实时」报告查看最近访问及搜索操作。
- 在「网页和屏幕」报告查看文章标题、浏览次数与互动时长。
- 在「事件」报告查看搜索、继续阅读、打印和 GitHub 点击次数。标准报告处理会有延迟。

文章有独立统计路径，例如 `/software-world-model/home`。每次切换文章只记录一次浏览，大纲跳转不重复计数。统计脚本加载较慢时保留事件原来的文章上下文。

## 记录哪些数据

- `page_view`：首页、文章标题与文章编号。
- `search_open`：打开搜索。
- `search`：停顿 800 毫秒后的搜索操作，仅记录搜索词长度和结果数。
- `search_result_click`：点击搜索结果，记录目标文章编号。
- `resume_reading`：使用继续阅读入口。
- `print`：点击打印入口；不代表已经完成打印。
- `github_click`：点击 GitHub 链接。

不上传搜索词、阅读位置、本地存储内容或用户账号标识。页面与来源地址去除查询参数及片段。GA4 使用统计 Cookie 区分访问，Cookie 前缀和路径按知识库分开；未启用 Google Signals、广告个性化或自动表单、站内搜索采集。访客数为工具估算，不等同于精确人数；网络条件与广告拦截器可能使部分访问无法统计。

## 配置和维护

- `app/analytics.json`：公开衡量 ID、允许的域名与项目路径。
- `app/analytics.js`：GA4 统计逻辑，构建时嵌入阅读页面。
- 仅在配置的 HTTPS 域名与项目路径下加载统计；本地预览、离线 HTML 和其他域名上的副本不发送统计。
- 尊重浏览器的 Do Not Track 和 Global Privacy Control 设置。脚本失败时仍可正常阅读。
- GA4 数据流的「增强型衡量功能」保持关闭，代码以 `send_page_view: false` 禁用默认浏览，再明确发送各篇文章的浏览，避免重复计数和自动采集输入。
- 修改后运行 `npm test`、`npm run build`、`npm run check`，再按原 GitHub Pages 流程发布。

衡量 ID 是网页公开使用的标识，不是登录凭据。Fork 后换为自己的 ID 与域名，或把 `hostname` 设置为空字符串以关闭统计。

切换前的数据仍保留在[原 Umami 后台](https://cloud.umami.is/analytics/us/websites/79788f43-5c65-4279-8249-0d094eef04f3)，新访问从切换后进入 GA4。

[Google 官方设置说明](https://support.google.com/analytics/answer/14183469?hl=zh-Hans) · [单页应用统计](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)
