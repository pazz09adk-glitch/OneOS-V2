# 原型演示页 · 产品需求说明（PRD）

> 羚牛 OneOS 原型演示宿主页。复用 `OneOsAppShell` 外壳组件，全自动化联动 `nav-menu.json` 动态级联菜单，提供带有左侧导航和顶栏 Chrome 的整体产品运行预览体验。

## 1. 目标与价值

在 PC Web 提供完整的 OneOS 级联导航与多页签外壳预览能力，使评审人员与开发团队能够在真实 SaaS 布局下演示、导航与验证全流程原型页面。

## 2. 目标用户与核心任务

| 角色 | 任务 |
|------|------|
| 产品经理 / 项目经理 / 交互设计师 | 进行全系统功能走查、客户演示与产品评审 |
| 前端 / 后端开发工程师 | 查看真实产品框架下的信息架构、菜单层级与多页签联动形态 |

## 3. 核心功能规范

1. **级联侧边栏 (Side Navigation)**
   - 自动解析 `src/prototypes/oneos-prototype-nav/nav-menu.json` 导出级联菜单树。
   - 支持一级分组展开/收起、收起侧栏图标模式。
2. **Tab 多页签系统 (Multi-Tab Chrome)**
   - 包含顶栏 Chrome 面板，支持平滑切换已点开原型。
   - 支持动态新增页签、手动关闭页签，保证至少留存一个默认页签。
3. **URL Hash 路由驱动 (Hash Deep-Linking)**
   - Hash 格式为 `#proto=<prototype-id>`。
   - 页面首次加载或 Hash 变更时自动联动选中的菜单项并刷新 iframe。
4. **演示级刷新与深色模式**
   - 顶栏刷新按钮重载右侧 iframe 视图。
   - 浅/暗色模式一键切换。

## 4. 关键逻辑与验收重点

- [x] 打开 `/prototypes/oneos-prototype-demo` 能够正常加载左侧 OneOS 级联菜单与顶栏 Chrome。
- [x] 点击侧栏菜单能平滑将右侧 iframe 切换至指定原型页面。
- [x] URL Hash 实时反映当前选中的原型 ID。
- [x] 顶部 Tab 支持新增、切换与平滑关闭。
