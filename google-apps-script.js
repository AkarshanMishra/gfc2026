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
 * E: Investment Budget | F: Franchise Model | G: Previous Experience |
 * H: City | I: State | J: Message | K: Reference ID
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
    const budget = (rawData.budget || rawData.investmentBudget || "₹10 - 15 Lakhs").trim();
    const model = (rawData.model || rawData.inquiryType || "Grillista Express (Kiosk / Takeaway)").trim();
    const previousExperience = (rawData.previousExperience || rawData.experience || "First-time Entrepreneur / No Prior Experience").trim();
    const city = (rawData.city || rawData.preferredCity || "Kanpur").trim();
    const state = (rawData.state || "Uttar Pradesh").trim();
    const message = (rawData.message || rawData.notes || "N/A").trim();

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
        "Investment Budget",
        "Franchise Model",
        "Previous Experience",
        "City",
        "State",
        "Message",
        "Reference ID"
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#0F4C2A").setFontColor("#FFFFFF");
    }

    // Append submission row
    sheet.appendRow([
      new Date(),
      name,
      email,
      phone,
      budget,
      model,
      previousExperience,
      city,
      state,
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
          budget,
          model,
          previousExperience,
          city,
          state,
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
        budget,
        model,
        previousExperience,
        city,
        state,
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
 * Sends the flagship luxury branded HTML confirmation email to Customer matching exact reference mockup
 */
function sendCustomerEmail(
  name,
  email,
  phone,
  budget,
  model,
  previousExperience,
  city,
  state,
  message,
  referenceId
) {
  const firstName = escapeHtml((name || 'Valued Guest').trim().split(' ')[0]);
  const formattedDate = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "GMT+5:30",
    "dd MMM yyyy | hh:mm a"
  );

  const safeName = escapeHtml(name || 'Akash Mishra');
  const safePhone = escapeHtml(phone || '+91 98765 43210');
  const safeEmail = escapeHtml(email || 'akashmishra120799@gmail.com');
  const safeBudget = escapeHtml(budget || '₹10 - 15 Lakhs');
  const safeModel = escapeHtml(model || 'Grillista Express (Kiosk / Takeaway)');
  const safeExperience = escapeHtml(previousExperience || 'First-time Entrepreneur / No Prior Experience');
  const safeCity = escapeHtml(city || 'Kanpur');
  const safeState = escapeHtml(state || 'Uttar Pradesh');
  const safeMessage = escapeHtml(message || 'I would like to know more about opening a Grillista franchise outlet in my city.');

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received - Grillista</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F4F6F9; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .grid-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .grid-col-right { padding-top: 14px !important; border-left: none !important; border-top: 1px solid #E2E8F0 !important; }
      .footer-col { display: inline-block !important; width: 48% !important; margin-bottom: 12px !important; }
      .whatsapp-btn-cell { display: block !important; width: 100% !important; text-align: left !important; margin-top: 10px !important; }
      .sig-col { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 14px !important; }
      .footer-grid-col { display: block !important; width: 100% !important; margin-bottom: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #F4F6F9;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F4F6F9">
    <tr>
      <td align="center" style="padding: 10px;">
        
        <!-- Main Email Container -->
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 600px; max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid #E2E8F0;">
          
          <!-- 1. HERO BANNER WITH BRANDING & GRILLED PANEER BBQ DISH -->
          <tr>
            <td style="padding: 0; background-color: #FDFEFE;" align="center">
              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/customer_email_header.jpg" alt="Grillista - Good Food Brighter Tomorrow" width="600" style="width: 100%; max-width: 600px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- 2. STATUS BADGE & HEADLINE -->
          <tr>
            <td align="center" style="padding: 24px 24px 10px 24px;">
              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_check_badge.png" alt="Success" width="50" height="50" style="display: block; margin: 0 auto;" />
              <h1 style="margin: 12px 0 2px 0; font-size: 26px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Inquiry Received!</h1>
              <div style="font-size: 26px; font-weight: 900; color: #DC2626; letter-spacing: -0.5px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.1;">
                Thank You!
              </div>
              <div style="width: 75px; height: 3.5px; background-color: #FFC72C; border-radius: 2px; margin: 6px auto 16px auto;"></div>
            </td>
          </tr>

          <!-- 3. SALUTATION & GREETING -->
          <tr>
            <td style="padding: 0 28px 16px 28px; color: #334155; font-size: 13.5px; line-height: 1.6; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 800; color: #0F172A;">Hi ${firstName},</p>
              <p style="margin: 0;">
                Thank you for reaching out to <strong>Grillista — The Ultimate Food Chain</strong>. We're pleased to confirm that we've successfully received your franchise inquiry. Our expansion team will get back to you within <strong>24 business hours</strong>.
              </p>
            </td>
          </tr>

          <!-- 4. YOUR INQUIRY DETAILS CARD (MATCHING REQUESTED 9 FIELDS) -->
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
                          <div style="font-size: 15px; font-weight: 900; color: #0F172A;">Your Inquiry Details</div>
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
                        <!-- Left Column: Name, Email, Phone, City, State -->
                        <td class="grid-col" valign="top" style="width: 48%; padding-right: 12px;">
                          
                          <!-- Name -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_user.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Full Name</div>
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
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Email Address</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #0284C7; margin-top: 1px; word-break: break-all;">
                                  <a href="mailto:${safeEmail}" style="color: #0284C7; text-decoration: none;">${safeEmail}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Phone No -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_phone.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Phone No</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 1px;">
                                  <a href="tel:${safePhone}" style="color: #0F172A; text-decoration: none;">${safePhone}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- City -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_location.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">City</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeCity}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- State -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_state.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">State</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeState}</div>
                              </td>
                            </tr>
                          </table>

                        </td>

                        <!-- Right Column: Budget, Model, Previous Experience, Message, Submitted On -->
                        <td class="grid-col grid-col-right" valign="top" style="width: 52%; padding-left: 14px; border-left: 1px solid #F1F5F9;">
                          
                          <!-- Budget -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_budget.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Investment Budget</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #065F46; margin-top: 1px;">${safeBudget}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Franchise Model -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_model.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Franchise Model</div>
                                <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeModel}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Previous Experience -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_experience.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Previous Experience</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #334155; margin-top: 1px;">${safeExperience}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Message Bubble -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
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
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
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
            <td style="padding: 0 28px 22px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #EAF8EE; border: 1.5px solid #C4ECD2; border-radius: 14px; padding: 12px 16px;">
                <tr>
                  <td width="38" valign="middle">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/whatsapp.png" width="34" height="34" alt="WhatsApp" style="display: block; border-radius: 50%; border: none;">
                  </td>
                  <td valign="middle" style="padding-left: 10px;">
                    <div style="font-size: 13.5px; font-weight: 900; color: #065F46; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Need Immediate Assistance?</div>
                    <div style="font-size: 12px; color: #047857; margin-top: 2px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Chat with us on WhatsApp for a faster response.</div>
                  </td>
                  <td class="whatsapp-btn-cell" valign="middle" align="right">
                    <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Grillista,%20I%20have%20an%20inquiry%20reference%20%23${referenceId}" target="_blank" style="background-color: #065F46; color: #FFFFFF; text-decoration: none; padding: 10px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-block; white-space: nowrap; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      Chat on WhatsApp →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 6. THREE-COLUMN LUXURY SIGNATURE (MATCHING REFERENCE MOCKUP) -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Left Script Graphic -->
                  <td class="sig-col" valign="middle" style="width: 26%; text-align: left;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_sig_greener.png" alt="Together for a Greener & Healthier Tomorrow" width="115" style="display: block; max-width: 115px; height: auto;">
                  </td>

                  <!-- Center Text -->
                  <td class="sig-col" valign="middle" style="width: 48%; text-align: center; padding: 0 10px;">
                    <div style="color: #334155; font-size: 12.5px; line-height: 1.5; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      Thank you for choosing <strong>Grillista</strong>.<br>
                      We look forward to being a part of your journey.
                    </div>
                    <div style="margin-top: 8px; font-size: 9.5px; font-weight: 900; color: #475569; letter-spacing: 1.5px; text-transform: uppercase;">
                      ❤️ VEG VIBES, POSITIVE ENERGY
                    </div>
                  </td>

                  <!-- Right Script Graphic -->
                  <td class="sig-col" valign="middle" style="width: 26%; text-align: right;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_sig_happy_people.png" alt="Good Food Happy People" width="105" style="display: block; max-width: 105px; height: auto; margin-left: auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 7. DARK FOREST GREEN PILLARS BANNER -->
          <tr>
            <td style="background-color: #052E16; padding: 14px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 3px;">✦</span>
                    Great Taste<br><span style="color: #94A3B8; font-weight: 600;">Always</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 3px;">✦</span>
                    Stronger<br><span style="color: #94A3B8; font-weight: 600;">Communities</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 3px;">✦</span>
                    Positive<br><span style="color: #94A3B8; font-weight: 600;">Energy</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 3px;">✦</span>
                    A Healthier<br><span style="color: #94A3B8; font-weight: 600;">Tomorrow</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 8. CORPORATE FOOTER WITH SOCIALS & QUICK LINKS -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 22px 28px 16px 28px; border-top: 1px solid #F1F5F9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Left Logo -->
                  <td class="footer-grid-col" valign="top" style="width: 22%; padding-right: 12px;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email-logo-clean.png" width="60" height="60" alt="Grillista" style="display: block; border-radius: 50%;">
                  </td>

                  <!-- Corporate Office -->
                  <td class="footer-grid-col" valign="top" style="width: 30%; padding-right: 10px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Corporate Office</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.4; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      Grillista Food Private Limited<br>
                      123, Food Street, Kakadeo,<br>
                      Kanpur, UP – 208025, India
                    </div>
                  </td>

                  <!-- Follow Us (Instagram, Facebook, Pinterest, YouTube) -->
                  <td class="footer-grid-col" valign="top" style="width: 26%; padding-right: 8px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 6px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Follow Us</div>
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-right: 5px;">
                          <a href="https://www.instagram.com/grillista1" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/instagram.png" width="22" height="22" alt="Instagram" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td style="padding-right: 5px;">
                          <a href="https://www.facebook.com/share/1EGML5sM3N/" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/facebook.png" width="22" height="22" alt="Facebook" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td style="padding-right: 5px;">
                          <a href="https://pin.it/1bi0APK1A" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/pinterest.png" width="22" height="22" alt="Pinterest" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td>
                          <a href="https://youtube.com" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/youtube.png" width="22" height="22" alt="YouTube" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Quick Links -->
                  <td class="footer-grid-col" valign="top" style="width: 22%;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Quick Links</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.5; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      <a href="https://grillista.in" target="_blank" style="color: #64748B; text-decoration: none;">Website</a><br>
                      <a href="https://grillista.in/franchise.html" target="_blank" style="color: #64748B; text-decoration: none;">Franchise</a><br>
                      <a href="https://grillista.in/about.html" target="_blank" style="color: #64748B; text-decoration: none;">Contact</a><br>
                      <a href="https://grillista.in/join-us.html" target="_blank" style="color: #64748B; text-decoration: none;">Careers</a>
                    </div>
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
  budget,
  model,
  previousExperience,
  city,
  state,
  message,
  referenceId
) {
  const formattedDate = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "GMT+5:30",
    "dd MMM yyyy | hh:mm a"
  );

  const safeName = escapeHtml(name || "Akash Mishra");
  const safeEmail = escapeHtml(email || "support@grillista.in");
  const safePhone = escapeHtml(phone || "+91 98765 43210");
  const safeBudget = escapeHtml(budget || "₹10 - 15 Lakhs");
  const safeModel = escapeHtml(model || "Grillista Express (Kiosk / Takeaway)");
  const safeExperience = escapeHtml(previousExperience || "First-time Entrepreneur / No Prior Experience");
  const safeCity = escapeHtml(city || "Kanpur");
  const safeState = escapeHtml(state || "Uttar Pradesh");
  const safeMessage = escapeHtml(message || "I would like to know more about opening a Grillista franchise outlet in my city.");
  
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
                  <td valign="top" style="width: 60%; padding-right: 14px;">
                    <table border="0" cellspacing="0" cellpadding="0" style="background-color: #DC2626; border-radius: 20px; margin-bottom: 12px;">
                      <tr>
                        <td style="padding: 5px 12px; font-size: 10.5px; font-weight: 900; color: #FFFFFF; font-family: 'Segoe UI', Roboto, Arial, sans-serif; letter-spacing: 0.5px; text-transform: uppercase;">
                          <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/icon_bell_white.png" width="12" height="12" alt="" style="display: inline-block; vertical-align: middle; margin-right: 4px; margin-top: -2px;">
                          NEW INQUIRY ALERT
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 28px; font-weight: 900; color: #0F172A; line-height: 1.15; letter-spacing: -0.5px;">
                      You’ve Got a<br><span style="color: #DC2626;">New Inquiry!</span>
                    </div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 10px;">
                      A new franchise application has been submitted through the Grillista website. Please find the details below and take the necessary action.
                    </div>
                  </td>

                  <!-- Right Side Mini Highlight Card -->
                  <td class="stats-col" valign="top" style="width: 40%;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; border: 1.5px solid #DCFCE7; border-radius: 14px; padding: 14px;">
                      <tr>
                        <td>
                          <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 4px;">
                            <tr>
                              <td width="22" valign="middle">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/icon_chart_bars.png" width="18" height="18" alt="" style="display: block;">
                              </td>
                              <td valign="middle" style="padding-left: 6px;">
                                <div style="font-size: 13px; font-weight: 900; color: #065F46; line-height: 1.2; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                                  Let’s Create<br>a Healthier Tomorrow
                                </div>
                              </td>
                            </tr>
                          </table>
                          <div style="width: 38px; height: 3px; background-color: #FFC72C; border-radius: 2px; margin-top: 4px; margin-bottom: 10px;"></div>
                          
                          <!-- Checklist item 1 -->
                          <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 6px;">
                            <tr>
                              <td width="18" valign="middle">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/check_circle_green.png" width="14" height="14" alt="" style="display: block;">
                              </td>
                              <td valign="middle" style="padding-left: 6px; font-size: 11.5px; color: #065F46; font-weight: 700; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                                More People
                              </td>
                            </tr>
                          </table>

                          <!-- Checklist item 2 -->
                          <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 6px;">
                            <tr>
                              <td width="18" valign="middle">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/check_circle_green.png" width="14" height="14" alt="" style="display: block;">
                              </td>
                              <td valign="middle" style="padding-left: 6px; font-size: 11.5px; color: #065F46; font-weight: 700; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                                More Flavours
                              </td>
                            </tr>
                          </table>

                          <!-- Checklist item 3 -->
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="18" valign="middle">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/check_circle_green.png" width="14" height="14" alt="" style="display: block;">
                              </td>
                              <td valign="middle" style="padding-left: 6px; font-size: 11.5px; color: #065F46; font-weight: 700; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                                A Brighter Tomorrow
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

          <!-- 3. INQUIRY DETAILS CARD (MATCHING ADMIN REFERENCE MOCKUP & 9 FIELDS) -->
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
                        <!-- Left Column: Name, Email, Phone, City, State -->
                        <td class="grid-col" valign="top" style="width: 48%; padding-right: 12px;">
                          
                          <!-- Name -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_user.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Full Name</div>
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
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Email Address</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #0284C7; margin-top: 1px; word-break: break-all;">
                                  <a href="mailto:${safeEmail}" style="color: #0284C7; text-decoration: none;">${safeEmail}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Phone No -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_phone.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Phone No</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 1px;">
                                  <a href="tel:${safePhone}" style="color: #0F172A; text-decoration: none;">${safePhone}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- City -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_location.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">City</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeCity}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- State -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_state.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">State</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeState}</div>
                              </td>
                            </tr>
                          </table>

                        </td>

                        <!-- Right Column: Budget, Model, Previous Experience, Message, Submitted On -->
                        <td class="grid-col grid-col-right" valign="top" style="width: 52%; padding-left: 14px; border-left: 1px solid #F1F5F9;">
                          
                          <!-- Budget -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_budget.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Investment Budget</div>
                                <div style="font-size: 12.5px; font-weight: 800; color: #065F46; margin-top: 1px;">${safeBudget}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Franchise Model -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_model.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Franchise Model</div>
                                <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin-top: 1px;">${safeModel}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Previous Experience -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_experience.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 6px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase;">Previous Experience</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #334155; margin-top: 1px;">${safeExperience}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Message Bubble -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
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
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
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

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- 4. QUICK ACTION BUTTONS (REPLY & WHATSAPP) -->
          <tr>
            <td style="padding: 0 28px 22px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="action-col" style="width: 48%; padding-right: 6px;">
                    <a href="mailto:${safeEmail}?subject=Re:%20Grillista%20Franchise%20Inquiry%20%23${referenceId}" style="background-color: #065F46; color: #FFFFFF; text-decoration: none; padding: 12px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; display: block; text-align: center; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/icon_reply_white.png" width="12" height="12" alt="" style="display: inline-block; vertical-align: middle; margin-right: 4px; margin-top: -2px;">
                      Reply to ${safeName.split(' ')[0]} →
                    </a>
                  </td>
                  <td class="action-col" style="width: 48%; padding-left: 6px;">
                    <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(safeName)},%20thank%20you%20for%20reaching%20out%20to%20Grillista%20regarding%20the%20franchise%20opportunity%20%23${referenceId}." target="_blank" style="background-color: #10B981; color: #FFFFFF; text-decoration: none; padding: 12px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; display: block; text-align: center; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/whatsapp.png" width="14" height="14" alt="" style="display: inline-block; vertical-align: middle; margin-right: 4px; margin-top: -2px;">
                      Chat on WhatsApp →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 5. SIGNATURE & INTERNAL ACTION NOTE -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border-radius: 12px; padding: 12px 16px; border: 1px solid #E2E8F0;">
                <tr>
                  <td width="30" valign="top">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/icon_team_dark.png" width="22" height="22" alt="" style="display: block;">
                  </td>
                  <td valign="top" style="padding-left: 8px; font-size: 11.5px; color: #475569; line-height: 1.5; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <strong style="color: #0F172A;">Action Required:</strong> Please contact this prospective partner within 24 hours to schedule an introductory franchise discovery call.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 6. DARK FOREST GREEN PILLARS BANNER -->
          <tr>
            <td style="background-color: #052E16; padding: 14px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 3px;">✦</span>
                    Great Taste<br><span style="color: #94A3B8; font-weight: 600;">Always</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 3px;">✦</span>
                    Stronger<br><span style="color: #94A3B8; font-weight: 600;">Communities</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 3px;">✦</span>
                    Positive<br><span style="color: #94A3B8; font-weight: 600;">Energy</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 3px;">✦</span>
                    A Healthier<br><span style="color: #94A3B8; font-weight: 600;">Tomorrow</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 7. CORPORATE FOOTER WITH SOCIALS & QUICK LINKS -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 22px 28px 16px 28px; border-top: 1px solid #F1F5F9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Left Logo -->
                  <td class="footer-grid-col" valign="top" style="width: 22%; padding-right: 12px;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email-logo-clean.png" width="60" height="60" alt="Grillista" style="display: block; border-radius: 50%;">
                  </td>

                  <!-- Corporate Office -->
                  <td class="footer-grid-col" valign="top" style="width: 30%; padding-right: 10px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Corporate Office</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.4; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      Grillista Food Private Limited<br>
                      123, Food Street, Kakadeo,<br>
                      Kanpur, UP – 208025, India
                    </div>
                  </td>

                  <!-- Follow Us (Instagram, Facebook, Pinterest, YouTube) -->
                  <td class="footer-grid-col" valign="top" style="width: 26%; padding-right: 8px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 6px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Follow Us</div>
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-right: 5px;">
                          <a href="https://www.instagram.com/grillista1" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/instagram.png" width="22" height="22" alt="Instagram" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td style="padding-right: 5px;">
                          <a href="https://www.facebook.com/share/1EGML5sM3N/" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/facebook.png" width="22" height="22" alt="Facebook" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td style="padding-right: 5px;">
                          <a href="https://pin.it/1bi0APK1A" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/pinterest.png" width="22" height="22" alt="Pinterest" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td>
                          <a href="https://youtube.com" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/youtube.png" width="22" height="22" alt="YouTube" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Quick Links -->
                  <td class="footer-grid-col" valign="top" style="width: 22%;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">Quick Links</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.5; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                      <a href="https://grillista.in" target="_blank" style="color: #64748B; text-decoration: none;">Website</a><br>
                      <a href="https://grillista.in/franchise.html" target="_blank" style="color: #64748B; text-decoration: none;">Franchise</a><br>
                      <a href="https://grillista.in/about.html" target="_blank" style="color: #64748B; text-decoration: none;">Contact</a><br>
                      <a href="https://grillista.in/join-us.html" target="_blank" style="color: #64748B; text-decoration: none;">Careers</a>
                    </div>
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

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: "🚨 [New Franchise Lead] " + safeName + " (" + safeCity + ", " + safeState + ") | #" + referenceId,
    htmlBody: htmlBody,
    name: "Grillista Web System"
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
