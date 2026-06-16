import React, { useState, useEffect } from 'react'
import type { TabPanelProps } from '../types'
import { parseFieldValue } from '../utils'
import { InputNumber } from './InputNumber'

// 周几选项，1=周日，7=周六（与 XXL-JOB 原版保持一致）
const weekOptions = [
  { label: '周日', value: 1 },
  { label: '周一', value: 2 },
  { label: '周二', value: 3 },
  { label: '周三', value: 4 },
  { label: '周四', value: 5 },
  { label: '周五', value: 6 },
  { label: '周六', value: 7 },
]

/**
 * 周字段配置面板。
 *
 * mode 与生成值的对应关系：
 *   1 → *              每周
 *   2 → ?              不指定（与日字段互斥，选此项时日字段可自由配置）
 *   3 → start-end      周期，如 2-6（周一到周五）
 *   4 → start/step     间隔，如 1/2（从周日起每隔2天）
 *   5 → {day}L         本月最后一个该星期几，如 2L（本月最后一个周一）
 *   6 → 2,4,6          指定具体星期几；全选7个时合并为 *
 *   7 → {day}#{n}      本月第 n 个该星期几，如 2#3（本月第3个周一）
 *
 * 注：日和周字段存在互斥关系，由父组件 CronGen 在 handleFieldChange 中统一处理。
 */
export const TabWeek: React.FC<TabPanelProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<string>('1')
  const [rangeStart, setRangeStart] = useState<string>('1')
  const [rangeEnd, setRangeEnd] = useState<string>('2')
  const [intervalStart, setIntervalStart] = useState<string>('1')
  const [intervalValue, setIntervalValue] = useState<string>('1')
  const [lastWeekDay, setLastWeekDay] = useState<string>('1')
  const [nthWeekDay, setNthWeekDay] = useState<string>('2') // # 号左侧：星期几（1-7）
  const [nthWeekNum, setNthWeekNum] = useState<string>('1') // # 号右侧：第几个（1-5）
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
      case 'interval':
        // parseFieldValue 对 "1-7" 和 "1/2" 的判断依赖字符：含 - 且不含 / → range
        if (value.includes('-') && !value.includes('/')) {
          setMode('3')
          setRangeStart(parsed.values[0] || '1')
          setRangeEnd(parsed.values[1] || '2')
        } else {
          setMode('4')
          setIntervalStart(parsed.values[0] || '1')
          setIntervalValue(parsed.values[1] || '1')
        }
        break
      case 'range':
        setMode('3')
        setRangeStart(parsed.values[0] || '1')
        setRangeEnd(parsed.values[1] || '2')
        break
      case 'lastweek':
        setMode('5')
        setLastWeekDay(parsed.values[0] || '1')
        break
      case 'nthWeek':
        setMode('7')
        setNthWeekDay(parsed.values[0] || '2')
        setNthWeekNum(parsed.values[1] || '1')
        break
      case 'specific':
        setMode('6')
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
    lastWeekDay?: string
    nthWeekDay?: string
    nthWeekNum?: string
    specificValues?: string[]
  }

  const generateValue = (newMode: string, params?: GenerateValueParams) => {
    let newValue = '?'

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
        // {day}L：本月最后一个该星期几，如 2L = 本月最后一个周一
        newValue = `${params?.lastWeekDay || lastWeekDay}L`
        break
      case '7':
        // {day}#{n}：本月第 n 个该星期几，如 2#3 = 本月第3个周一
        newValue = `${params?.nthWeekDay || nthWeekDay}#${params?.nthWeekNum || nthWeekNum}`
        break
      case '6': {
        const values = params?.specificValues || specificValues
        if (values.length === 0) {
          newValue = '?'
        } else if (values.length === 7) {
          // 7 个全选等价于 *
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
    // 切换到指定模式时，若尚未选中任何值则默认选中周日（1）
    if (newMode === '6' && specificValues.length === 0) {
      setSpecificValues(['1'])
    }
    generateValue(newMode)
  }

  const handleCheckboxChange = (val: string, checked: boolean) => {
    const newValues = checked ? [...specificValues, val] : specificValues.filter((v) => v !== val)
    setSpecificValues(newValues)
    generateValue('6', { specificValues: newValues })
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
          <span>每周 允许的通配符[, - * / L #]</span>
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
          <span>周期 每周第</span>
        </label>
        <InputNumber
          value={rangeStart}
          min={1}
          max={7}
          disabled={mode !== '3'}
          onChange={(val) => {
            setRangeStart(val)
            if (mode === '3') generateValue('3', { rangeStart: val })
          }}
        />
        <span>天-第</span>
        <InputNumber
          value={rangeEnd}
          min={1}
          max={7}
          disabled={mode !== '3'}
          onChange={(val) => {
            setRangeEnd(val)
            if (mode === '3') generateValue('3', { rangeEnd: val })
          }}
        />
        <span>天</span>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="4"
            checked={mode === '4'}
            onChange={() => handleModeChange('4')}
          />
          <span>从第</span>
        </label>
        <InputNumber
          value={intervalStart}
          min={1}
          max={7}
          disabled={mode !== '4'}
          onChange={(val) => {
            setIntervalStart(val)
            if (mode === '4') generateValue('4', { intervalStart: val })
          }}
        />
        <span>天开始，间隔</span>
        <InputNumber
          value={intervalValue}
          min={1}
          max={7}
          disabled={mode !== '4'}
          onChange={(val) => {
            setIntervalValue(val)
            if (mode === '4') generateValue('4', { intervalValue: val })
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
          <span>本月最后一周的第</span>
        </label>
        <InputNumber
          value={lastWeekDay}
          min={1}
          max={7}
          disabled={mode !== '5'}
          onChange={(val) => {
            setLastWeekDay(val)
            if (mode === '5') generateValue('5', { lastWeekDay: val })
          }}
        />
        <span>天</span>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="7"
            checked={mode === '7'}
            onChange={() => handleModeChange('7')}
          />
          <span>本月第</span>
        </label>
        <InputNumber
          value={nthWeekNum}
          min={1}
          max={5}
          disabled={mode !== '7'}
          onChange={(val) => {
            setNthWeekNum(val)
            if (mode === '7') generateValue('7', { nthWeekNum: val })
          }}
        />
        <span>个第</span>
        <InputNumber
          value={nthWeekDay}
          min={1}
          max={7}
          disabled={mode !== '7'}
          onChange={(val) => {
            setNthWeekDay(val)
            if (mode === '7') generateValue('7', { nthWeekDay: val })
          }}
        />
        <span>天</span>
      </div>

      <div className="cron-gen-line">
        <label>
          <input
            type="radio"
            value="6"
            checked={mode === '6'}
            onChange={() => handleModeChange('6')}
          />
          <span>指定</span>
        </label>
      </div>

      <div className="cron-gen-checkbox-list">
        {weekOptions.map((option) => (
          <label key={option.value} className="cron-gen-checkbox-item">
            <input
              type="checkbox"
              value={option.value}
              checked={specificValues.includes(String(option.value))}
              disabled={mode !== '6'}
              onChange={(e) => handleCheckboxChange(String(option.value), e.target.checked)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </>
  )
}
