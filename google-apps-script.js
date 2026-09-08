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
          
          <!-- 1. HERO BANNER WITH BURGER & BRANDING -->
          <tr>
            <td style="background-color: #0B0E14; padding: 0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #090C12 0%, #161C28 100%);">
                <tr>
                  <td style="padding: 24px 28px 18px 28px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left Brand Logo Emblem & Tagline -->
                        <td valign="middle" style="width: 58%;">
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td valign="middle" style="padding-right: 14px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email-logo.png" alt="Grillista Logo" width="70" height="70" style="width: 70px; height: 70px; border-radius: 50%; object-fit: contain; display: block; border: 2px solid #FFC72C; background-color: #000000;" />
                              </td>
                              <td valign="middle">
                                <div style="color: #FFFFFF; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; line-height: 1.1;">
                                  GRILLISTA
                                </div>
                                <div style="font-size: 9px; font-weight: 800; color: #FFC72C; letter-spacing: 1.2px; margin-top: 2px;">THE ULTIMATE FOOD CHAIN</div>
                                <div style="font-size: 8.5px; font-weight: 700; color: #E2E8F0; letter-spacing: 0.8px; margin-top: 2px;">Veg Vibes, Positive Energy</div>
                              </td>
                            </tr>
                          </table>
                          <div style="margin-top: 10px; font-size: 9.5px; font-weight: 800; color: #94A3B8; letter-spacing: 2px; line-height: 1.4;">
                            GOOD FOOD &bull; BRIGHTER TOMORROW
                          </div>
                        </td>
                        <!-- Right "More Than Food" Script -->
                        <td valign="middle" align="right" style="width: 42%;">
                          <div style="font-family: 'Caveat', cursive, serif; font-size: 24px; font-weight: 700; color: #FFFFFF; line-height: 1; text-align: right;">
                            More<br>Than Food
                          </div>
                          <div style="width: 65px; height: 3px; background-color: #FFC72C; border-radius: 2px; margin-top: 4px; margin-left: auto;"></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Hero Dish Image Row -->
                <tr>
                  <td align="center" style="padding: 0 0 10px 0;">
                    <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80" alt="Grillista Gourmet Burger" width="600" style="width: 100%; max-width: 600px; height: 210px; object-fit: cover; display: block;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. STATUS BADGE & HEADLINE -->
          <tr>
            <td align="center" style="padding: 28px 30px 10px 30px;">
              <!-- Green Checkmark Circle -->
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="width: 56px; height: 56px; background-color: #16A34A; border-radius: 50%; text-align: center; line-height: 56px; color: #FFFFFF; font-size: 28px; font-weight: 900; box-shadow: 0 6px 20px rgba(22, 163, 74, 0.35);">
                      ✓
                    </div>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 14px 0 2px 0; font-size: 28px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px;">Inquiry Received!</h1>
              <h2 style="margin: 0 0 20px 0; font-size: 26px; font-weight: 900; color: #F59E0B; letter-spacing: -0.5px;">Thank You!</h2>
            </td>
          </tr>

          <!-- 3. SALUTATION & GREETING -->
          <tr>
            <td style="padding: 0 34px 16px 34px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 800; color: #0F172A;">Hi ${firstName},</p>
              <p style="margin: 0;">
                Thank you for reaching out to <strong>Grillista — The Ultimate Food Chain</strong>. We're pleased to confirm that we've successfully received your inquiry. Our team is reviewing your request and will get back to you within <strong>24 business hours</strong>.
              </p>
            </td>
          </tr>

          <!-- 4. YOUR INQUIRY DETAILS CARD (MATCHING REFERENCE MOCKUP) -->
          <tr>
            <td style="padding: 6px 34px 20px 34px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1.5px solid #FDE68A; border-radius: 14px; overflow: hidden; background-color: #FFFDF5;">
                
                <!-- Card Header -->
                <tr>
                  <td style="background-color: #FEF3C7; padding: 12px 18px; border-bottom: 1px solid #FDE68A;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td valign="middle" style="font-size: 15px; font-weight: 900; color: #1E293B;">
                          Your Inquiry Details
                        </td>
                        <td valign="middle" align="right" style="font-size: 11px; color: #78350F; line-height: 1.35;">
                          <strong style="color: #1E293B;">Reference ID: #${referenceId}</strong><br>
                          <span style="color: #92400E;">${formattedDate}</span>
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
                        <!-- Left Column: Name, Email, Phone -->
                        <td class="grid-col" valign="top" style="width: 50%; padding-right: 12px;">
                          
                          <!-- Field 1: Name -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                            <tr>
                              <td width="28" valign="top" style="font-size: 16px;">👤</td>
                              <td valign="top">
                                <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase;">Name</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeName}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Field 2: Email -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                            <tr>
                              <td width="28" valign="top" style="font-size: 16px;">✉️</td>
                              <td valign="top">
                                <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase;">Email</div>
                                <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-top: 1px; word-break: break-all;">${safeEmail}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Field 3: Phone -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="28" valign="top" style="font-size: 16px;">📞</td>
                              <td valign="top">
                                <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase;">Phone</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safePhone}</div>
                              </td>
                            </tr>
                          </table>

                        </td>

                        <!-- Right Column: Inquiry Type, Subject, Message -->
                        <td class="grid-col grid-col-right" valign="top" style="width: 50%; padding-left: 12px; border-left: 1px solid #F1F5F9;">
                          
                          <!-- Field 4: Inquiry Type -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                            <tr>
                              <td width="28" valign="top" style="font-size: 16px;">💬</td>
                              <td valign="top">
                                <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase;">Inquiry Type</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeType}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Field 5: Subject -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                            <tr>
                              <td width="28" valign="top" style="font-size: 16px;">📄</td>
                              <td valign="top">
                                <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase;">Subject</div>
                                <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-top: 1px;">${safeSubject}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Field 6: Message -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="28" valign="top" style="font-size: 16px;">📝</td>
                              <td valign="top">
                                <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase;">Message</div>
                                <div style="font-size: 12px; font-style: italic; color: #334155; margin-top: 1px; line-height: 1.4;">${safeMessage}</div>
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
            <td style="padding: 0 34px 22px 34px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 14px 18px;">
                <tr>
                  <td width="38" valign="middle">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/whatsapp.png" width="34" height="34" alt="WhatsApp" style="display: block; border-radius: 50%; border: none;">
                  </td>
                  <td valign="middle" style="padding-left: 10px;">
                    <div style="font-size: 13px; font-weight: 800; color: #065F46; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Need Immediate Assistance?</div>
                    <div style="font-size: 12px; color: #047857; margin-top: 2px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Chat with us on WhatsApp for a faster response.</div>
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
            <td style="padding: 0 34px 26px 34px;">
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 13px; line-height: 1.6; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                Thank you for choosing Grillista.<br>
                We look forward to being a part of your journey.
              </p>

              <!-- Signature Block -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="top">
                    <div style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 23px; font-weight: 700; font-style: italic; color: #0F4C2A; line-height: 1.2; letter-spacing: -0.2px;">
                      Good Food, Brighter Tomorrow
                    </div>
                    <div style="width: 44px; height: 3px; background-color: #FFC72C; border-radius: 2px; margin-top: 6px; margin-bottom: 12px;"></div>
                    
                    <div style="font-size: 14px; font-weight: 800; color: #0F172A; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Team Grillista</div>
                    <div style="font-size: 12px; color: #64748B; font-weight: 600; margin-top: 2px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">The Ultimate Food Chain</div>

                    <!-- Social Icons Row with High-DPI PNGs -->
                    <div style="margin-top: 14px;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding-right: 8px;" valign="middle">
                            <a href="https://www.instagram.com/grillista1" target="_blank" style="text-decoration: none; display: inline-block;">
                              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/instagram.png" width="24" height="24" alt="Instagram" style="display: block; border-radius: 50%; border: none;">
                            </a>
                          </td>
                          <td style="padding-right: 8px;" valign="middle">
                            <a href="https://www.facebook.com/share/1EGML5sM3N/" target="_blank" style="text-decoration: none; display: inline-block;">
                              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/facebook.png" width="24" height="24" alt="Facebook" style="display: block; border-radius: 50%; border: none;">
                            </a>
                          </td>
                          <td style="padding-right: 8px;" valign="middle">
                            <a href="https://linkedin.com" target="_blank" style="text-decoration: none; display: inline-block;">
                              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/linkedin.png" width="24" height="24" alt="LinkedIn" style="display: block; border-radius: 50%; border: none;">
                            </a>
                          </td>
                          <td style="padding-right: 12px;" valign="middle">
                            <a href="https://youtube.com" target="_blank" style="text-decoration: none; display: inline-block;">
                              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/youtube.png" width="24" height="24" alt="YouTube" style="display: block; border-radius: 50%; border: none;">
                            </a>
                          </td>
                          <td style="border-left: 1.5px solid #CBD5E1; padding-left: 10px; font-size: 11px; font-weight: 800; color: #64748B; font-family: 'Segoe UI', Roboto, Arial, sans-serif; white-space: nowrap;" valign="middle">
                            Follow Our Journey
                          </td>
                        </tr>
                      </table>
                    </div>
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
