# 访问统计

在线阅读页使用 Umami 统计访问，后台在维护者的 Umami 账号中：

[打开统计面板](https://cloud.umami.is/analytics/us/websites/79788f43-5c65-4279-8249-0d094eef04f3)

软件世界模型与网络世界模型共用「开源知识库」站点。页面路径以 `/software-world-model/` 或 `/network-world-model/` 开头，可以按路径或对应的标签筛选知识库。文章使用独立统计路径，例如 `/software-world-model/program`；每次切换文章记录一次浏览，文章内的大纲跳转不重复计数。

## 记录哪些数据

- 页面浏览：知识库首页、文章标题与文章编号。
- 访问来源：来源网页的域名和路径，去除查询参数及片段。
- `search-open`：打开搜索。
- `search`：停顿 800 毫秒后的搜索操作，仅记录搜索词长度和结果数。
- `search-result-click`：点击搜索结果，记录目标文章编号。
- `resume-reading`：使用继续阅读入口。
- `print`：点击打印入口；不代表已经完成打印。
- `github-click`：点击 GitHub 链接。

不上传搜索词、阅读位置或本地存储内容，也不设置用户账号标识。统计依赖读者浏览器成功加载脚本，可能被广告拦截器或网络条件阻止；访客数是统计工具按其规则估算的数量，不等同于精确人数。

## 配置和维护

- `app/analytics.json`：脚本地址、公开站点 ID、允许的域名与项目路径。
- `app/analytics.js`：统计逻辑，构建时嵌入阅读页面。
- 仅在配置的 HTTPS 域名与项目路径下加载统计；本地预览、离线 HTML 和其他域名上的副本不发送统计。
- 尊重浏览器的 Do Not Track 设置。统计脚本失败时仍可正常阅读。
- 修改配置后运行 `npm test`、`npm run build`、`npm run check`，再按原发布流程部署。

站点 ID 是网页中公开使用的统计标识，不是登录凭据。Fork 后请更换为自己的配置，或把 `hostname` 设置为空字符串以关闭统计。

后台可查看访客、浏览次数、来源、文章和自定义事件。搜索事件的附加数据在事件属性中查看。账号后台保持私有；本项目没有启用公开分享统计面板。

[Umami 文档](https://docs.umami.is/docs/collect-data) · [事件统计](https://docs.umami.is/docs/track-events)
