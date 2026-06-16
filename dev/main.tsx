import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  BasicExample,
  WithInitialValueExample,
  CustomStyleExample,
  MultipleInstancesExample,
  ControlledExample,
  SpecialCharsExample,
} from './example'

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <div>
      <h1 style={{ textAlign: 'center', padding: 20 }}>Cron 表达式生成器 - 示例集合</h1>
      <BasicExample />
      <hr />
      <WithInitialValueExample />
      <hr />
      <CustomStyleExample />
      <hr />
      <MultipleInstancesExample />
      <hr />
      <ControlledExample />
      <hr />
      <SpecialCharsExample />
    </div>
  </React.StrictMode>,
)
