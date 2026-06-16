import React, { useState, useEffect } from 'react'
import type { TabPanelProps } from '../types'
import { parseFieldValue } from '../utils'
import { InputNumber } from './InputNumber'

/**
 * 年字段配置面板。
 *
 * 年是 Cron 表达式的可选字段（第7位），不填时生成 6 位表达式。
 *
 * mode 与生成值的对应关系：
 *   1 → ""（空字符串）  不指定，生成表达式时省略年字段
 *   2 → *              每年（匹配任意年份）
 *   3 → start-end      周期，如 2026-2030（仅在这几年执行）
 */
export const TabYear: React.FC<TabPanelProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<string>('1')
  const [rangeStart, setRangeStart] = useState<string>('2026')
  const [rangeEnd, setRangeEnd] = useState<string>('2027')

  // 外部 value 变化时反向解析，还原 UI 状态
  useEffect(() => {
    const parsed = parseFieldValue(value)

    if (value === '' || value === '?') {
      // 空字符串或 ? 均视为不指定
      setMode('1')
    } else if (parsed.type === 'every') {
      setMode('2')
    } else if (parsed.type === 'range') {
      setMode('3')
      setRangeStart(parsed.values[0] || '2026')
      setRangeEnd(parsed.values[1] || '2027')
    }
  }, [value])

  /**
   * 根据当前 mode 和可选的覆盖参数生成字段值并触发 onChange。
   * params 用于在 setState 尚未刷新时传入最新值（React 状态异步更新）。
   */
  const generateValue = (newMode: string, params?: { rangeStart?: string; rangeEnd?: string }) => {
    let newValue = ''

    switch (newMode) {
      case '1':
        newValue = '' // 空字符串：generateCronExpression 会省略该字段
        break
      case '2':
        newValue = '*'
        break
      case '3':
        newValue = `${params?.rangeStart || rangeStart}-${params?.rangeEnd || rangeEnd}`
        break
    }

    onChange(newValue)
  }

  const handleModeChange = (newMode: string) => {
    setMode(newMode)
    generateValue(newMode)
  }

  return (
    <>
      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="1"
            checked={mode === '1'}
            onChange={() => handleModeChange('1')}
          />
          <span>不指定 允许的通配符[, - * /] 非必填</span>
        </label>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="2"
            checked={mode === '2'}
            onChange={() => handleModeChange('2')}
          />
          <span>每年</span>
        </label>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="3"
            checked={mode === '3'}
            onChange={() => handleModeChange('3')}
          />
          <span>周期从</span>
        </label>
        <InputNumber
          value={rangeStart}
          min={1970}
          max={2099}
          disabled={mode !== '3'}
          onChange={(val) => {
            setRangeStart(val)
            if (mode === '3') {
              generateValue('3', { rangeStart: val })
            }
          }}
        />
        <span>-</span>
        <InputNumber
          value={rangeEnd}
          min={1970}
          max={2099}
          disabled={mode !== '3'}
          onChange={(val) => {
            setRangeEnd(val)
            if (mode === '3') {
              generateValue('3', { rangeEnd: val })
            }
          }}
        />
        <span>年</span>
      </div>
    </>
  )
}
