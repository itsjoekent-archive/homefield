module.exports = {
  base: (content) => `
    <html>
      <body style="background: #1E5DFF; padding: 48px;">
        <img style="display: block; height: 50px; margin: 0 auto 24px auto;" src="https://i.imgur.com/X1AODI6.png" />
        <div style="width: 100%; max-width: 600px; margin: 0 auto; background: #FFFFFF; padding: 24px; border-radius: 8px;">
          ${content}
        </div>
      </body>
    </html>
  `,
  blockLink: (text, href) => `<a href="${href}" style="font-family: Helvetica, sans-serif; font-size: 16px; line-height: 1.1; color: #001959; margin-bottom: 16px;">${text}</a>`,
  paragraph: (text) => `<p style="font-family: Helvetica, sans-serif; font-size: 18px; line-height: 1.1; color: #111; margin-bottom: 16px;">${text}</p>`,
};
