/**
 * Cron 表达式组件类型定义
 */

import type React from 'react'

/** 7 个 Tab 对应的字段名 */
export type CronTabType = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'week' | 'year'

/**
 * Cron 表达式各字段的结构化表示。
 * 每个字段存储对应位置的原始字符串值（如 "*"、"0/5"、"1,3,5"）。
 * year 为可选字段，不填时为空字符串，生成表达式时会省略。
 */
export interface CronValue {
  second: string
  minute: string
  hour: string
  day: string
  month: string
  week: string
  /** 可选，为空字符串时生成 6 位表达式 */
  year: string
}

/** CronGen 组件的 Props */
export interface CronGenProps {
  /** 受控值，当前的 Cron 表达式字符串，默认 '* * * * * ?' */
  value?: string
  /** Cron 表达式变化时的回调，参数为新的表达式字符串 */
  onChange?: (cronExpression: string) => void
  /** 附加到根容器的 CSS 类名 */
  className?: string
  /** 附加到根容器的内联样式 */
  style?: React.CSSProperties
}

/**
 * 各 Tab 子组件（TabSecond / TabMinute 等）的通用 Props。
 * value 是该字段当前的原始值，onChange 在值变化时触发。
 */
export interface TabPanelProps {
  value: string
  onChange: (value: string) => void
}

/** 复选框选项，用于指定模式下的多值选择 */
export interface CheckboxOption {
  label: string
  value: string | number
}
