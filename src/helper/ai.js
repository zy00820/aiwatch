/**
 * AI 请求封装（require 引入）
 */
var fetch = null
try {
  fetch = require('@blueos.network.fetch')
} catch (e) {
  fetch = null
}

/**
 * 发送对话请求
 * @param {Object} options
 * @param {string} options.baseUrl
 * @param {string} options.apiKey
 * @param {string} options.model
 * @param {string} options.systemPrompt
 * @param {Array} options.history - 历史消息（不含本次用户输入）
 * @param {string} options.userText - 本次用户输入
 */
function chat(options) {
  options = options || {}
  var baseUrl = options.baseUrl
  var apiKey = options.apiKey
  var model = options.model
  var systemPrompt = options.systemPrompt
  var history = options.history || []
  var userText = options.userText

  return new Promise(function (resolve, reject) {
    if (!baseUrl || !apiKey) {
      reject(new Error('请先在设置页填写接口地址与 API Key'))
      return
    }

    var messages = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    // 只取历史中的 assistant 消息和之前的 user 消息，不包含本次 userText
    history.slice(-10).forEach(function (m) {
      if (m && m.role && m.content && m.role !== 'loading') {
        messages.push({ role: m.role, content: m.content })
      }
    })
    // 本次用户输入只追加一次
    messages.push({ role: 'user', content: userText })

    var body = JSON.stringify({
      model: model || 'glm-4.7-flash',
      messages: messages,
      stream: false,
      max_tokens: 512,
      temperature: 0.7
    })

    var settled = false
    var timer = null
    if (typeof setTimeout === 'function') {
      timer = setTimeout(function () {
        if (!settled) {
          settled = true
          reject(new Error('请求超时（30秒），请检查网络'))
        }
      }, 30000)
    }

    function clearTimer() {
      if (timer && typeof clearTimeout === 'function') {
        try { clearTimeout(timer) } catch (e) {}
      }
    }

    try {
      fetch.fetch({
        url: baseUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        data: body,
        responseType: 'json',
        timeout: 30000,
        success: function (res) {
          if (settled) return
          settled = true
          clearTimer()
          try {
            if (res && res.code && (res.code < 200 || res.code >= 300)) {
              reject(new Error('HTTP ' + res.code))
              return
            }
            var data = res && res.data
            var obj = data
            if (typeof data === 'string') {
              try { obj = JSON.parse(data) } catch (e) { obj = null }
            }
            var reply = obj && obj.choices && obj.choices[0] && obj.choices[0].message
              ? obj.choices[0].message.content
              : ''
            if (reply) {
              resolve(String(reply).trim())
            } else {
              var errMsg = (obj && obj.error && obj.error.message) ? obj.error.message : 'AI 未返回有效内容'
              reject(new Error(errMsg))
            }
          } catch (e) {
            reject(new Error('解析响应失败：' + e.message))
          }
        },
        fail: function (data, code) {
          if (settled) return
          settled = true
          clearTimer()
          reject(new Error('请求失败 code=' + code + ' ' + (data || '')))
        }
      })
    } catch (e) {
      if (!settled) {
        settled = true
        clearTimer()
        reject(new Error('请求异常：' + e.message))
      }
    }
  })
}

export { chat }
export default { chat: chat }
