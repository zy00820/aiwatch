/**
 * 本地 K-V 存储封装（require 引入 + 内存兜底，永不崩溃）
 */
var kv = null
try {
  kv = require('@blueos.storage.storage')
} catch (e) {
  kv = null
}

// 内存兜底：系统存储不可用时使用
var _mem = {}
var KEY_SETTINGS = 'ai_settings'
var KEY_HISTORY = 'ai_history'
var KEY_ACTIVATION = 'ai_activation'
var VALID_CODE = 'b32000'

var ACTIVATION_NOTICE = {
  price: '4元',
  contact: 'zy291817@outlook.com'
}

var DEFAULT_SETTINGS = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiKey: '',
  model: 'glm-4.7-flash',
  systemPrompt: '你是一个简洁的智能助手，请用尽量短的中文回答，适合手表小屏幕阅读。',
  inputMethod: 'pinyin',
  pinyinLayout: '26',
  defaultLang: 'zh'
}

function merge(defaults, overrides) {
  var result = {}
  for (var k in defaults) {
    if (defaults.hasOwnProperty(k)) result[k] = defaults[k]
  }
  if (overrides) {
    for (var k2 in overrides) {
      if (overrides.hasOwnProperty(k2)) result[k2] = overrides[k2]
    }
  }
  return result
}

// 同步读取（优先用 getSync，失败用内存）
function syncGet(key, def) {
  try {
    if (kv && typeof kv.getSync === 'function') {
      var v = kv.getSync({ key: key })
      if (v === undefined || v === null || v === '') return def
      return v
    }
  } catch (e) {}
  if (_mem[key] !== undefined) return _mem[key]
  return def
}

// 同步写入
function syncSet(key, value) {
  try {
    if (kv && typeof kv.set === 'function') {
      kv.set({ key: key, value: value })
      return true
    }
  } catch (e) {}
  _mem[key] = value
  return true
}

function isActivated() {
  try {
    var v = syncGet(KEY_ACTIVATION, false)
    return Promise.resolve(v === true || v === 'true')
  } catch (e) {
    return Promise.resolve(false)
  }
}

function activate(code) {
  try {
    if (String(code || '').trim() !== VALID_CODE) {
      return Promise.resolve(false)
    }
    syncSet(KEY_ACTIVATION, true)
    return Promise.resolve(true)
  } catch (e) {
    return Promise.resolve(false)
  }
}

function getSettings() {
  try {
    var raw = syncGet(KEY_SETTINGS, null)
    if (raw) {
      var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      return Promise.resolve(merge(DEFAULT_SETTINGS, parsed))
    }
  } catch (e) {}
  return Promise.resolve(merge(DEFAULT_SETTINGS))
}

function setSettings(settings) {
  try {
    syncSet(KEY_SETTINGS, JSON.stringify(settings))
    return Promise.resolve(true)
  } catch (e) {
    return Promise.resolve(false)
  }
}

function getHistory() {
  try {
    var raw = syncGet(KEY_HISTORY, null)
    if (raw) {
      var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (parsed && parsed.slice) return Promise.resolve(parsed)
    }
  } catch (e) {}
  return Promise.resolve([])
}

function setHistory(history) {
  try {
    syncSet(KEY_HISTORY, JSON.stringify((history || []).slice(-20)))
    return Promise.resolve(true)
  } catch (e) {
    return Promise.resolve(false)
  }
}

function clearHistory() {
  return setHistory([])
}

export {
  DEFAULT_SETTINGS,
  ACTIVATION_NOTICE,
  VALID_CODE,
  isActivated,
  activate,
  getSettings,
  setSettings,
  getHistory,
  setHistory,
  clearHistory
}

export default {
  DEFAULT_SETTINGS: DEFAULT_SETTINGS,
  ACTIVATION_NOTICE: ACTIVATION_NOTICE,
  VALID_CODE: VALID_CODE,
  isActivated: isActivated,
  activate: activate,
  getSettings: getSettings,
  setSettings: setSettings,
  getHistory: getHistory,
  setHistory: setHistory,
  clearHistory: clearHistory
}
