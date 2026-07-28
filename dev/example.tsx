import React, { useState } from 'react'
import { CronGen } from '../src/CronGen'

/** 基础示例 */
export function BasicExample() {
  const [value, setValue] = useState('0 0 0 * * ?')

  return (
    <div style={{ padding: 20 }}>
      <h2>基础示例</h2>
      <CronGen value={value} onChange={setValue} />
      <div style={{ marginTop: 20 }}>
        <strong>当前表达式：</strong>
        <code>{value}</code>
      </div>
    </div>
  )
}

/** 带初始值示例 */
export function WithInitialValueExample() {
  const [value, setValue] = useState('0 15 10 * * ? *')

  return (
    <div style={{ padding: 20 }}>
      <h2>带初始值示例（每天上午 10:15）</h2>
      <CronGen value={value} onChange={setValue} />
      <div style={{ marginTop: 20 }}>
        <strong>当前表达式：</strong>
        <code>{value}</code>
      </div>
    </div>
  )
}

/** 自定义样式示例 */
export function CustomStyleExample() {
  const [value, setValue] = useState('0 0 12 * * ?')

  return (
    <div style={{ padding: 20 }}>
      <h2>自定义样式示例</h2>
      <CronGen
        value={value}
        onChange={setValue}
        style={{ border: '2px solid #1890ff', borderRadius: 8, padding: 16 }}
      />
      <div style={{ marginTop: 20 }}>
        <strong>当前表达式：</strong>
        <code>{value}</code>
      </div>
    </div>
  )
}

/** 多个实例示例 */
export function MultipleInstancesExample() {
  const [value1, setValue1] = useState('0 0 0 * * ?')
  const [value2, setValue2] = useState('0 0 12 * * ?')

  return (
    <div style={{ padding: 20 }}>
      <h2>多个实例示例</h2>
      <div style={{ marginBottom: 40 }}>
        <h3>任务 1</h3>
        <CronGen value={value1} onChange={setValue1} />
        <div style={{ marginTop: 10 }}>
          <strong>表达式：</strong>
          <code>{value1}</code>
        </div>
      </div>
      <div>
        <h3>任务 2</h3>
        <CronGen value={value2} onChange={setValue2} />
        <div style={{ marginTop: 10 }}>
          <strong>表达式：</strong>
          <code>{value2}</code>
        </div>
      </div>
    </div>
  )
}

/**
 * 受控组件示例——外部通过预设按钮控制表达式。
 * 注意：周字段使用数字（1=周日，2=周一…7=周六），不支持 MON/TUE 等英文缩写。
 */
export function ControlledExample() {
  const [value, setValue] = useState('0 0 0 * * ?')

  const presets = [
    { label: '每天零点', value: '0 0 0 * * ?' },
    { label: '每天中午 12 点', value: '0 0 12 * * ?' },
    { label: '每小时', value: '0 0 * * * ?' },
    { label: '每 5 分钟', value: '0 0/5 * * * ?' },
    // 周一=2，英文缩写 MON 不被组件解析，须用数字
    { label: '每周一上午 9 点', value: '0 0 9 ? * 2' },
  ]

  return (
    <div style={{ padding: 20 }}>
      <h2>受控组件示例</h2>
      <div style={{ marginBottom: 20 }}>
        <strong>快速选择：</strong>
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setValue(preset.value)}
            style={{ margin: '0 5px', padding: '5px 10px', cursor: 'pointer' }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <CronGen value={value} onChange={setValue} />
      <div style={{ marginTop: 20 }}>
        <strong>当前表达式：</strong>
        <code>{value}</code>
      </div>
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => setValue('0 0 0 * * ?')}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
          重置
        </button>
      </div>
    </div>
  )
}

/**
 * 手动输入示例——用户直接在输入框里编辑表达式，组件反向解析并更新 UI。
 * 可用于验证前导零、非规范写法等场景是否被正确处理。
 */
export function ManualInputExample() {
  const [value, setValue] = useState('* * 02 * * ?')

  return (
    <div style={{ padding: 20 }}>
      <h2>手动输入示例</h2>
      <div style={{ marginBottom: 12 }}>
        <label>
          <strong>直接输入 Cron 表达式：</strong>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              marginLeft: 10,
              padding: '4px 8px',
              width: 320,
              fontFamily: 'monospace',
            }}
          />
        </label>
      </div>
      <CronGen value={value} onChange={setValue} />
      <div style={{ marginTop: 20 }}>
        <strong>当前表达式：</strong>
        <code>{value}</code>
      </div>
    </div>
  )
}

/**
 * 特殊字符示例——展示 L、W、# 的使用场景。
 * 这三个字符是本组件相比常见 Cron 库的扩展能力（来自 XXL-JOB 规范）。
 */
export function SpecialCharsExample() {
  const [value, setValue] = useState('0 0 0 L * ?')

  const presets = [
    { label: '每月最后一天零点（L）', value: '0 0 0 L * ?' },
    { label: '每月 15 号最近工作日（W）', value: '0 0 9 15W * ?' },
    { label: '本月最后一个周五零点（5L）', value: '0 0 0 ? * 6L' },
    { label: '本月第 2 个周一上午 9 点（#）', value: '0 0 9 ? * 2#2' },
  ]

  return (
    <div style={{ padding: 20 }}>
      <h2>特殊字符示例（L / W / #）</h2>
      <div style={{ marginBottom: 20 }}>
        <strong>预设：</strong>
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setValue(preset.value)}
            style={{ margin: '0 5px', padding: '5px 10px', cursor: 'pointer' }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <CronGen value={value} onChange={setValue} />
      <div style={{ marginTop: 20 }}>
        <strong>当前表达式：</strong>
        <code>{value}</code>
      </div>
    </div>
  )
}
