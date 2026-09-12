/**
 * 本地 K-V 存储封装
 * 依赖 manifest 中声明的 blueos.storage.kvstore
 *
 * 注意：蓝河环境非 node，所有方法均基于 blueos kvstore 的异步回调封装为 Promise。
 */
import kvstore from '@blueos.storage.kvstore'

const KEY_SETTINGS = 'ai_settings'
const KEY_HISTORY = 'ai_history'

// 默认值（与 app.ux 中保持一致）
const DEFAULT_SETTINGS = {
  baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
  apiKey: '',
  model: 'Qwen/Qwen2.5-7B-Instruct',
  systemPrompt: '你是一个简洁的智能助手，请用尽量短的中文回答，适合手表小屏幕阅读。'
}

/**
 * 读取设置（如不存在则返回默认值）
 */
export function getSettings() {
  return new Promise((resolve) => {
    kvstore.get({
      key: KEY_SETTINGS,
      success: (data) => {
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data
          resolve(Object.assign({}, DEFAULT_SETTINGS, parsed || {}))
        } catch (e) {
          resolve(Object.assign({}, DEFAULT_SETTINGS))
        }
      },
      fail: () => resolve(Object.assign({}, DEFAULT_SETTINGS))
    })
  })
}

/**
 * 保存设置
 */
export function setSettings(settings) {
  return new Promise((resolve) => {
    const value = JSON.stringify(settings)
    kvstore.set({
      key: KEY_SETTINGS,
      value,
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

/**
 * 读取历史对话
 */
export function getHistory() {
  return new Promise((resolve) => {
    kvstore.get({
      key: KEY_HISTORY,
      success: (data) => {
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data
          resolve(Array.isArray(parsed) ? parsed : [])
        } catch (e) {
          resolve([])
        }
      },
      fail: () => resolve([])
    })
  })
}

/**
 * 保存历史对话（限制条数，避免占用过多手表存储）
 */
export function setHistory(history) {
  return new Promise((resolve) => {
    const trimmed = history.slice(-20)
    const value = JSON.stringify(trimmed)
    kvstore.set({
      key: KEY_HISTORY,
      value,
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

/**
 * 清空历史
 */
export function clearHistory() {
  return setHistory([])
}

export default {
  DEFAULT_SETTINGS,
  getSettings,
  setSettings,
  getHistory,
  setHistory,
  clearHistory
}
