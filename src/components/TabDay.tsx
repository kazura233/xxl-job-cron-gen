import React, { useState, useEffect } from 'react'
import type { TabPanelProps } from '../types'
import { parseFieldValue, generateRange, padZero } from '../utils'
import { InputNumber } from './InputNumber'

// 复选框选项：1-31，标签补零（01-31）
const dayOptions = generateRange(1, 31, padZero)

/**
 * 日字段配置面板。
 *
 * mode 与生成值的对应关系：
 *   1 → *        每天
 *   2 → ?        不指定（与周字段互斥，选此项时周字段可自由配置）
 *   3 → start-end  周期，如 1-15（每月1号到15号）
 *   4 → start/step 间隔，如 1/5（从1号起每5天）
 *   5 → {day}W   最近工作日，如 15W（离15号最近的周一至周五）
 *   6 → L        本月最后一天
 *   7 → 1,10,20  指定具体日期；全选31个时合并为 *
 *
 * 注：日和周字段存在互斥关系，由父组件 CronGen 在 handleFieldChange 中统一处理。
 */
export const TabDay: React.FC<TabPanelProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<string>('1')
  const [rangeStart, setRangeStart] = useState<string>('1')
  const [rangeEnd, setRangeEnd] = useState<string>('2')
  const [intervalStart, setIntervalStart] = useState<string>('1')
  const [intervalValue, setIntervalValue] = useState<string>('1')
  const [workdayDay, setWorkdayDay] = useState<string>('1')
  const [specificValues, setSpecificValues] = useState<string[]>([])

  // 外部 value 变化时反向解析，还原 UI 状态
  useEffect(() => {
    const parsed = parseFieldValue(value)

    switch (parsed.type) {
      case 'every':
        setMode('1')
        break
      case 'unspecified':
        setMode('2')
        break
      case 'range':
        setMode('3')
        setRangeStart(parsed.values[0] || '1')
        setRangeEnd(parsed.values[1] || '2')
        break
      case 'interval':
        setMode('4')
        setIntervalStart(parsed.values[0] || '1')
        setIntervalValue(parsed.values[1] || '1')
        break
      case 'workday':
        setMode('5')
        setWorkdayDay(parsed.values[0] || '1')
        break
      case 'last':
        setMode('6')
        break
      case 'specific':
        setMode('7')
        setSpecificValues(parsed.values)
        break
    }
  }, [value])

  /**
   * 根据当前 mode 和可选的覆盖参数生成字段值并触发 onChange。
   * params 用于在 setState 尚未刷新时传入最新值（React 状态异步更新）。
   */
  const generateValue = (
    newMode: string,
    params?: {
      rangeStart?: string
      rangeEnd?: string
      intervalStart?: string
      intervalValue?: string
      workdayDay?: string
      specificValues?: string[]
    },
  ) => {
    let newValue = '*'

    switch (newMode) {
      case '1':
        newValue = '*'
        break
      case '2':
        newValue = '?'
        break
      case '3':
        newValue = `${params?.rangeStart || rangeStart}-${params?.rangeEnd || rangeEnd}`
        break
      case '4':
        newValue = `${params?.intervalStart || intervalStart}/${params?.intervalValue || intervalValue}`
        break
      case '5':
        // W：离指定日期最近的工作日（周一至周五）
        newValue = `${params?.workdayDay || workdayDay}W`
        break
      case '6':
        newValue = 'L'
        break
      case '7': {
        const values = params?.specificValues || specificValues
        if (values.length === 0) {
          newValue = '?'
        } else if (values.length === 31) {
          // 31 个全选等价于 *
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
    // 切换到指定模式时，若尚未选中任何值则默认选中 1
    if (newMode === '7' && specificValues.length === 0) {
      setSpecificValues(['1'])
    }
    generateValue(newMode)
  }

  const handleCheckboxChange = (val: string, checked: boolean) => {
    const newValues = checked ? [...specificValues, val] : specificValues.filter((v) => v !== val)
    setSpecificValues(newValues)
    generateValue('7', { specificValues: newValues })
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
          <span>每天 允许的通配符[, - * / L W]</span>
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
          <span>不指定</span>
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
          <span>周期 从</span>
        </label>
        <InputNumber
          value={rangeStart}
          min={1}
          max={31}
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
          min={1}
          max={31}
          disabled={mode !== '3'}
          onChange={(val) => {
            setRangeEnd(val)
            if (mode === '3') {
              generateValue('3', { rangeEnd: val })
            }
          }}
        />
        <span>日</span>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="4"
            checked={mode === '4'}
            onChange={() => handleModeChange('4')}
          />
          <span>从</span>
        </label>
        <InputNumber
          value={intervalStart}
          min={1}
          max={31}
          disabled={mode !== '4'}
          onChange={(val) => {
            setIntervalStart(val)
            if (mode === '4') {
              generateValue('4', { intervalStart: val })
            }
          }}
        />
        <span>日开始,每</span>
        <InputNumber
          value={intervalValue}
          min={1}
          max={31}
          disabled={mode !== '4'}
          onChange={(val) => {
            setIntervalValue(val)
            if (mode === '4') {
              generateValue('4', { intervalValue: val })
            }
          }}
        />
        <span>天执行一次</span>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="5"
            checked={mode === '5'}
            onChange={() => handleModeChange('5')}
          />
          <span>每月</span>
        </label>
        <InputNumber
          value={workdayDay}
          min={1}
          max={31}
          disabled={mode !== '5'}
          onChange={(val) => {
            setWorkdayDay(val)
            if (mode === '5') {
              generateValue('5', { workdayDay: val })
            }
          }}
        />
        <span>号最近的那个工作日</span>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="6"
            checked={mode === '6'}
            onChange={() => handleModeChange('6')}
          />
          <span>本月最后一天</span>
        </label>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="7"
            checked={mode === '7'}
            onChange={() => handleModeChange('7')}
          />
          <span>指定</span>
        </label>
      </div>

      <div className="cron-gen-checkbox-list">
        {dayOptions.map((option) => (
          <label key={option.value} className="cron-gen-checkbox-item">
            <input
              type="checkbox"
              value={option.value}
              checked={specificValues.includes(String(option.value))}
              disabled={mode !== '7'}
              onChange={(e) => handleCheckboxChange(String(option.value), e.target.checked)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </>
  )
}
