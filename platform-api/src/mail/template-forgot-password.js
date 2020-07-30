const { base, blockLink, paragraph } = require('./components');

module.exports = {
  subject: 'Your HomeField password reset',
  render: (data) => {
    const { account: { _id }, resetToken } = data;
    const { APP_HOST } = process.env;

    const resetLink = `${APP_HOST}/reset-password?accountId=${encodeURIComponent(_id.toString())}&resetToken=${encodeURIComponent(resetToken)}`;

    const html = base(`
      ${paragraph('A password reset was requested for your HomeField account. To reset your password click this link:')}
      ${blockLink(resetLink, resetLink)}
      ${paragraph('If you did not make this request, please ignore this email.')}
    `);

    return {
      text: `A password reset was requested for your HomeField account, if you did not make this request please ignore this email. To reset your password, click the following link: ${resetLink}`,
      html,
    }
  }
}
