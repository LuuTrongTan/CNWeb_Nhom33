const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */

/**
 * Send verification email
 * @param {string} to
 * @param {string} code
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: to,
    subject: 'Xác thực tài khoản',
    text: `Mã xác thực tài khoản của bạn là: ${code}. Mã này có hiệu lực trong 10 phút.`,
  };

  await transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Đặt lại mật khẩu',
    text: `Mã xác thực để đặt lại mật khẩu của bạn là: ${code}. Mã này có hiệu lực trong 10 phút.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
