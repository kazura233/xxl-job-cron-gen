# cronGen.js

## 来源

来自 XXL-JOB 开源项目的前端静态资源：

https://github.com/xuxueli/xxl-job/blob/master/xxl-job-admin/src/main/resources/static/plugins/cronGen/cronGen.js

## 说明

这是 XXL-JOB 调度中心后台管理页面内置的 Cron 表达式可视化生成器，基于 jQuery + Bootstrap 实现。以 jQuery 插件的形式提供，调用方式为 `$(selector).cronGen(options)`。

功能上提供秒、分钟、小时、日、月、周、年共 7 个维度的配置面板，支持每隔 N 个单位、指定区间、指定具体值等多种模式，最终生成符合 XXL-JOB 格式的 6~7 位 Cron 表达式。

## 与本项目的关系

本项目（`xxl-job-cron-gen`）以此文件为参照，将相同的功能改写为 React + TypeScript 组件，不依赖 jQuery 和 Bootstrap，可直接在现代 React 应用中使用。
