const postmark = require('postmark');

const client = new postmark.ServerClient(process.env.POSTMARK_KEY);

module.exports = async function sendMail(email, template, data) {
  try {
    const { subject, render } = require(`./template-${template}`);
    const { html, text } = render(data);

    await client.sendEmail({
      From: process.env.POSTMARK_FROM,
      To: email,
      Subject: subject,
      TextBody: text,
      HtmlBody: html,
    });
  } catch (error) {
    return error;
  }
}
