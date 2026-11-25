const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
};

const verificationEmail = ({ name, verificationUrl }) => {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(verificationUrl);

  return {
    subject: "Verify your email address",

    html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verify your email</title>
          </head>

          <body style="margin:0;padding:0;background-color:#f7f5f0;font-family:Arial,sans-serif;color:#262626;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:40px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;padding:36px;">
                    <tr>
                      <td>
                        <h1 style="font-size:25px;margin:0 0 20px;">
                          Welcome to TasteMap!
                        </h1>

                        <p style="font-size:15px;line-height:1.7;">
                          Hi ${safeName},
                        </p>

                        <p style="font-size:15px;line-height:1.7;">
                          We're glad you're here. Before you start discovering and ranking restaurants, please verify your email address.
                        </p>

                        <p style="margin:30px 0;">
                          <a
                            href="${safeUrl}"
                            style="display:inline-block;background:#262626;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:7px;font-size:15px;font-weight:bold;"
                          >
                            Verify my email
                          </a>
                        </p>

                        <p style="font-size:13px;line-height:1.6;color:#666666;">
                          This verification link expires in 24 hours.
                        </p>

                        <p style="font-size:13px;line-height:1.6;color:#666666;">
                          If you didn't create an account, you can safely ignore this email.
                        </p>

                        <hr style="border:0;border-top:1px solid #eeeeee;margin:30px 0;" />

                        <p style="font-size:12px;color:#999999;">
                          TasteMap
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        `,

    text: `
Hi ${name},

Welcome to TasteMap!

Please verify your email address using the link below:

${verificationUrl}

This verification link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

TasteMap
        `.trim()
  };
};

module.exports = verificationEmail;
