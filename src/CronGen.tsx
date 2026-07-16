import React, { useState, useEffect, useCallback } from 'react'
import type { CronGenProps, CronTabType, CronValue } from './types'
import { parseCronExpression, generateCronExpression } from './utils'
import { TabSecond } from './components/TabSecond'
import { TabMinute } from './components/TabMinute'
import { TabHour } from './components/TabHour'
import { TabDay } from './components/TabDay'
import { TabMonth } from './components/TabMonth'
import { TabWeek } from './components/TabWeek'
import { TabYear } from './components/TabYear'

import './styles.css'

/**
 * Cron 表达式可视化生成器组件。
 *
 * 提供 7 个 Tab（秒、分钟、小时、日、月、周、年），
 * 每个 Tab 对应 Cron 表达式的一个字段，支持多种配置模式。
 * 底部实时展示当前生成的 Cron 表达式。
 *
 * @example
 * ```tsx
 * const [cron, setCron] = useState('0 0 0 * * ?')
 * <CronGen value={cron} onChange={setCron} />
 * ```
 */
export const CronGen: React.FC<CronGenProps> = ({
  value = '* * * * * ?',
  onChange,
  className = '',
  style = {},
}) => {
  const [activeTab, setActiveTab] = useState<CronTabType>('second')

  // 用惰性初始化避免首次渲染时重复解析
  const [cronValue, setCronValue] = useState<CronValue>(() => parseCronExpression(value))

  // 外部 value 变化时同步内部状态（受控模式）
  useEffect(() => {
    setCronValue(parseCronExpression(value))
  }, [value])

  /**
   * 更新单个字段值，同时处理日/周互斥规则：
   *   - 日字段设为非 ? 时，周字段自动置为 ?
   *   - 周字段设为非 ? 时，日字段自动置为 ?
   * 这是标准 Cron 语义：日和周不能同时指定具体值。
   */
  const handleFieldChange = useCallback(
    (field: CronTabType, newValue: string) => {
      const updated = { ...cronValue, [field]: newValue }

      if (field === 'day' && newValue !== '?') {
        updated.week = '?'
      } else if (field === 'week' && newValue !== '?') {
        updated.day = '?'
      }

      // onChange 必须在 setState 更新函数之外调用：在 updater 内触发父组件
      // setState 会在 CronGen 渲染期间更新父组件，React 会报
      // "Cannot update a component while rendering a different component"
      setCronValue(updated)
      onChange?.(generateCronExpression(updated))
    },
    [cronValue, onChange],
  )

  const tabs: Array<{ key: CronTabType; label: string }> = [
    { key: 'second', label: '秒' },
    { key: 'minute', label: '分钟' },
    { key: 'hour', label: '小时' },
    { key: 'day', label: '日' },
    { key: 'month', label: '月' },
    { key: 'week', label: '周' },
    { key: 'year', label: '年' },
  ]

  return (
    <div className={`cron-gen-container ${className}`} style={style}>
      {/* Tab 导航 */}
      <ul className="cron-gen-tabs">
        {tabs.map((tab) => (
          <li
            key={tab.key}
            className={`cron-gen-tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </li>
        ))}
      </ul>

      {/* Tab 内容区——所有面板始终挂载，通过 CSS active 类控制显示，避免切换时重置状态 */}
      <div className="cron-gen-tab-content">
        <div className={`cron-gen-tab-panel ${activeTab === 'second' ? 'active' : ''}`}>
          <TabSecond value={cronValue.second} onChange={(v) => handleFieldChange('second', v)} />
        </div>

        <div className={`cron-gen-tab-panel ${activeTab === 'minute' ? 'active' : ''}`}>
          <TabMinute value={cronValue.minute} onChange={(v) => handleFieldChange('minute', v)} />
        </div>

        <div className={`cron-gen-tab-panel ${activeTab === 'hour' ? 'active' : ''}`}>
          <TabHour value={cronValue.hour} onChange={(v) => handleFieldChange('hour', v)} />
        </div>

        <div className={`cron-gen-tab-panel ${activeTab === 'day' ? 'active' : ''}`}>
          <TabDay value={cronValue.day} onChange={(v) => handleFieldChange('day', v)} />
        </div>

        <div className={`cron-gen-tab-panel ${activeTab === 'month' ? 'active' : ''}`}>
          <TabMonth value={cronValue.month} onChange={(v) => handleFieldChange('month', v)} />
        </div>

        <div className={`cron-gen-tab-panel ${activeTab === 'week' ? 'active' : ''}`}>
          <TabWeek value={cronValue.week} onChange={(v) => handleFieldChange('week', v)} />
        </div>

        <div className={`cron-gen-tab-panel ${activeTab === 'year' ? 'active' : ''}`}>
          <TabYear value={cronValue.year} onChange={(v) => handleFieldChange('year', v)} />
        </div>
      </div>

      {/* 实时展示当前 Cron 表达式 */}
      <div className="cron-gen-result">
        <div className="cron-gen-result-label">Cron 表达式：</div>
        <div className="cron-gen-result-value">{generateCronExpression(cronValue)}</div>
      </div>
    </div>
  )
}
