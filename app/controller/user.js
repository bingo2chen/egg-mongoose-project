'use strict'
const BaseController = require('./base')
const md5 = require('md5')
const jwt = require('jsonwebtoken')

const HashSalt = 'edcwwb@good666!'
const createRule = {
  nickname: { type: 'string' },
  passwd: { type: 'string' },
  email: { type: 'email' },
  captcha: { type: 'string' },
}

class UserController extends BaseController {
  async login() {
    // this.success('token test')
    const { ctx, app } = this
    const { captcha, email, passwd, nickname } = ctx.request.body
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }
    const user = await ctx.model.User.findOne({
      email,
      passwd: md5(passwd + HashSalt),
    })
    if (!user) {
      return this.error('用户名密码错误')
    }
    const token = jwt.sign({
      _id: user._id,
      email,
    }, app.config.jwt.secret, {
      expiresIn: '2h',
    })
    this.success({ token, nickname, email })
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
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }
    // 邮箱是否重复
    if (await this.checkEmail(email)) {
      this.error('邮箱重复啦！')
    } else {
      const ret = await ctx.model.User.create({
        email,
        nickname,
        passwd: md5(passwd + HashSalt),
      })
      if (ret._id) {
        this.message('注册成功')
      }
    }
  }

  async checkEmail(email) {
    const user = this.ctx.model.User.findOne({ email })
    return user
  }

  async verify() {

  }
  async info() {

  }
}

module.exports = UserController
