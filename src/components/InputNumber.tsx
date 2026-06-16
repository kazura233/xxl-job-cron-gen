import React, { type ChangeEvent } from 'react'

interface InputNumberProps {
  value: string | number
  onChange: (value: string) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * 受控数字输入框，用于各 Tab 中的范围/间隔参数输入。
 *
 * 验证策略：
 *   - onChange 时只做上限裁剪，不做下限裁剪。
 *     这样用户能自然输入两位数（如先输入 "1" 再补 "0" 得到 "10"），
 *     若在 onChange 时就强制 min，输入 "1" 会被截断为 min 值，体验差。
 *   - onBlur 时补做下限校验，保证最终值在 [min, max] 内。
 *   - 输入非数字字符时直接忽略，不更新状态。
 */
export const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
  min = 0,
  max = 59,
  disabled = false,
  className = '',
  style = {}
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    // 允许清空（用户正在输入中间状态）
    if (val === '') {
      onChange('')
      return
    }

    // 拒绝非数字字符（含小数点、负号）
    if (!/^\d*$/.test(val)) {
      return
    }

    const numVal = parseInt(val, 10)

    if (!isNaN(numVal)) {
      // 超过上限时截断为 max，不超过则直接传出（允许低于 min 的过渡值）
      onChange(numVal > max ? String(max) : String(numVal))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value

    // 失焦时若为空，重置为 min
    if (val === '') {
      onChange(String(min))
      return
    }

    const numVal = parseInt(val, 10)
    if (!isNaN(numVal) && numVal < min) {
      onChange(String(min))
    }
  }

  return (
    <input
      type="text"
      className={`cron-gen-input ${className}`}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      style={style}
    />
  )
}
