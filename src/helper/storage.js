/**
 * 本地 K-V 存储封装
 * 依赖 manifest 中声明的 blueos.storage.kvstore
 *
 * 注意：蓝河环境非 node，所有方法均基于 blueos kvstore 的异步回调封装为 Promise。
 */
import kvstore from '@blueos.storage.kvstore'

const KEY_SETTINGS = 'ai_settings'
const KEY_HISTORY = 'ai_history'
const KEY_ACTIVATION = 'ai_activation'

// 离线激活码（本地校验，无需联网）
const VALID_CODE = 'b32000'

// 付款与联系方式说明
const ACTIVATION_NOTICE = {
  price: '4元',
  contact: 'zy291817@outlook.com',
  note: '付款4元后凭支付证明联系邮箱获取激活码'
}

// 默认值（与 app.ux 中保持一致）
// 智谱 GLM-4.7-Flash：国内直连、永久免费、秒级响应
const DEFAULT_SETTINGS = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiKey: '',
  model: 'glm-4.7-flash',
  systemPrompt: '你是一个简洁的智能助手，请用尽量短的中文回答，适合手表小屏幕阅读。'
}

/**
 * 读取激活状态
 * @returns {Promise<boolean>} 是否已激活
 */
export function isActivated() {
  return new Promise((resolve) => {
    kvstore.get({
      key: KEY_ACTIVATION,
      success: (data) => resolve(data === true || data === 'true'),
      fail: () => resolve(false)
    })
  })
}

/**
 * 校验激活码并写入激活状态
 * @param {string} code 用户输入的激活码
 * @returns {Promise<boolean>} 是否激活成功
 */
export function activate(code) {
  return new Promise((resolve) => {
    if (String(code || '').trim() === VALID_CODE) {
      kvstore.set({
        key: KEY_ACTIVATION,
        value: true,
        success: () => resolve(true),
        fail: () => resolve(false)
      })
    } else {
      resolve(false)
    }
  })
}

/**
 * 重置激活状态（仅用于调试/退出登录）
 */
export function deactivate() {
  return new Promise((resolve) => {
    kvstore.set({
      key: KEY_ACTIVATION,
      value: false,
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
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
  ACTIVATION_NOTICE,
  VALID_CODE,
  isActivated,
  activate,
  deactivate,
  getSettings,
  setSettings,
  getHistory,
  setHistory,
  clearHistory
}

