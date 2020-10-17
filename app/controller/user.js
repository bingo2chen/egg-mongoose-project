'use strict'
const BaseController = require('./base')

const createRule = {
  nickname: { type: 'string' },
  passwd: { type: 'string' },
  email: { type: 'email' },
  captcha: { type: 'string' },
}

class UserController extends BaseController {
  async login() {
    
  }

  async register() {
    const { ctx } = this
    try {
      await ctx.validate(createRule)
    } catch (e) {
      return this.error('参数校验失败', -1, e.errors)
    }

    const { email, passwd, captcha, nickname } = ctx.request.body
    console.log({ email, passwd, captcha, nickname })
    if (captcha.toUpperCase() === ctx.session.captcha.toUpperCase()) {
      this.message('egg验证成功')
    } else {
      this.error('验证码错误')
    }
    // this.success({ name: 'kkb' })
  }

  async verify() {

  }
  async info() {

  }
}

module.exports = UserController
