/**
 * ==============================================================================
 * GRILLISTA - GOOGLE APPS SCRIPT WEBHOOK FOR GOOGLE SHEETS & AUTO EMAIL DISPATCH
 * ==============================================================================
 *
 * HOW TO SETUP (Takes 2 minutes):
 * ------------------------------------------------------------------------------
 * 1. Open Google Sheets (https://sheets.new) and name it "Grillista Inquiries"
 * 2. In Row 1, name the column headers:
 *    A: Timestamp | B: Full Name | C: Email Address | D: Phone Number |
 *    E: Inquiry Type | F: Subject | G: Message | H: Status
 * 3. In the top menu, click: Extensions > Apps Script
 * 4. Delete any code inside Code.gs and PASTE ALL CODE FROM THIS FILE.
 * 5. Click "Deploy" (top-right blue button) > "New deployment"
 * 6. Select type: "Web app"
 *    - Description: "Grillista Inquiry API"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (IMPORTANT: select "Anyone")
 * 7. Click "Deploy" and Authorize permissions.
 * 8. Copy the "Web app URL" and paste it into `js/config.js` and `index.html`!
 * ==============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = {};

    if (e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (err) {
        rawData = e.parameter || {};
      }
    } else {
      rawData = e.parameter || {};
    }

    var timestamp = new Date();
    var name = rawData.name || 'Anonymous User';
    var email = rawData.email || '';
    var phone = rawData.phone || '';
    var inquiryType = rawData.inquiryType || rawData.model || 'General Inquiry';
    var subject = rawData.subject || 'Website Inquiry';
    var message = rawData.message || rawData.notes || 'N/A';
    var status = 'New Lead';

    // 1. Append record to Google Sheet
    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      inquiryType,
      subject,
      message,
      status
    ]);

    // 2. Automatically Send Confirmation Email to the User
    if (email && email.indexOf('@') > -1) {
      sendUserConfirmationEmail(name, email, phone, inquiryType, subject, message);
    }

    // 3. Send Notification Email to Grillista Admin / Franchise Team
    sendAdminNotificationEmail(name, email, phone, inquiryType, subject, message, timestamp);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Inquiry successfully saved to Google Sheets and confirmation email dispatched.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Grillista Google Sheet & Email Webhook Service is active.'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sends a luxury, branded HTML confirmation email to the user
 */
function sendUserConfirmationEmail(name, email, phone, inquiryType, subject, message) {
  var emailSubject = "Thank You for Contacting Grillista - We've Received Your Inquiry!";
  
  var htmlBody = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #F8F9FB; padding: 30px 15px; color: #111827;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #E5E7EB;">
        
        <!-- Header Banner -->
        <div style="background-color: #000000; padding: 26px 30px; text-align: center; border-bottom: 3px solid #FFD000;">
          <h1 style="color: #FFD000; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 900;">GRILLISTA</h1>
          <p style="color: #FFFFFF; margin: 4px 0 0; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">🌱 100% PURE VEG | THE ULTIMATE FOOD CHAIN</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 32px;">
          <h2 style="color: #111827; font-size: 20px; font-weight: 800; margin-top: 0;">Hi ${name},</h2>
          
          <p style="font-size: 15px; line-height: 1.6; color: #4B5563;">
            Thank you for reaching out to <strong>Grillista</strong>. We have successfully received your inquiry and our team is already reviewing your details.
          </p>

          <!-- Summary Box -->
          <div style="background-color: #FAF8F4; border: 1px solid #F3E8C8; border-radius: 10px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px; font-size: 14px; color: #8A6D1E; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">Summary of Your Submission:</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 5px 0; color: #6B7280; width: 35%;"><strong>Inquiry Type:</strong></td>
                <td style="padding: 5px 0; color: #111827; font-weight: 600;">${inquiryType}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #6B7280;"><strong>Subject:</strong></td>
                <td style="padding: 5px 0; color: #111827; font-weight: 600;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #6B7280;"><strong>Contact Phone:</strong></td>
                <td style="padding: 5px 0; color: #111827; font-weight: 600;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #6B7280; vertical-align: top;"><strong>Message:</strong></td>
                <td style="padding: 5px 0; color: #111827; font-style: italic;">"${message}"</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #4B5563;">
            One of our franchise expansion heads or customer success specialists will get back to you within <strong>24 business hours</strong>.
          </p>

          <!-- Urgent Assistance Row -->
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
            <p style="font-size: 13px; color: #6B7280; margin: 0 0 12px; font-weight: 700;">Need immediate assistance?</p>
            <a href="https://wa.me/916386818682" style="background-color: #25D366; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 25px; font-size: 13px; font-weight: 800; display: inline-block; margin-right: 8px;">💬 Chat on WhatsApp</a>
            <a href="tel:+919711900055" style="background-color: #111827; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 25px; font-size: 13px; font-weight: 800; display: inline-block;">📞 Call: +91 97119 00055</a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #F3F4F6; padding: 16px 30px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0 0 4px;">Grillista Food Private Limited | CIN: U55200UP2021PTC145678</p>
          <p style="margin: 0;">Kakadeo & Barra, Kanpur, Uttar Pradesh | <a href="mailto:franchise@grillista.com" style="color: #6B7280;">franchise@grillista.com</a></p>
        </div>

      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: emailSubject,
    htmlBody: htmlBody
  });
}

/**
 * Sends real-time lead notification to Grillista Team
 */
function sendAdminNotificationEmail(name, email, phone, inquiryType, subject, message, timestamp) {
  var adminEmail = Session.getActiveUser().getEmail(); // Sends to the sheet owner's email
  if (!adminEmail) return;

  var adminSubject = "🔥 [NEW LEAD] " + inquiryType + " - " + name + " (" + phone + ")";
  var adminHtml = `
    <h2>New Website Inquiry Received</h2>
    <p><strong>Time:</strong> ${timestamp}</p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a> | <a href="https://wa.me/${phone.replace(/\\D/g, '')}">Chat on WhatsApp</a></p>
    <p><strong>Type:</strong> ${inquiryType}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong><br>${message}</p>
  `;

  try {
    MailApp.sendEmail({
      to: adminEmail,
      subject: adminSubject,
      htmlBody: adminHtml
    });
  } catch(e) {
    // Ignore admin email errors if quota is reached
  }
}
