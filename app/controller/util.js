'use strict'

const svgCaptcha = require('svg-captcha')
const Controller = require('egg').Controller

class UtilHomeController extends Controller {
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
}

module.exports = UtilHomeController
