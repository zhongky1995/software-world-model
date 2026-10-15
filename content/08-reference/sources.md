# 想再深入，去哪里读？

这份知识库先帮助你理解软件的主要工作和关系。你可以只读中文正文；下面的资料是想进一步查证或深入时的可选入口，大多是英文。

## 这些资料分别解释什么？

- [MDN：客户端与服务端](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview)：网页向远处程序提出要求，再收到响应的过程。
- [操作系统教材 OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/)：程序运行、计算、内存、存储，以及多项工作怎样配合。
- [MDN：JavaScript 执行模型](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model)：一种语言的代码怎样执行，浏览器等环境怎样提供支持。
- [PostgreSQL：事务](https://www.postgresql.org/docs/current/tutorial-transactions.html)：相关修改怎样一起提交或撤销。
- [PostgreSQL：数据约束](https://www.postgresql.org/docs/current/ddl-constraints.html)：数据库怎样帮助限制记录必须满足的规则。
- [PostgreSQL：事务隔离](https://www.postgresql.org/docs/current/transaction-iso.html)：不同读取规则怎样影响能看到的版本；事务与并发正确性需要一起考虑。
- [PostgreSQL：预写日志](https://www.postgresql.org/docs/current/wal-intro.html)：先可靠保存描述修改的日志，再按要求写入数据文件，以支持中断恢复。正文保留这条先后关系，没有展开日志格式。
- [MDN：条件更新 If-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Match)：保存时带上所依据的内容版本，条件不符便拒绝，避免无提示覆盖。正文用递增版本号解释同类判断，具体协议可以使用不同形式的版本标记。
- [AWS：让重试安全的幂等接口](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)：区分新的操作与对同一操作的重试，并可靠处理请求编号。
- [AWS SQS：消息领取后的处理期限](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)：领取后暂时不再交出，完成后确认；过期未确认重新可处理。正文用来解释一种队列恢复思路，没有把它推广为所有队列的唯一实现。
- [Transactional Outbox 模式作者说明](https://microservices.io/patterns/data/transactional-outbox.html)：把待发送信息与业务修改一起保存，再由其他程序发送；发送仍可能重复，接收方也要处理。
- [模块化软件的作者文章](https://martinfowler.com/articles/modularizing-react-apps.html)：怎样通过模块和清楚入口组织代码。具体示例较深入，可以以后再读。
- [Git 教材：版本控制](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control)：记录、比较和恢复文件的变化历史。
- [Martin Fowler：逐步兼容变更](https://martinfowler.com/bliki/ParallelChange.html)：先扩充、迁移使用者或资料，再移除旧安排，帮助理解新旧并存的过渡期。
- [SRE：监测分布式系统](https://sre.google/sre-book/monitoring-distributed-systems/)：怎样用运行信号判断系统是否正常。
- [OWASP：授权检查](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)：身份与许可的区别，以及在每次受保护请求实际执行的位置检查权限。
- [RAG 原始研究论文](https://arxiv.org/abs/2005.11401)：把检索获得的材料与生成模型组合的思路。本文没有引用其实验成绩作为实际产品效果。
- [Anthropic：构建有效的 Agent](https://www.anthropic.com/engineering/building-effective-agents)：固定工作流与模型动态选择行动的区别。本文采用其结构解释，具体工具选择需另行了解。

## 哪些是本知识库为讲解而做的安排？

“七个观察方向”和“做事、记事、合作”是帮助理解的教学分类。阅读助手、收藏动作、工作室分区等是虚构示意，用来展示机制，没有真实用户数据或成功指标。

积分100与20、任务T81、版本7与8、7秒流程、每分钟处理量等数字，也都是为逐步推演而设定的条件。它们展示“按这些条件会得到什么”，不代表某个真实数据库、模型或产品的性能。正文里的候选AI回答和Agent行动顺序是预设示范，没有调用真实模型来证明成功率。

阅读这些例子时，可以分别看原有条件、谁做了什么、中间留下什么、结果怎样，以及条件变化后为何不同。案例帮助建立原理的模型；真正开发时仍要按选用工具的具体保证实现和检查。

类比会省略细节。工作室的分区对应软件职责，电脑里并没有真的房间；工作桌对应临时使用的空间，内存仍是电子设备。正文在相关位置说明了这类局限。

## 读懂这张地图以后，还需要学什么？

具体开发时，还要结合自己的产品了解编程语言、实现工具、部署条件和检查方法。地图让你更容易提出问题、理解安排，不能替代实际运行结果。

这一版继续按完全零基础读者补全案例的中间过程、原理边界和应用判断。编辑审读与桌面、手机显示检查支持交付检查，尚未开展真实读者学习效果研究。
