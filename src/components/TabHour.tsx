import React, { useState, useEffect } from 'react'
import type { TabPanelProps } from '../types'
import { parseFieldValue, generateRange, padZero } from '../utils'
import { InputNumber } from './InputNumber'

// 复选框选项：0-23，标签补零（00-23）
const hourOptions = generateRange(0, 23, padZero)

/**
 * 小时字段配置面板。
 *
 * mode 与生成值的对应关系：
 *   1 → *           每小时
 *   2 → start-end   周期，如 8-18（8点到18点之间每小时）
 *   3 → start/step  间隔，如 0/6（从0点起每6小时）
 *   4 → 8,12,18     指定具体小时；全选24个时合并为 *
 */
export const TabHour: React.FC<TabPanelProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<string>('1')
  const [rangeStart, setRangeStart] = useState<string>('1')
  const [rangeEnd, setRangeEnd] = useState<string>('2')
  const [intervalStart, setIntervalStart] = useState<string>('0')
  const [intervalValue, setIntervalValue] = useState<string>('1')
  const [specificValues, setSpecificValues] = useState<string[]>([])

  // 外部 value 变化时反向解析，还原 UI 状态
  useEffect(() => {
    const parsed = parseFieldValue(value)

    switch (parsed.type) {
      case 'every':
        setMode('1')
        break
      case 'range':
        setMode('2')
        setRangeStart(parsed.values[0] || '1')
        setRangeEnd(parsed.values[1] || '2')
        break
      case 'interval':
        setMode('3')
        setIntervalStart(parsed.values[0] || '0')
        setIntervalValue(parsed.values[1] || '1')
        break
      case 'specific':
        setMode('4')
        setSpecificValues(parsed.values)
        break
    }
  }, [value])

  /**
   * 根据当前 mode 和可选的覆盖参数生成字段值并触发 onChange。
   * params 用于在 setState 尚未刷新时传入最新值（React 状态异步更新）。
   */
  type GenerateValueParams = {
    rangeStart?: string
    rangeEnd?: string
    intervalStart?: string
    intervalValue?: string
    specificValues?: string[]
  }
  const generateValue = (newMode: string, params?: GenerateValueParams) => {
    let newValue = '*'

    switch (newMode) {
      case '1':
        newValue = '*'
        break
      case '2':
        newValue = `${params?.rangeStart || rangeStart}-${params?.rangeEnd || rangeEnd}`
        break
      case '3':
        newValue = `${params?.intervalStart || intervalStart}/${params?.intervalValue || intervalValue}`
        break
      case '4': {
        const values = params?.specificValues || specificValues
        if (values.length === 0) {
          newValue = '?'
        } else if (values.length === 24) {
          // 24 个全选等价于 *
          newValue = '*'
        } else {
          newValue = values.sort((a: string, b: string) => Number(a) - Number(b)).join(',')
        }
        break
      }
    }

    onChange(newValue)
  }

  const handleModeChange = (newMode: string) => {
    setMode(newMode)
    // 切换到指定模式时，若尚未选中任何值则默认选中 0
    if (newMode === '4' && specificValues.length === 0) {
      setSpecificValues(['0'])
      // setState 异步，须同步把新值传给 generateValue，否则会生成 ? 触发 radio 跳变
      generateValue('4', { specificValues: ['0'] })
      return
    }
    generateValue(newMode)
  }

  const handleCheckboxChange = (val: string, checked: boolean) => {
    const newValues = checked ? [...specificValues, val] : specificValues.filter((v) => v !== val)
    setSpecificValues(newValues)
    generateValue('4', { specificValues: newValues })
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
          <span>每小时 允许的通配符[, - * /]</span>
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
          <span>周期 从</span>
        </label>
        <InputNumber
          value={rangeStart}
          min={0}
          max={23}
          disabled={mode !== '2'}
          onChange={(val) => {
            setRangeStart(val)
            if (mode === '2') {
              generateValue('2', { rangeStart: val })
            }
          }}
        />
        <span>-</span>
        <InputNumber
          value={rangeEnd}
          min={0}
          max={23}
          disabled={mode !== '2'}
          onChange={(val) => {
            setRangeEnd(val)
            if (mode === '2') {
              generateValue('2', { rangeEnd: val })
            }
          }}
        />
        <span>小时</span>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="3"
            checked={mode === '3'}
            onChange={() => handleModeChange('3')}
          />
          <span>从</span>
        </label>
        <InputNumber
          value={intervalStart}
          min={0}
          max={23}
          disabled={mode !== '3'}
          onChange={(val) => {
            setIntervalStart(val)
            if (mode === '3') {
              generateValue('3', { intervalStart: val })
            }
          }}
        />
        <span>小时开始,每</span>
        <InputNumber
          value={intervalValue}
          min={0}
          max={23}
          disabled={mode !== '3'}
          onChange={(val) => {
            setIntervalValue(val)
            if (mode === '3') {
              generateValue('3', { intervalValue: val })
            }
          }}
        />
        <span>小时执行一次</span>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="4"
            checked={mode === '4'}
            onChange={() => handleModeChange('4')}
          />
          <span>指定</span>
        </label>
      </div>

      <div className="cron-gen-checkbox-list">
        {hourOptions.map((option) => (
          <label key={option.value} className="cron-gen-checkbox-item">
            <input
              type="checkbox"
              value={option.value}
              checked={specificValues.includes(String(option.value))}
              disabled={mode !== '4'}
              onChange={(e) => handleCheckboxChange(String(option.value), e.target.checked)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </>
  )
}
