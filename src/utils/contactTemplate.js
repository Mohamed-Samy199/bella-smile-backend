export const contactEmailTemplate = (firstName, lastName, email, phone, message) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>New Contact Message — Bella Smile</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
          background: #f8f9fa;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 650px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
        .header {
          background: linear-gradient(135deg, #003366, #1e90ff);
          color: #ffffff;
          padding: 35px 40px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .header p {
          margin: 8px 0 0;
          opacity: 0.85;
          font-size: 14px;
        }
        .content {
          padding: 40px;
          line-height: 1.8;
        }
        .info {
          background: #f0f7ff;
          padding: 18px 22px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 5px solid #1e90ff;
          font-size: 15px;
        }
        .info span {
          color: #1e90ff;
          font-weight: 600;
        }
        .message-box {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 10px;
          border: 1px solid #e0e0e0;
          font-size: 15px;
          color: #333;
          white-space: pre-wrap;
          line-height: 1.8;
        }
        .footer {
          background: #003366;
          color: #aaaaaa;
          text-align: center;
          padding: 25px;
          font-size: 13px;
        }
        .footer a {
          color: #1e90ff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">

        <div class="header">
          <h1>🦷 Bella Smile</h1>
          <p>New Contact Message from the Website</p>
        </div>

        <div class="content">
          <p>You have received a new message from the Bella Smile website contact form.</p>

          <div class="info">
            <span>Name:</span> ${firstName} ${lastName}<br/>
            <span>Email:</span> ${email}<br/>
            <span>Phone:</span> ${phone}
          </div>

          <p><strong>Message:</strong></p>
          <div class="message-box">${message}</div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Bella Smile • All Rights Reserved</p>
          <p>This email was sent automatically from the contact form.</p>
        </div>

      </div>
    </body>
    </html>
  `;
};