'use strict'
const BaseController = require('./base')
const svgCaptcha = require('svg-captcha')

class UtilHomeController extends BaseController {
  async captcha() {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 6,
    })
    this.ctx.session.captcha = captcha.text
    this.ctx.type = 'svg'
    console.log('captcha=>', captcha.text)
    this.ctx.body = captcha.data
  }

  async sendcode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random().toString().slice(2, 8)
    console.log('邮箱' + email + '验证码' + code)
    ctx.session.emailcode = code

    const subject = 'nuxt test captcha'
    const text = ''
    const html = `<h2>Nuxt开放社区</h2><a href="https://zh.nuxtjs.org/"><span>${code}</span></a>`
    const hasSend = await this.service.tools.sendMail(email, subject, text, html)
    if (hasSend) {
      this.message('发送成功')
    } else {
      this.error('发送失败')
    }
  }
}

module.exports = UtilHomeController
