/**
 * AI 请求封装：基于 fetch 调用兼容 OpenAI Chat Completions 的接口
 * 依赖 manifest 中声明的 blueos.communication.network.fetch
 *
 * 适用于：SiliconFlow 免费平台、DeepSeek、OpenAI、Moonshot 等兼容接口
 */
import fetch from '@blueos.communication.network.fetch'

/**
 * 发送对话请求
 * @param {Object} options
 * @param {string} options.baseUrl   接口地址，例如 https://api.siliconflow.cn/v1/chat/completions
 * @param {string} options.apiKey    API Key（用户在设置页填入）
 * @param {string} options.model     模型名，例如 Qwen/Qwen2.5-7B-Instruct
 * @param {string} options.systemPrompt 系统提示词
 * @param {Array<{role:string,content:string}>} options.history  历史对话
 * @param {string} options.userText  本次用户输入
 * @returns {Promise<string>} AI 回复的文本
 */
export function chat(options) {
  const {
    baseUrl,
    apiKey,
    model,
    systemPrompt,
    history = [],
    userText
  } = options || {}

  return new Promise((resolve, reject) => {
    if (!baseUrl || !apiKey) {
      reject(new Error('请先在设置页填写接口地址与 API Key'))
      return
    }

    // 组装 messages：system + 历史 + 当前用户输入
    const messages = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    history.slice(-10).forEach((m) => {
      if (m && m.role && m.content) {
        messages.push({ role: m.role, content: m.content })
      }
    })
    messages.push({ role: 'user', content: userText })

    const body = JSON.stringify({
      model: model || 'Qwen/Qwen2.5-7B-Instruct',
      messages,
      stream: false,
      max_tokens: 512,
      temperature: 0.7
    })

    fetch.fetch({
      url: baseUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      data: body,
      responseType: 'json',
      success: (res) => {
        if (res && res.code && (res.code < 200 || res.code >= 300)) {
          reject(new Error(`HTTP ${res.code}`))
          return
        }
        const data = res && res.data
        // 兼容 json 响应：data 可能已是对象，也可能是字符串
        let obj = data
        if (typeof data === 'string') {
          try { obj = JSON.parse(data) } catch (e) { obj = null }
        }
        const reply = obj && obj.choices && obj.choices[0] && obj.choices[0].message
          ? obj.choices[0].message.content
          : ''
        if (reply) {
          resolve(reply.trim())
        } else {
          reject(new Error('AI 未返回有效内容'))
        }
      },
      fail: (data, code) => {
        reject(new Error(`请求失败 code=${code} ${data}`))
      }
    })
  })
}

export default {
  chat
}
