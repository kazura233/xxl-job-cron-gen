/**
 * Cron 表达式工具函数
 *
 * Cron 表达式格式（7 位，年为可选）：
 *   秒(0-59)  分(0-59)  时(0-23)  日(1-31)  月(1-12)  周(1-7,1=周日)  [年(1970-2099)]
 *
 * 特殊字符：
 *   *  任意值
 *   ?  不指定（仅日、周字段）
 *   -  范围，如 10-20
 *   /  间隔，如 0/5（从0开始每5个单位）
 *   ,  枚举，如 1,3,5
 *   L  最后（日字段=本月最后一天，周字段=本月最后一个该星期几）
 *   W  最近工作日，如 15W（离15号最近的工作日）
 *   #  第N个，如 2#3（本月第3个周一，周一=2）
 */

import type { CronValue } from './types'

/**
 * 将 Cron 表达式字符串解析为结构化对象。
 * 缺失的字段使用安全默认值填充（秒-时用 *，周用 ?，年用 空字符串）。
 */
export function parseCronExpression(cronExpression: string): CronValue {
  const defaultValue: CronValue = {
    second: '*',
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    week: '?',
    year: '',
  }

  if (!cronExpression || !cronExpression.trim()) {
    return defaultValue
  }

  const parts = cronExpression.trim().split(/\s+/)

  return {
    second: parts[0] || '*',
    minute: parts[1] || '*',
    hour: parts[2] || '*',
    day: parts[3] || '*',
    month: parts[4] || '*',
    week: parts[5] || '?',
    year: parts[6] || '', // 年是可选字段，缺省为空字符串
  }
}

/**
 * 将结构化 CronValue 拼接为 Cron 表达式字符串。
 * 年字段为空时省略，输出 6 位表达式；否则输出 7 位。
 */
export function generateCronExpression(cronValue: CronValue): string {
  const { second, minute, hour, day, month, week, year } = cronValue

  const parts = [second || '*', minute || '*', hour || '*', day || '*', month || '*', week || '?']

  if (year) {
    parts.push(year)
  }

  return parts.join(' ')
}

/**
 * 解析单个 Cron 字段的值，识别其类型和参数。
 *
 * 注意：匹配顺序有约束——
 *   1. W 必须在 L 之前检测，因为 "15W" 包含字母但不含 L
 *   2. 含 L 的多字符值（如 "2L"）必须在单独的 "L" 之后，避免把 "L" 误判为 lastweek
 *   3. # 的检测须在 , 之前，因为 "2#3" 不含逗号但属于独立类型
 *
 * 返回类型说明：
 *   every       → *
 *   unspecified → ? 或 ""
 *   range       → start-end，values = [start, end]
 *   interval    → start/step，values = [start, step]
 *   workday     → {day}W，values = [day]（W 表示最近工作日）
 *   last        → L（本月最后一天）
 *   lastweek    → {day}L，values = [day]（本月最后一个该星期几）
 *   nthWeek     → {day}#{n}，values = [day, n]（本月第 n 个该星期几）
 *   specific    → 逗号分隔或单值，values = 各值数组
 */
export function parseFieldValue(value: string): {
  type:
    | 'every'
    | 'range'
    | 'interval'
    | 'specific'
    | 'unspecified'
    | 'last'
    | 'workday'
    | 'lastweek'
    | 'nthWeek'
  values: string[]
} {
  if (value === '*') {
    return { type: 'every', values: [] }
  }
  if (value === '?' || value === '') {
    return { type: 'unspecified', values: [] }
  }
  // 单独的 L：本月最后一天（日字段）
  if (value === 'L') {
    return { type: 'last', values: [] }
  }
  if (value.includes('-')) {
    const [start, end] = value.split('-')
    return { type: 'range', values: [start, end] }
  }
  if (value.includes('/')) {
    const [start, interval] = value.split('/')
    return { type: 'interval', values: [start, interval] }
  }
  // W 在 L 之前：避免 "15W" 被后续 L 逻辑误判
  if (value.includes('W')) {
    const day = value.replace('W', '')
    return { type: 'workday', values: [day] }
  }
  // 多字符含 L：如 "2L" 表示本月最后一个周二
  if (value.includes('L') && value.length > 1) {
    const day = value.replace('L', '')
    return { type: 'lastweek', values: [day] }
  }
  if (value.includes('#')) {
    const [day, nth] = value.split('#')
    return { type: 'nthWeek', values: [day, nth] }
  }
  if (value.includes(',')) {
    return { type: 'specific', values: value.split(',') }
  }

  // 单个数值也归为 specific，由各 Tab 组件按需处理
  return { type: 'specific', values: [value] }
}

/**
 * 生成连续数字的选项数组，用于渲染复选框列表。
 * @param start  起始值（含）
 * @param end    结束值（含）
 * @param format 可选的标签格式化函数，如补零
 */
export function generateRange(
  start: number,
  end: number,
  format?: (n: number) => string,
): Array<{ label: string; value: number }> {
  const result: Array<{ label: string; value: number }> = []
  for (let i = start; i <= end; i++) {
    result.push({
      label: format ? format(i) : String(i),
      value: i,
    })
  }
  return result
}

/**
 * 将数字格式化为两位数字符串（个位数前补零）。
 * 用于秒、分、时、日、月的复选框标签，保持对齐。
 */
export function padZero(num: number): string {
  return num < 10 ? `0${num}` : String(num)
}

/**
 * 粗略验证 Cron 表达式格式是否合法（仅检查字段数量）。
 * 标准格式为 6 位（含秒）或 7 位（含年），不做值域校验。
 */
export function validateCronExpression(cronExpression: string): boolean {
  if (!cronExpression || !cronExpression.trim()) {
    return false
  }

  const parts = cronExpression.trim().split(/\s+/)

  return parts.length >= 6 && parts.length <= 7
}
