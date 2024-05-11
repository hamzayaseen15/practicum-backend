const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')

// create Nodemailer transporter
const mailer = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
})

/**
 * Render and return html string of the email template
 * @param {object} params
 * @param {string} params.templateName
 * @param {object} params.values
 */
async function renderEmailTemplate({ templateName, values }) {
  const bodyPath = path.join(
    root_directory,
    'src',
    'views',
    'emails',
    `${templateName}.html`
  )

  if (!fs.existsSync(bodyPath)) {
    throw new Error("Email's template file does not exist on path")
  }

  let html = fs.readFileSync(bodyPath).toString()

  for (const [key, value] of Object.entries(values)) {
    html = html.replaceAll(`{{${key}}}`, value)
  }

  return html
}

/**
 * send an email
 * @param {object} params
 * @param {string} params.templateName
 * @param {object} params.values
 * @param {string} params.to
 * @param {string} params.subject
 * @param {*} params.attachments
 */
async function sendEmail({ templateName, values, to, subject, attachments }) {
  const emailHtml = await renderEmailTemplate({
    templateName,
    values: { ...values, subject },
  })

  const emailPayload = {
    from: process.env.MAIL_FROM || 'noreply@test.com',
    to,
    subject,
    html: emailHtml,
    attachDataUrls: true,
  }

  if (attachments) emailPayload.attachments = attachments

  await mailer.sendMail(emailPayload)
}

module.exports = {
  renderEmailTemplate,
  sendEmail,
}
