'use strict'

const { Service } = require('egg')
const nodemailer = require('nodemailer')
const path = require('path')
const fse = require('fs-extra')

const userEmail = '1018513521@qq.com'
const transporter = nodemailer.createTransport({
  service: 'qq',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'eddoczjczefwbcaf',
  },
})

class ToolService extends Service {
  async sendMail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      cc: userEmail,
      to: email,
      subject,
      text,
      html,
    }
    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (err) {
      console.log('email error', err)
      return false
    }
  }

  async mergeFile(filePath, fileHash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, fileHash)
    let chunks = await fse.readdir(chunkDir)
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1]) // 重新排序
    chunks = chunks.map(cp => path.resolve(chunkDir, cp)) // 重新放置位置
    await this.mergeChunks(chunks, filePath, size)
  }
  async mergeChunks(files, dest, size) {
    const pipStream = (filePath, writeStream) => new Promise(resolve => {
      const readStream = fse.createReadStream(filePath)
      readStream.on('end', () => {
        fse.unlinkSync(filePath) // 删切片文件
        resolve()
      })
      readStream.pipe(writeStream)
    })
    await Promise.all(
      // eslint-disable-next-line array-callback-return
      files.map((file, index) => {
        pipStream(file, fse.createWriteStream(dest, {
          start: index * size,
          end: (index + 1) * size,
        }))
      })
    )
  }
}

module.exports = ToolService
