# 王冕数字分身 + 分身大脑 设计

- 日期：2026-07-28（初稿）/ 2026-07-29（双 Skill 落地）
- 状态：**已落地**
- 形态：两个个人 Cursor Skill

| Skill | 目录 | 中文名 |
|-------|------|--------|
| `wangmian-brain` | `~/.cursor/skills/wangmian-brain/` | 王冕的分身大脑 |
| `wangmian-twin` | `~/.cursor/skills/wangmian-twin/` | 王冕的数字分身 |

## 目标

本尊使用分身与大脑时，按用户习惯（UI/UX 审美、访谈与总结、工具、上下文）**自动产出需求**；业务真相来自 OneOS 知识库，不靠聊天流水账硬记。

## 决策摘要

| 项 | 选择 |
|----|------|
| 自动档位 | B 突击型 |
| 云效 | Y2（本地完再问） |
| 触发 | T1 口令；分身内嵌可调大脑 |
| 称呼 | 我的本尊 |
| 分身口吻 | 产品日常；禁李云龙 |
| KB | `src/resources/oneos-knowledge-base/`（可回落 oneos-v2 绝对路径） |

## 文件

```text
wangmian-brain/
  SKILL.md · retrieval.md · voice.md

wangmian-twin/
  SKILL.md · persona.md · profile.md · habits.md · playbook.md
```

自我介绍：以 `profile.md` 为准（工作画像 + 话术模板）。

## 口令

- 大脑：`@王冕分身大脑` / `$wangmian-brain` / 「分身大脑」
- 分身：`@王冕分身` / `$wangmian-twin` / 「王冕的数字分身」

## 冒烟

新开对话（工作区建议 oneos-v2）：

1. `$wangmian-brain` 问一条业财门禁 → 应出大脑答复包  
2. `$wangmian-twin` 扔一条小需求 → 应称「我的本尊」、引用大脑、无李云龙腔、末尾问云效  
