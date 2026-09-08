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

    const city = (rawData.preferredCity || rawData.city || rawData.location || "Kanpur, Uttar Pradesh").trim();

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

    // 2. Notification Email to Grillista Admin Team (Full Luxury Alert Template)
    try {
      sendAdminEmail(
        name,
        email,
        phone,
        inquiryType,
        subject,
        message,
        referenceId,
        city
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

/**
 * Sends the flagship luxury branded HTML notification email to Grillista Admin
 */
function sendAdminEmail(
  name,
  email,
  phone,
  inquiryType,
  subject,
  message,
  referenceId,
  city
) {
  const formattedDate = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "GMT+5:30",
    "dd MMM yyyy | hh:mm a"
  );

  const safeName = escapeHtml(name || "Akash Mishra");
  const safeEmail = escapeHtml(email || "support@grillista.in");
  const safePhone = escapeHtml(phone || "+91 98765 43210");
  const safeCity = escapeHtml(city || "Kanpur, Uttar Pradesh");
  const safeType = escapeHtml(inquiryType || "Franchise Inquiry");
  const safeSubject = escapeHtml(subject || "Franchise Opportunity");
  const safeMessage = escapeHtml(message || "I would like to know more about the franchise opportunity in my city. Please share the investment details, space requirements and the next steps.");
  
  // Clean phone for whatsapp
  const cleanPhone = safePhone.replace(/[^0-9]/g, "");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry Alert - Grillista Admin</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F4F6F9; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .admin-container { width: 100% !important; }
      .grid-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .grid-col-right { padding-top: 14px !important; border-left: none !important; border-top: 1px solid #E2E8F0 !important; }
      .action-col { display: block !important; width: 100% !important; margin-bottom: 8px !important; }
      .footer-grid-col { display: block !important; width: 100% !important; margin-bottom: 14px !important; }
      .stats-col { display: block !important; width: 100% !important; margin-top: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #F4F6F9;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F4F6F9">
    <tr>
      <td align="center" style="padding: 10px;">
        
        <!-- Main Admin Email Container -->
        <table class="admin-container" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 600px; max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid #E2E8F0;">
          
          <!-- 1. HEADER BANNER WITH LOGO, TAGLINE & VEG PANEER DISH -->
          <tr>
            <td style="padding: 0; background-color: #FDFEFE;" align="center">
              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/admin_email_header.jpg" alt="Grillista - Good Food Brighter Tomorrow" width="600" style="width: 100%; max-width: 600px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- 2. NEW INQUIRY ALERT & TWO-COLUMN INTRO -->
          <tr>
            <td style="padding: 24px 28px 14px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Left Intro Headline -->
                  <td valign="top" style="width: 62%; padding-right: 14px;">
                    <div style="display: inline-block; background-color: #DC2626; color: #FFFFFF; font-size: 10.5px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; margin-bottom: 12px;">
                      🔔 NEW INQUIRY ALERT
                    </div>
                    <div style="font-size: 28px; font-weight: 900; color: #0F172A; line-height: 1.15; letter-spacing: -0.5px;">
                      You’ve Got a<br><span style="color: #DC2626;">New Inquiry!</span>
                    </div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 10px;">
                      A new inquiry has been submitted through the Grillista website. Please find the details below and take the necessary action.
                    </div>
                  </td>

                  <!-- Right Side Mini Highlight Card -->
                  <td class="stats-col" valign="top" style="width: 38%;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; border: 1.5px solid #DCFCE7; border-radius: 14px; padding: 14px;">
                      <tr>
                        <td>
                          <div style="font-size: 13px; font-weight: 800; color: #065F46; line-height: 1.2;">
                            📊 Let’s Create<br>a Healthier Tomorrow
                          </div>
                          <div style="width: 40px; height: 3px; background-color: #FFC72C; border-radius: 2px; margin-top: 4px; margin-bottom: 10px;"></div>
                          <div style="font-size: 11px; color: #047857; font-weight: 700; margin-bottom: 5px;">
                            <span style="color: #16A34A; font-weight: 900;">✔</span> More People
                          </div>
                          <div style="font-size: 11px; color: #047857; font-weight: 700; margin-bottom: 5px;">
                            <span style="color: #16A34A; font-weight: 900;">✔</span> More Flavours
                          </div>
                          <div style="font-size: 11px; color: #047857; font-weight: 700;">
                            <span style="color: #16A34A; font-weight: 900;">✔</span> A Brighter Tomorrow
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 3. INQUIRY DETAILS CARD (MATCHING ADMIN REFERENCE MOCKUP) -->
          <tr>
            <td style="padding: 4px 28px 18px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1.5px solid #E2E8F0; border-radius: 16px; overflow: hidden; background-color: #FFFFFF;">
                
                <!-- Card Header -->
                <tr>
                  <td style="background-color: #FFFFFF; padding: 14px 18px; border-bottom: 1px solid #F1F5F9;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="36" valign="middle">
                          <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/header_user_green.png" width="30" height="30" alt="" style="display: block;">
                        </td>
                        <td valign="middle" style="padding-left: 8px;">
                          <div style="font-size: 15px; font-weight: 900; color: #0F172A;">Inquiry Details</div>
                          <div style="font-size: 11px; color: #64748B;">Here’s the information submitted by the user.</div>
                        </td>
                        <td valign="middle" align="right">
                          <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 800; color: #065F46; display: inline-block;">
                            Reference ID <strong style="color: #047857;">#${referenceId}</strong>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card Body (2 Columns) -->
                <tr>
                  <td style="padding: 18px 20px; background-color: #FFFFFF;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left Column: Name, Email, Phone, City, Inquiry Type -->
                        <td class="grid-col" valign="top" style="width: 48%; padding-right: 12px;">
                          
                          <!-- Name -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_user.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Name</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeName}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Email -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_email.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Email</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #0284C7; margin-top: 1px; word-break: break-all;">
                                  <a href="mailto:${safeEmail}" style="color: #0284C7; text-decoration: none;">${safeEmail}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Phone -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_phone.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Phone</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 1px;">
                                  <a href="tel:${safePhone}" style="color: #0F172A; text-decoration: none;">${safePhone}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- City / Location -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_location.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">City / Location</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeCity}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Inquiry Type -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_type.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Inquiry Type</div>
                                <div style="margin-top: 3px;">
                                  <span style="display: inline-block; background-color: #DCFCE7; color: #15803D; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 12px;">
                                    ${safeType}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </table>

                        </td>

                        <!-- Right Column: Subject, Message, Submitted On, Source -->
                        <td class="grid-col grid-col-right" valign="top" style="width: 52%; padding-left: 14px; border-left: 1px solid #F1F5F9;">
                          
                          <!-- Subject -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_subject.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Subject</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeSubject}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Message Bubble -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_message.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Message</div>
                                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; font-size: 11.5px; color: #334155; line-height: 1.45; margin-top: 3px;">
                                  ${safeMessage}
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Submitted On -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_calendar.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Submitted On</div>
                                <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-top: 1px;">${formattedDate}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Source -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_web.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Source</div>
                                <div style="font-size: 12px; font-weight: 700; color: #0F172A; margin-top: 1px;">Website (grillista.in)</div>
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

          <!-- 4. ACTION BUTTONS (3 ACTIONS: REPLY, WHATSAPP, FORWARD) -->
          <tr>
            <td style="padding: 0 28px 22px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Button 1: Reply to User -->
                  <td class="action-col" valign="top" style="width: 32%; padding-right: 6px;">
                    <a href="mailto:${safeEmail}?subject=Re:%20Grillista%20Inquiry%20%23${referenceId}" style="display: block; background-color: #064E3B; color: #FFFFFF; text-decoration: none; border-radius: 12px; padding: 10px 8px; text-align: center;">
                      <div style="font-size: 12px; font-weight: 900; color: #FFFFFF;">↩ Reply to User</div>
                      <div style="font-size: 9.5px; color: #A7F3D0; margin-top: 2px;">Send a response via email</div>
                    </a>
                  </td>

                  <!-- Button 2: Chat on WhatsApp -->
                  <td class="action-col" valign="top" style="width: 34%; padding: 0 3px;">
                    <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(name)},%20this%20is%20Grillista%20team%20regarding%20your%20inquiry%20%23${referenceId}." target="_blank" style="display: block; background-color: #10B981; color: #FFFFFF; text-decoration: none; border-radius: 12px; padding: 10px 8px; text-align: center;">
                      <div style="font-size: 12px; font-weight: 900; color: #FFFFFF;">💬 Chat on WhatsApp</div>
                      <div style="font-size: 9.5px; color: #ECFDF5; margin-top: 2px;">Open in WhatsApp</div>
                    </a>
                  </td>

                  <!-- Button 3: Assign to Team -->
                  <td class="action-col" valign="top" style="width: 34%; padding-left: 6px;">
                    <a href="mailto:${ADMIN_EMAIL}?subject=Fwd:%20Lead%20Assignment%20%23${referenceId}&body=Please%20assign%20this%20lead%20to%20team." style="display: block; background-color: #F1F5F9; border: 1px solid #CBD5E1; color: #1E293B; text-decoration: none; border-radius: 12px; padding: 10px 8px; text-align: center;">
                      <div style="font-size: 12px; font-weight: 900; color: #1E293B;">👥 Assign to Team</div>
                      <div style="font-size: 9.5px; color: #64748B; margin-top: 2px;">Forward to team member</div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 5. DARK FOREST GREEN PILLARS BANNER -->
          <tr>
            <td style="background-color: #052E16; padding: 14px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">🍂</span>
                    Great Taste<br><span style="color: #94A3B8; font-weight: 600;">Always</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">👥</span>
                    Stronger<br><span style="color: #94A3B8; font-weight: 600;">Communities</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">💛</span>
                    Positive<br><span style="color: #94A3B8; font-weight: 600;">Energy</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">🌿</span>
                    A Healthier<br><span style="color: #94A3B8; font-weight: 600;">Tomorrow</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 6. CORPORATE FOOTER -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 22px 28px 16px 28px; border-top: 1px solid #F1F5F9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Left Logo -->
                  <td class="footer-grid-col" valign="top" style="width: 22%; padding-right: 12px;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email-logo-clean.png" width="60" height="60" alt="Grillista" style="display: block; border-radius: 50%;">
                  </td>

                  <!-- Corporate Office -->
                  <td class="footer-grid-col" valign="top" style="width: 32%; padding-right: 10px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px;">📍 Corporate Office</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.4;">
                      Grillista Food Private Limited<br>
                      123, Food Street, Kakadeo,<br>
                      Kanpur, UP – 208025, India
                    </div>
                  </td>

                  <!-- Quick Links -->
                  <td class="footer-grid-col" valign="top" style="width: 22%; padding-right: 10px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px;">🔗 Quick Links</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.5;">
                      <a href="https://grillista.in" target="_blank" style="color: #64748B; text-decoration: none;">Website</a><br>
                      <a href="https://grillista.in/franchise.html" target="_blank" style="color: #64748B; text-decoration: none;">Franchise</a><br>
                      <a href="https://grillista.in/about.html" target="_blank" style="color: #64748B; text-decoration: none;">Contact</a>
                    </div>
                  </td>

                  <!-- Follow Us -->
                  <td class="footer-grid-col" valign="top" style="width: 24%;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 6px;">Follow Us</div>
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-right: 5px;">
                          <a href="https://www.instagram.com/grillista1" target="_blank"><img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/instagram.png" width="20" height="20" alt="Instagram"></a>
                        </td>
                        <td style="padding-right: 5px;">
                          <a href="https://www.facebook.com/share/1EGML5sM3N/" target="_blank"><img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/facebook.png" width="20" height="20" alt="Facebook"></a>
                        </td>
                        <td style="padding-right: 5px;">
                          <a href="https://linkedin.com" target="_blank"><img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/linkedin.png" width="20" height="20" alt="LinkedIn"></a>
                        </td>
                        <td>
                          <a href="https://youtube.com" target="_blank"><img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/youtube.png" width="20" height="20" alt="YouTube"></a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="height: 1px; background-color: #E2E8F0; margin: 16px 0 10px 0;"></div>

              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 10px; color: #94A3B8; font-weight: 600;">
                    © 2026 Grillista Food Private Limited. All Rights Reserved.
                  </td>
                  <td align="right" style="font-size: 10px; color: #065F46; font-weight: 800;">
                    🌱 Veg Vibes, Positive Energy
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;

  try {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: "🔔 New Inquiry — " + inquiryType + " | " + safeName + " (#" + referenceId + ")",
      htmlBody: htmlBody,
      name: "Grillista Alert System"
    });
  } catch (e) {
    Logger.log("Admin email dispatch failed: " + e.toString());
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
