# Cron 表达式生成器

一个基于 React + TypeScript 的 Cron 表达式可视化生成器组件，支持 React 18 和 React 19。

**在线示例：** https://kazura233.github.io/xxl-job-cron-gen/

## 快速开始

```tsx
// 导入组件
import { CronGen } from '@/components/cron'

// 如果需要类型定义和工具函数
import type { CronGenProps, CronValue } from '@/components/cron/exports'
import { parseCronExpression, validateCronExpression } from '@/components/cron/exports'
```

## 特性

- ✅ 完整的 TypeScript 支持
- ✅ 支持秒、分钟、小时、日、月、周、年七个维度配置
- ✅ 支持多种配置模式：每X、周期、间隔、指定等
- ✅ 支持周字段第N个周期日（`#` 符号，如每月第2个周一）
- ✅ 自动解析和生成标准 Cron 表达式
- ✅ 日和周字段互斥处理
- ✅ 纯 CSS 样式，无外部依赖
- ✅ 兼容 React 18 和 React 19
- ✅ 代码结构清晰，易于维护和扩展

## 安装

```bash
npm install xxl-job-cron-gen
# or
yarn add xxl-job-cron-gen
# or
pnpm add xxl-job-cron-gen
```

## 基础用法

```tsx
import React, { useState } from 'react'
import { CronGen } from 'xxl-job-cron-gen'

function App() {
  const [cronExpression, setCronExpression] = useState('0 0 0 * * ?')

  return (
    <div>
      <CronGen value={cronExpression} onChange={setCronExpression} />
      <p>当前表达式: {cronExpression}</p>
    </div>
  )
}
```

## 配合 Popover 使用

组件本身不包含 Popover 功能，使用方可以根据自己的 UI 库自由实现。

### 使用 Ant Design

```tsx
import React, { useState } from 'react'
import { Popover, Input, Button } from 'antd'
import { CronGen } from 'xxl-job-cron-gen'

function CronInput() {
  const [value, setValue] = useState('0 0 0 * * ?')
  const [open, setOpen] = useState(false)

  return (
    <Popover
      content={
        <CronGen
          value={value}
          onChange={(newValue) => {
            setValue(newValue)
            // 可选：自动关闭
            // setOpen(false);
          }}
        />
      }
      title="配置 Cron 表达式"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      overlayStyle={{ width: 500 }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="请输入或点击配置 Cron 表达式"
        suffix={<Button size="small">配置</Button>}
      />
    </Popover>
  )
}
```

### 使用自定义 Popover

```tsx
import React, { useState } from 'react'
import { CronGen } from 'xxl-job-cron-gen'
import { MyPopover } from './MyPopover'

function CronInput() {
  const [value, setValue] = useState('0 0 0 * * ?')

  return (
    <MyPopover content={<CronGen value={value} onChange={setValue} />}>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
    </MyPopover>
  )
}
```

## API

### CronGen Props

| 属性      | 说明                    | 类型                      | 默认值          |
| --------- | ----------------------- | ------------------------- | --------------- |
| value     | 当前的 Cron 表达式值    | `string`                  | `'* * * * * ?'` |
| onChange  | Cron 表达式变化时的回调 | `(value: string) => void` | -               |
| className | 自定义类名              | `string`                  | -               |
| style     | 自定义样式              | `React.CSSProperties`     | -               |

## 工具函数

组件还导出了一些实用的工具函数：

### parseCronExpression

解析 Cron 表达式为对象格式。

```tsx
import { parseCronExpression } from 'xxl-job-cron-gen'

const parsed = parseCronExpression('0 0 12 * * ?')
// {
//   second: '0',
//   minute: '0',
//   hour: '12',
//   day: '*',
//   month: '*',
//   week: '?',
//   year: ''
// }
```

### generateCronExpression

根据对象生成 Cron 表达式字符串。

```tsx
import { generateCronExpression } from 'xxl-job-cron-gen'

const expression = generateCronExpression({
  second: '0',
  minute: '0',
  hour: '12',
  day: '*',
  month: '*',
  week: '?',
  year: ''
})
// '0 0 12 * * ?'
```

### validateCronExpression

验证 Cron 表达式是否有效。

```tsx
import { validateCronExpression } from 'xxl-job-cron-gen'

validateCronExpression('0 0 12 * * ?') // true
validateCronExpression('invalid') // false
```

## Cron 表达式格式

标准的 Cron 表达式由 6-7 个字段组成：

```
秒 分 时 日 月 周 [年]
```

### 字段说明

| 字段 | 允许值       | 允许的特殊字符 |
| ---- | ------------ | -------------- |
| 秒   | 0-59         | , - \* /       |
| 分   | 0-59         | , - \* /       |
| 时   | 0-23         | , - \* /       |
| 日   | 1-31         | , - \* / L W   |
| 月   | 1-12         | , - \* /       |
| 周   | 1-7 (1=周日) | , - \* / L # |
| 年   | 1970-2099    | , - \* /       |

### 特殊字符说明

- `*` : 表示匹配该字段的任意值
- `?` : 只能用在日和周字段，表示不指定值
- `-` : 表示范围，例如在分钟字段使用 5-20，表示从5分到20分
- `,` : 表示列举多个值，例如在分钟字段使用 5,20，表示5分和20分
- `/` : 表示增量，例如在分钟字段使用 0/15，表示从0分开始，每15分钟
- `L` : 用在日字段表示当月最后一天，用在周字段表示周六
- `W` : 表示最近的工作日，例如 15W 表示离15号最近的工作日
- `#` : 用于周字段，例如 `2#3` 表示本月第3个周一（周一=2）

### 示例

| 表达式           | 说明                               |
| ---------------- | ---------------------------------- |
| `0 0 12 * * ?`   | 每天中午12点                       |
| `0 15 10 * * ?`  | 每天上午10:15                      |
| `0 0/5 14 * * ?` | 每天下午2点开始到2:55，每5分钟一次 |
| `0 0 12 ? * WED` | 每周三中午12点                     |
| `0 0 12 1 * ?`   | 每月1号中午12点                    |
| `0 15 10 15 * ?` | 每月15号上午10:15                  |
| `0 0 0 L * ?`    | 每月最后一天零点                   |

## 样式自定义

组件使用纯 CSS 样式，你可以通过覆盖 CSS 类来自定义样式：

```css
/* 修改标签页样式 */
.cron-tab-item {
  padding: 12px 20px;
  font-size: 16px;
}

/* 修改激活状态的标签页 */
.cron-tab-item.active {
  color: #1890ff;
}

/* 修改输入框样式 */
.cron-input {
  border-color: #1890ff;
}

/* 修改结果展示区域 */
.cron-result {
  background-color: #f0f5ff;
}
```

## 浏览器兼容性

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

## License

MIT
