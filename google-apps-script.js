/**
 * ==============================================================================
 * GRILLISTA - OFFICIAL GOOGLE APPS SCRIPT WEBHOOK & AUTOMATED EMAIL CONTROLLER
 * ==============================================================================
 *
 * SPREADSHEET TAB NAME: "Inquiries" (or default Active Sheet)
 * ADMIN RECIPIENT EMAIL: "grillista8@gmail.com"
 *
 * COLUMNS POPULATED AUTOMATICALLY:
 * A: Timestamp | B: Full Name | C: Email Address | D: Phone Number |
 * E: Inquiry Type | F: Subject | G: Message | H: Reference ID
 * ==============================================================================
 */

const SHEET_NAME = "Inquiries";
const ADMIN_EMAIL = "grillista8@gmail.com";
const WHATSAPP_NUMBER = "916386818682"; // Grillista Official WhatsApp

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var rawData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (err) {
        rawData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      rawData = e.parameter;
    }

    const name = (rawData.name || "Valued Guest").trim();
    const email = (rawData.email || "").trim();
    const phone = (rawData.phone || "").trim();
    const inquiryType = (rawData.inquiryType || rawData.model || "Franchise Inquiry").trim();
    
    // Format Subject & Message for both General Inquiries & Franchise Applications
    var subject = (rawData.subject || "").trim();
    if (!subject && rawData.preferredCity) {
      subject = "Franchise Application (" + rawData.preferredCity + (rawData.investmentBudget ? " - " + rawData.investmentBudget.toUpperCase() : "") + ")";
    } else if (!subject) {
      subject = "Website Lead";
    }

    var message = (rawData.message || rawData.notes || "N/A").trim();
    if (rawData.hasCommercialSpace && rawData.hasCommercialSpace !== "N/A") {
      message += " [Commercial Space: " + rawData.hasCommercialSpace + "]";
    }

    // Generate unique reference ID
    const referenceId =
      "GRL" + Utilities.getUuid().replace(/-/g, "").substring(0, 7).toUpperCase();

    // Access or create sheet safely
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.getActiveSheet();
    }

    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email Address",
        "Phone Number",
        "Inquiry Type",
        "Subject",
        "Message",
        "Reference ID"
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#0F4C2A").setFontColor("#FFFFFF");
    }

    // Append submission row
    sheet.appendRow([
      new Date(),
      name,
      email,
      phone,
      inquiryType,
      subject,
      message,
      referenceId
    ]);

    // 1. Send Exact Luxury Branded Confirmation Email to Customer
    if (email && email.indexOf("@") > -1) {
      try {
        sendCustomerEmail(
          name,
          email,
          phone,
          inquiryType,
          subject,
          message,
          referenceId
        );
      } catch (mailErr) {
        Logger.log("Customer email error: " + mailErr.toString());
      }
    }

    // 2. Notification Email to Grillista Admin Team
    try {
      sendAdminEmail(
        name,
        email,
        phone,
        inquiryType,
        subject,
        message,
        referenceId
      );
    } catch (adminErr) {
      Logger.log("Admin email error: " + adminErr.toString());
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        referenceId: referenceId,
        message: "Inquiry successfully recorded in current sheet and confirmation email dispatched."
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    sheet: SHEET_NAME,
    message: 'Grillista Google Sheets & Email Webhook Service is active.'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sends the flagship luxury branded HTML confirmation email matching the exact reference mockup
 */
function sendCustomerEmail(
  name,
  email,
  phone,
  inquiryType,
  subject,
  message,
  referenceId
) {
  const firstName = escapeHtml((name || 'Valued Guest').trim().split(' ')[0]);
  const formattedDate = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "GMT+5:30",
    "dd MMM yyyy | hh:mm a"
  );

  const safeName = escapeHtml(name || 'Valued Guest');
  const safePhone = escapeHtml(phone || '+91 90290 20888');
  const safeEmail = escapeHtml(email || 'guest@example.com');
  const safeType = escapeHtml(inquiryType || 'Franchise Inquiry');
  const safeSubject = escapeHtml(subject || 'Franchise Opportunity');
  const safeMessage = escapeHtml(message || 'I would like to know more about the franchise opportunity in my city.');

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received - Grillista</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Manrope:wght@400;600;700;800;900&display=swap');
    body { margin: 0; padding: 0; background-color: #F4F6F9; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .grid-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .grid-col-right { padding-top: 14px !important; border-left: none !important; border-top: 1px solid #F1F5F9 !important; }
      .footer-col { display: inline-block !important; width: 48% !important; margin-bottom: 12px !important; }
      .whatsapp-btn-cell { display: block !important; width: 100% !important; text-align: left !important; margin-top: 10px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #F4F6F9;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F4F6F9">
    <tr>
      <td align="center" style="padding: 10px;">
        
        <!-- Main Email Container -->
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 600px; max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid #E2E8F0;">
          
          <!-- 1. HERO BANNER WITH BRANDING & GOURMET BURGER COMPOSITION -->
          <tr>
            <td style="padding: 0; background-color: #0B0E14;" align="center">
              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_hero_header.jpg" alt="Grillista - The Ultimate Food Chain" width="600" style="width: 100%; max-width: 600px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- 2. STATUS BADGE & HEADLINE -->
          <tr>
            <td align="center" style="padding: 24px 24px 8px 24px;">
              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_check_badge.png" alt="Success" width="48" height="48" style="display: block; margin: 0 auto;" />
              <h1 style="margin: 12px 0 2px 0; font-size: 26px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Inquiry Received!</h1>
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 900; color: #F59E0B; letter-spacing: -0.5px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Thank You!</h2>
            </td>
          </tr>

          <!-- 3. SALUTATION & GREETING -->
          <tr>
            <td style="padding: 0 28px 14px 28px; color: #334155; font-size: 13.5px; line-height: 1.6; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 800; color: #0F172A;">Hi ${firstName},</p>
              <p style="margin: 0;">
                Thank you for reaching out to <strong>Grillista — The Ultimate Food Chain</strong>. We're pleased to confirm that we've successfully received your inquiry. Our team is reviewing your request and will get back to you within <strong>24 business hours</strong>.
              </p>
            </td>
          </tr>

          <!-- 4. YOUR INQUIRY DETAILS CARD -->
          <tr>
            <td style="padding: 4px 28px 18px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #FDE68A; border-radius: 12px; overflow: hidden; background-color: #FFFFFF;">
                
                <!-- Card Header -->
                <tr>
                  <td style="background-color: #FEF3C7; padding: 10px 16px; border-bottom: 1px solid #FDE68A;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td valign="middle" style="font-size: 14px; font-weight: 800; color: #1E293B; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                          Your Inquiry Details
                        </td>
                        <td valign="middle" align="right" style="font-size: 11px; color: #78350F; font-family: 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.35;">
                          <strong style="color: #1E293B;">Reference ID: #${referenceId}</strong><br>
                          <span style="color: #92400E;">${formattedDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card Body (2 Columns with Clean Outline Icons) -->
                <tr>
                  <td style="padding: 16px 18px; background-color: #FAFAF9;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left Column: Name, Email, Phone -->
                        <td class="grid-col" valign="top" style="width: 50%; padding-right: 10px;">
                          
                          <!-- Field 1: Name -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="24" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_user.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Name</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #0F172A; margin-top: 1px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${safeName}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Field 2: Email -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="24" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_email.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Email</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #0F172A; margin-top: 1px; font-family: 'Segoe UI', Roboto, Arial, sans-serif; word-break: break-all;">${safeEmail}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Field 3: Phone -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="24" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_phone.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Phone</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #0F172A; margin-top: 1px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${safePhone}</div>
                              </td>
                            </tr>
                          </table>

                        </td>

                        <!-- Right Column: Inquiry Type, Subject, Message -->
                        <td class="grid-col grid-col-right" valign="top" style="width: 50%; padding-left: 12px; border-left: 1px solid #E2E8F0;">
                          
                          <!-- Field 4: Inquiry Type -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="24" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_type.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Inquiry Type</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #0F172A; margin-top: 1px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${safeType}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Field 5: Subject -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="24" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_subject.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Subject</div>
                                <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-top: 1px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${safeSubject}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Field 6: Message -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="24" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_message.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Message</div>
                                <div style="font-size: 11.5px; font-style: italic; color: #334155; margin-top: 1px; line-height: 1.4; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">${safeMessage}</div>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- 5. WHATSAPP NEED IMMEDIATE ASSISTANCE BANNER -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 12px 16px;">
                <tr>
                  <td width="36" valign="middle">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/whatsapp.png" width="32" height="32" alt="WhatsApp" style="display: block; border-radius: 50%; border: none;">
                  </td>
                  <td valign="middle" style="padding-left: 10px;">
                    <div style="font-size: 13px; font-weight: 800; color: #065F46; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Need Immediate Assistance?</div>
                    <div style="font-size: 11.5px; color: #047857; margin-top: 2px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Chat with us on WhatsApp for a faster response.</div>
                  </td>
                  <td class="whatsapp-btn-cell" valign="middle" align="right">
                    <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Grillista,%20I%20have%20an%20inquiry%20reference%20%23${referenceId}" target="_blank" style="background-color: #10B981; color: #FFFFFF; text-decoration: none; padding: 9px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-block; white-space: nowrap; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      Chat on WhatsApp →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 6. SIGN-OFF, SCRIPT TAGLINE & SOCIALS -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <p style="margin: 0 0 14px 0; color: #475569; font-size: 13px; line-height: 1.6; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                Thank you for choosing Grillista.<br>
                We look forward to being a part of your journey.
              </p>

              <!-- Signature & Watermark Row -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="bottom" style="width: 65%;">
                    <!-- Handwritten Script Tagline Image (Never Breaks Font) -->
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_script_tagline.png" alt="Good Food Brighter Tomorrow" width="180" style="display: block; max-width: 180px; height: auto; margin-bottom: 6px;" />
                    
                    <div style="font-size: 14px; font-weight: 800; color: #0F172A; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Team Grillista</div>
                    <div style="font-size: 11.5px; color: #64748B; font-weight: 600; margin-top: 2px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">The Ultimate Food Chain</div>

                    <!-- Social Icons Row -->
                    <div style="margin-top: 12px;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding-right: 6px;" valign="middle">
                            <a href="https://www.instagram.com/grillista1" target="_blank" style="text-decoration: none; display: inline-block;">
                              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/instagram.png" width="22" height="22" alt="Instagram" style="display: block; border-radius: 50%; border: none;">
                            </a>
                          </td>
                          <td style="padding-right: 6px;" valign="middle">
                            <a href="https://www.facebook.com/share/1EGML5sM3N/" target="_blank" style="text-decoration: none; display: inline-block;">
                              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/facebook.png" width="22" height="22" alt="Facebook" style="display: block; border-radius: 50%; border: none;">
                            </a>
                          </td>
                          <td style="padding-right: 6px;" valign="middle">
                            <a href="https://linkedin.com" target="_blank" style="text-decoration: none; display: inline-block;">
                              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/linkedin.png" width="22" height="22" alt="LinkedIn" style="display: block; border-radius: 50%; border: none;">
                            </a>
                          </td>
                          <td style="padding-right: 10px;" valign="middle">
                            <a href="https://youtube.com" target="_blank" style="text-decoration: none; display: inline-block;">
                              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/youtube.png" width="22" height="22" alt="YouTube" style="display: block; border-radius: 50%; border: none;">
                            </a>
                          </td>
                          <td style="border-left: 1.5px solid #CBD5E1; padding-left: 8px; font-size: 10.5px; font-weight: 800; color: #64748B; font-family: 'Segoe UI', Roboto, Arial, sans-serif; white-space: nowrap;" valign="middle">
                            Follow Our Journey
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                  
                  <!-- Watermark graphic on the right -->
                  <td valign="bottom" align="right" style="width: 35%;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_watermark.png" alt="Food Creates Better Connections" width="115" style="display: block; max-width: 115px; height: auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 7. DARK BRAND FOOTER (4 PILLARS + COPYRIGHT) -->
          <tr>
            <td style="background-color: #090D16; padding: 22px 28px 18px 28px; text-align: center;">
              
              <!-- 4 Value Pillars -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td class="footer-col" align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #E2E8F0; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 4px;">✦</span>
                    Great Taste<br><span style="color: #94A3B8; font-weight: 600;">Always</span>
                  </td>
                  <td class="footer-col" align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #E2E8F0; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 4px;">✦</span>
                    Quality<br><span style="color: #94A3B8; font-weight: 600;">Ingredients</span>
                  </td>
                  <td class="footer-col" align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #E2E8F0; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 4px;">✦</span>
                    Happier<br><span style="color: #94A3B8; font-weight: 600;">Communities</span>
                  </td>
                  <td class="footer-col" align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #E2E8F0; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 4px;">✦</span>
                    A Healthier<br><span style="color: #94A3B8; font-weight: 600;">Tomorrow</span>
                  </td>
                </tr>
              </table>

              <div style="height: 1px; background-color: rgba(255,255,255,0.12); width: 100%; margin: 12px 0;"></div>

              <div style="font-size: 11px; color: #94A3B8; font-weight: 600; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                © 2026 Grillista Food Private Limited. All Rights Reserved.
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;

  MailApp.sendEmail({
    to: email,
    subject: "Inquiry Received — Grillista | #" + referenceId,
    htmlBody: htmlBody,
    name: "Grillista"
  });
}

function sendAdminEmail(
  name,
  email,
  phone,
  inquiryType,
  subject,
  message,
  referenceId
) {
  const body = `
New Grillista Inquiry

Reference ID: #${referenceId}

Name: ${name}
Email: ${email}
Phone: ${phone}

Inquiry Type: ${inquiryType}
Subject: ${subject}

Message:
${message}
`;

  try {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: "New Inquiry — " + inquiryType + " | #" + referenceId,
      body: body,
      name: "Grillista Website"
    });
  } catch (e) {
    // Admin notification fallback
  }
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
