'use strict'
const BaseController = require('./base')
const svgCaptcha = require('svg-captcha')
const fse = require('fs-extra')
const path = require('path')

class UtilHomeController extends BaseController {
  // 图形验证码
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

  // 上传文件
  async uploadfile() {

    // 模拟报错
    if (Math.random() > 0.3) {
      // eslint-disable-next-line no-return-assign
      return this.ctx.status = 500

    }

    const { ctx } = this
    const file = ctx.request.files[0]
    const { name, hash } = ctx.request.body
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash) // chunk 存放路徑
    // const filePath = path.resolve() // 文件最终存放路径
    console.log('file', file)
    console.log('name', name)

    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath)
    }

    // 切片上传
    await fse.move(file.filepath, `${chunkPath}/${name}`)

    // 普通上传
    // await fse.move(file.filepath, this.config.UPLOAD_DIR + '/' + file.filename)

    this.message('切片上传成功')
    // this.success({
    //   url: `/public/${file.filename}`,
    // })
  }

  // 发送邮件验证码
  async sendcode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random().toString().slice(2, 8)
    console.log('邮箱' + email + '==== 验证码' + code)
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

  // 合并文件切片
  async mergefile() {
    const { ext, size, hash } = this.ctx.request.body

    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await this.ctx.service.tools.mergeFile(filePath, hash, size)
    this.success({
      url: `/public/${hash}.${ext}`,
    })
  }

  async checkfile() {
    const { ctx } = this
    const { hash, ext } = ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    let uploaded = false
    let uploadedList = []
    if (fse.existsSync(filePath)) {
      uploaded = true
    } else {
      uploadedList = await this.getUploadList(path.resolve(this.config.UPLOAD_DIR, hash))
    }
    this.success({
      uploaded,
      uploadedList,
    })
  }
  async getUploadList(dirPath) {
    return fse.existsSync(dirPath)
      ? (await fse.readdir(dirPath)).filter(name => name[0] !== '.') // .DS_Strore 隐藏文件前缀
      : []
  }
}

module.exports = UtilHomeController
