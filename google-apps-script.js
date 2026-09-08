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
const BASE_WEBSITE_URL = "https://akarshanmishra.github.io/gfc2026"; // Or https://grillista.in

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

    // Strip any inherited "People chip" / invalid data validation rules & force plain text format
    try {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(lastRow, 1, 1, 11).clearDataValidations();
        sheet.getRange(lastRow, 3).setNumberFormat("@"); // Email as standard string
        sheet.getRange(lastRow, 4).setNumberFormat("@"); // Phone as standard string
      }
    } catch(valErr) {
      Logger.log("Validation clear notice: " + valErr.toString());
    }

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
 * Helper to build the 1-click printable receipt URL
 */
function buildReceiptUrl(name, email, phone, budget, model, experience, city, state, message, ref) {
  return BASE_WEBSITE_URL + "/receipt.html?" +
    "ref=" + encodeURIComponent(ref) +
    "&name=" + encodeURIComponent(name) +
    "&email=" + encodeURIComponent(email) +
    "&phone=" + encodeURIComponent(phone) +
    "&budget=" + encodeURIComponent(budget) +
    "&model=" + encodeURIComponent(model) +
    "&experience=" + encodeURIComponent(experience) +
    "&city=" + encodeURIComponent(city) +
    "&state=" + encodeURIComponent(state) +
    "&message=" + encodeURIComponent(message) +
    "&auto=pdf";
}

/**
 * ==============================================================================
 * 1. FLAGSHIP ULTRA-PREMIUM CUSTOMER CONFIRMATION EMAIL
 * ==============================================================================
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

  const receiptUrl = buildReceiptUrl(safeName, safeEmail, safePhone, safeBudget, safeModel, safeExperience, safeCity, safeState, safeMessage, referenceId);

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Confirmation — Grillista</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-wrapper { width: 100% !important; padding: 10px 4px !important; }
      .email-container { width: 100% !important; border-radius: 16px !important; }
      .grid-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .grid-col-right { padding-top: 16px !important; border-left: none !important; border-top: 1px solid #E2E8F0 !important; }
      .step-col { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
      .sig-col { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 14px !important; }
      .whatsapp-btn-cell { display: block !important; width: 100% !important; text-align: left !important; margin-top: 12px !important; }
      .download-btn-cell { display: block !important; width: 100% !important; text-align: left !important; margin-top: 10px !important; }
      .footer-grid-col { display: block !important; width: 100% !important; margin-bottom: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F1F5F9;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F1F5F9" class="email-wrapper">
    <tr>
      <td align="center" style="padding: 0 10px;">
        
        <!-- Main Email Container -->
        <table class="email-container" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 600px; max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- TOP LUXURY PREHEADER BAR -->
          <tr>
            <td style="background-color: #062814; padding: 8px 24px; text-align: center;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 10px; font-weight: 800; color: #86EFAC; letter-spacing: 1.5px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ✦ OFFICIAL FRANCHISE EXPANSION CONFIRMATION ✦
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 1. HERO BANNER WITH BRANDING & GRILLED PANEER BBQ DISH -->
          <tr>
            <td style="padding: 0; background-color: #FDFEFE;" align="center">
              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/customer_email_header.jpg" alt="Grillista - Good Food Brighter Tomorrow" width="600" style="width: 100%; max-width: 600px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- 2. STATUS BADGE & HEADLINE -->
          <tr>
            <td align="center" style="padding: 26px 28px 10px 28px;">
              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_check_badge.png" alt="Success" width="52" height="52" style="display: block; margin: 0 auto;" />
              <h1 style="margin: 14px 0 2px 0; font-size: 26px; font-weight: 900; color: #0F172A; letter-spacing: -0.5px; line-height: 1.2;">
                Inquiry Received!
              </h1>
              <div style="font-size: 26px; font-weight: 900; color: #DC2626; letter-spacing: -0.5px; line-height: 1.1;">
                Thank You, ${firstName}!
              </div>
              <div style="width: 70px; height: 3.5px; background-color: #FFC72C; border-radius: 2px; margin: 8px auto 16px auto;"></div>
            </td>
          </tr>

          <!-- 3. SALUTATION & GREETING -->
          <tr>
            <td style="padding: 0 32px 18px 32px; color: #334155; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 10px 0; font-size: 15.5px; font-weight: 800; color: #0F172A;">Dear ${firstName},</p>
              <p style="margin: 0;">
                Thank you for your interest in partnering with <strong>Grillista — The Ultimate Food Chain</strong>. We have successfully registered your inquiry in our system. Our franchise expansion team is reviewing your location and territory requirements and will reach out to you within <strong>24 business hours</strong>.
              </p>
            </td>
          </tr>

          <!-- 4. YOUR INQUIRY DETAILS CARD (MASTER 9-FIELD DISPLAY) -->
          <tr>
            <td style="padding: 4px 30px 16px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1.5px solid #E2E8F0; border-radius: 18px; overflow: hidden; background-color: #FFFFFF; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
                
                <!-- Card Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #062814 0%, #0F4C2A 100%); background-color: #062814; padding: 14px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="34" valign="middle">
                          <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/header_user_green.png" width="28" height="28" alt="" style="display: block;">
                        </td>
                        <td valign="middle" style="padding-left: 10px;">
                          <div style="font-size: 14.5px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.3px;">Your Application Summary</div>
                          <div style="font-size: 11px; color: #A7F3D0; font-weight: 600;">Confidential Record</div>
                        </td>
                        <td valign="middle" align="right">
                          <div style="background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 5px 12px; font-size: 11px; font-weight: 800; color: #FFFFFF; display: inline-block;">
                            Ref <strong style="color: #FFC72C;">#${referenceId}</strong>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card Body (2 Columns) -->
                <tr>
                  <td style="padding: 20px 22px; background-color: #FFFFFF;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left Column: Name, Email, Phone, City, State -->
                        <td class="grid-col" valign="top" style="width: 48%; padding-right: 14px;">
                          
                          <!-- Name -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 13px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_user.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</div>
                                <div style="font-size: 13.5px; font-weight: 800; color: #0F172A; margin-top: 2px;">${safeName}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Email -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 13px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_email.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</div>
                                <div style="font-size: 12px; font-weight: 700; color: #0284C7; margin-top: 2px; word-break: break-all;">
                                  <a href="mailto:${safeEmail}" style="color: #0284C7; text-decoration: none;">${safeEmail}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Phone No -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 13px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_phone.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 2px;">
                                  <a href="tel:${safePhone}" style="color: #0F172A; text-decoration: none;">${safePhone}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- City & State -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_location.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Target Location</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 2px;">
                                  ${safeCity}, <span style="color: #64748B; font-weight: 700;">${safeState}</span>
                                </div>
                              </td>
                            </tr>
                          </table>

                        </td>

                        <!-- Right Column: Budget, Model, Previous Experience, Submitted On -->
                        <td class="grid-col grid-col-right" valign="top" style="width: 52%; padding-left: 16px; border-left: 1px solid #F1F5F9;">
                          
                          <!-- Budget -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_budget.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Investment Budget</div>
                                <div style="margin-top: 3px;">
                                  <span style="display: inline-block; background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; font-size: 11.5px; font-weight: 800; padding: 3px 9px; border-radius: 6px;">
                                    💰 ${safeBudget}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Franchise Model -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_model.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Franchise Model</div>
                                <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin-top: 2px;">
                                  ${safeModel}
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Previous Experience -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_experience.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Previous Experience</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #334155; margin-top: 2px;">
                                  ${safeExperience}
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
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Submitted On</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #0F172A; margin-top: 2px;">${formattedDate}</div>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <!-- Full-Width Message Callout Box -->
                    <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #F1F5F9;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="22" valign="top" style="padding-top: 2px;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_message.png" width="16" height="16" alt="" style="display: block;">
                          </td>
                          <td valign="top" style="padding-left: 8px;">
                            <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Your Message / Notes</div>
                            <div style="background-color: #F8FAFC; border-left: 3.5px solid #0F4C2A; border-radius: 0 8px 8px 0; padding: 10px 14px; font-size: 12px; color: #334155; line-height: 1.5; margin-top: 6px; font-style: italic;">
                              “${safeMessage}”
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>

                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- 5. DOWNLOAD APPLICATION DOCKET IN PDF / JPG BANNER -->
          <tr>
            <td style="padding: 0 30px 18px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; border: 1.5px dashed #86EFAC; border-radius: 14px; padding: 12px 16px;">
                <tr>
                  <td valign="middle" style="padding-right: 10px;">
                    <div style="font-size: 12.5px; font-weight: 800; color: #065F46;">
                      📄 Need an Official Copy of Your Application?
                    </div>
                    <div style="font-size: 11px; color: #047857; margin-top: 2px;">
                      Download or print your authenticated application docket in PDF / JPG.
                    </div>
                  </td>
                  <td class="download-btn-cell" valign="middle" align="right" style="white-space: nowrap;">
                    <a href="${receiptUrl}" target="_blank" style="background-color: #065F46; color: #FFFFFF; text-decoration: none; padding: 9px 16px; border-radius: 10px; font-size: 11.5px; font-weight: 800; display: inline-block; box-shadow: 0 3px 8px rgba(6,95,70,0.25);">
                      📥 Download PDF / JPG →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 6. THREE-STEP NEXT STEPS ROADMAP -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px 18px;">
                <tr>
                  <td colspan="3" style="padding-bottom: 12px;">
                    <div style="font-size: 12px; font-weight: 900; color: #0F172A; text-transform: uppercase; letter-spacing: 0.8px;">
                      ⚡ What Happens Next?
                    </div>
                  </td>
                </tr>
                <tr>
                  <!-- Step 1 -->
                  <td class="step-col" valign="top" style="width: 33.33%; padding-right: 10px;">
                    <div style="background-color: #ECFDF5; color: #047857; font-weight: 900; font-size: 10.5px; padding: 3px 8px; border-radius: 6px; display: inline-block; margin-bottom: 5px;">STEP 1</div>
                    <div style="font-size: 11.5px; font-weight: 800; color: #0F172A;">Profile Review</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.4; margin-top: 2px;">Territory assessment &amp; market feasibility.</div>
                  </td>
                  <!-- Step 2 -->
                  <td class="step-col" valign="top" style="width: 33.33%; padding-right: 10px;">
                    <div style="background-color: #FEF3C7; color: #B45309; font-weight: 900; font-size: 10.5px; padding: 3px 8px; border-radius: 6px; display: inline-block; margin-bottom: 5px;">STEP 2</div>
                    <div style="font-size: 11.5px; font-weight: 800; color: #0F172A;">Discovery Call</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.4; margin-top: 2px;">1-on-1 discussion with Expansion Head.</div>
                  </td>
                  <!-- Step 3 -->
                  <td class="step-col" valign="top" style="width: 33.33%;">
                    <div style="background-color: #EFF6FF; color: #1D4ED8; font-weight: 900; font-size: 10.5px; padding: 3px 8px; border-radius: 6px; display: inline-block; margin-bottom: 5px;">STEP 3</div>
                    <div style="font-size: 11.5px; font-weight: 800; color: #0F172A;">Franchise Kit</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.4; margin-top: 2px;">Confidential dossier &amp; ROI projection.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 7. WHATSAPP VIP PRIORITY CONCIERGE BANNER -->
          <tr>
            <td style="padding: 0 30px 22px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #064E3B 0%, #065F46 100%); background-color: #064E3B; border-radius: 16px; padding: 14px 18px; box-shadow: 0 8px 24px rgba(6, 78, 59, 0.2);">
                <tr>
                  <td width="38" valign="middle">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/whatsapp.png" width="36" height="36" alt="WhatsApp" style="display: block; border-radius: 50%; border: none;">
                  </td>
                  <td valign="middle" style="padding-left: 12px;">
                    <div style="font-size: 13.5px; font-weight: 900; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Need Faster Assistance?
                    </div>
                    <div style="font-size: 11.5px; color: #A7F3D0; margin-top: 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Chat directly with our Franchise Concierge Desk on WhatsApp.
                    </div>
                  </td>
                  <td class="whatsapp-btn-cell" valign="middle" align="right">
                    <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Grillista,%20I%20have%20submitted%20a%20franchise%20inquiry%20reference%20%23${referenceId}" target="_blank" style="background-color: #22C55E; color: #FFFFFF; text-decoration: none; padding: 10px 18px; border-radius: 24px; font-size: 12px; font-weight: 800; display: inline-block; white-space: nowrap; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);">
                      Connect on WhatsApp →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 8. THREE-COLUMN LUXURY SIGNATURE (MATCHING REFERENCE MOCKUP) -->
          <tr>
            <td style="padding: 0 30px 24px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Left Script Graphic -->
                  <td class="sig-col" valign="middle" style="width: 26%; text-align: left;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_sig_greener.png" alt="Together for a Greener & Healthier Tomorrow" width="118" style="display: block; max-width: 118px; height: auto; border: none;">
                  </td>

                  <!-- Center Text -->
                  <td class="sig-col" valign="middle" style="width: 48%; text-align: center; padding: 0 10px;">
                    <div style="color: #334155; font-size: 12.5px; line-height: 1.5;">
                      Thank you for choosing <strong>Grillista</strong>.<br>
                      We look forward to building a thriving venture together.
                    </div>
                    <div style="margin-top: 8px; font-size: 9.5px; font-weight: 900; color: #475569; letter-spacing: 1.5px; text-transform: uppercase;">
                      ❤️ VEG VIBES, POSITIVE ENERGY
                    </div>
                  </td>

                  <!-- Right Script Graphic -->
                  <td class="sig-col" valign="middle" style="width: 26%; text-align: right;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email_sig_happy_people.png" alt="Good Food Happy People" width="108" style="display: block; max-width: 108px; height: auto; margin-left: auto; border: none;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 9. DARK FOREST GREEN PILLARS BANNER -->
          <tr>
            <td style="background-color: #052410; padding: 14px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">✦</span>
                    Great Taste<br><span style="color: #94A3B8; font-weight: 600;">Always</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">✦</span>
                    Stronger<br><span style="color: #94A3B8; font-weight: 600;">Communities</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">✦</span>
                    Positive<br><span style="color: #94A3B8; font-weight: 600;">Energy</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">✦</span>
                    A Healthier<br><span style="color: #94A3B8; font-weight: 600;">Tomorrow</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 10. CORPORATE FOOTER WITH SOCIALS & QUICK LINKS -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 24px 30px 18px 30px; border-top: 1px solid #F1F5F9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Left Logo -->
                  <td class="footer-grid-col" valign="top" style="width: 20%; padding-right: 12px;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email-logo-clean.png" width="62" height="62" alt="Grillista" style="display: block; border-radius: 50%;">
                  </td>

                  <!-- Corporate Office -->
                  <td class="footer-grid-col" valign="top" style="width: 32%; padding-right: 12px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px;">Corporate Headquarters</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.45;">
                      Grillista Food Private Limited<br>
                      123, Food Street, Kakadeo,<br>
                      Kanpur, UP – 208025, India
                    </div>
                  </td>

                  <!-- Follow Us (Instagram, Facebook, Pinterest, YouTube) -->
                  <td class="footer-grid-col" valign="top" style="width: 26%; padding-right: 10px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 8px;">Follow Us</div>
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-right: 6px;">
                          <a href="https://www.instagram.com/grillista1" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/instagram.png" width="24" height="24" alt="Instagram" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td style="padding-right: 6px;">
                          <a href="https://www.facebook.com/share/1EGML5sM3N/" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/facebook.png" width="24" height="24" alt="Facebook" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td style="padding-right: 6px;">
                          <a href="https://pin.it/1bi0APK1A" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/pinterest.png" width="24" height="24" alt="Pinterest" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td>
                          <a href="https://youtube.com" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/youtube.png" width="24" height="24" alt="YouTube" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Quick Links -->
                  <td class="footer-grid-col" valign="top" style="width: 22%;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px;">Quick Links</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.55;">
                      <a href="https://grillista.in" target="_blank" style="color: #64748B; text-decoration: none;">Website</a><br>
                      <a href="https://grillista.in/franchise.html" target="_blank" style="color: #64748B; text-decoration: none;">Franchise</a><br>
                      <a href="https://grillista.in/about.html" target="_blank" style="color: #64748B; text-decoration: none;">Contact</a><br>
                      <a href="https://grillista.in/join-us.html" target="_blank" style="color: #64748B; text-decoration: none;">Careers</a>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="height: 1px; background-color: #E2E8F0; margin: 18px 0 12px 0;"></div>

              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 10.5px; color: #94A3B8; font-weight: 600;">
                    © 2026 Grillista Food Private Limited. All Rights Reserved.
                  </td>
                  <td align="right" style="font-size: 10.5px; color: #065F46; font-weight: 800;">
                    🌱 Pure Veg • Positive Vibes
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
    subject: "Franchise Application Received — Grillista | #" + referenceId,
    htmlBody: htmlBody,
    name: "Grillista"
  });
}

/**
 * ==============================================================================
 * 2. FLAGSHIP ULTRA-PREMIUM ADMIN NOTIFICATION EMAIL
 * ==============================================================================
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
  const receiptUrl = buildReceiptUrl(safeName, safeEmail, safePhone, safeBudget, safeModel, safeExperience, safeCity, safeState, safeMessage, referenceId);

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Franchise Lead Alert - Grillista Admin</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .admin-wrapper { width: 100% !important; padding: 10px 4px !important; }
      .admin-container { width: 100% !important; border-radius: 16px !important; }
      .grid-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .grid-col-right { padding-top: 16px !important; border-left: none !important; border-top: 1px solid #E2E8F0 !important; }
      .action-col { display: block !important; width: 100% !important; margin-bottom: 10px !important; }
      .stats-col { display: block !important; width: 100% !important; margin-top: 14px !important; }
      .footer-grid-col { display: block !important; width: 100% !important; margin-bottom: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F1F5F9;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F1F5F9" class="admin-wrapper">
    <tr>
      <td align="center" style="padding: 0 10px;">
        
        <!-- Main Admin Email Container -->
        <table class="admin-container" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 600px; max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- TOP HIGH-PRIORITY ALERT BANNER -->
          <tr>
            <td style="background-color: #991B1B; padding: 9px 24px; text-align: center;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 10.5px; font-weight: 900; color: #FFFFFF; letter-spacing: 1.5px; text-transform: uppercase;">
                    ⚡ NEW INCOMING FRANCHISE APPLICATION • IMMEDIATE ATTENTION
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 1. HEADER BANNER WITH LOGO, TAGLINE & VEG PANEER DISH -->
          <tr>
            <td style="padding: 0; background-color: #FDFEFE;" align="center">
              <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/admin_email_header.jpg" alt="Grillista - Good Food Brighter Tomorrow" width="600" style="width: 100%; max-width: 600px; display: block; border: 0;" />
            </td>
          </tr>

          <!-- 2. EXECUTIVE LEAD BRIEF & TWO-COLUMN INTRO -->
          <tr>
            <td style="padding: 24px 30px 14px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Left Intro Headline -->
                  <td valign="top" style="width: 60%; padding-right: 14px;">
                    <table border="0" cellspacing="0" cellpadding="0" style="background-color: #DC2626; border-radius: 20px; margin-bottom: 12px;">
                      <tr>
                        <td style="padding: 5px 12px; font-size: 10px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; text-transform: uppercase;">
                          <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/icon_bell_white.png" width="12" height="12" alt="" style="display: inline-block; vertical-align: middle; margin-right: 4px; margin-top: -2px;">
                          NEW FRANCHISE LEAD
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 26px; font-weight: 900; color: #0F172A; line-height: 1.2; letter-spacing: -0.5px;">
                      New Application from<br><span style="color: #DC2626;">${safeName}</span>
                    </div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 10px;">
                      A new franchise application for <strong>${safeCity}, ${safeState}</strong> has been received via the website. Review the details below and initiate applicant discovery.
                    </div>
                  </td>

                  <!-- Right Side Mini Highlight Card -->
                  <td class="stats-col" valign="top" style="width: 40%;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; border: 1.5px solid #DCFCE7; border-radius: 16px; padding: 14px;">
                      <tr>
                        <td>
                          <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 4px;">
                            <tr>
                              <td width="22" valign="middle">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/icon_chart_bars.png" width="18" height="18" alt="" style="display: block;">
                              </td>
                              <td valign="middle" style="padding-left: 6px;">
                                <div style="font-size: 12.5px; font-weight: 900; color: #065F46; line-height: 1.2;">
                                  Territory Target
                                </div>
                              </td>
                            </tr>
                          </table>
                          <div style="width: 36px; height: 3px; background-color: #FFC72C; border-radius: 2px; margin-top: 4px; margin-bottom: 10px;"></div>
                          
                          <!-- Summary item 1 -->
                          <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 6px;">
                            <tr>
                              <td width="18" valign="middle">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/check_circle_green.png" width="14" height="14" alt="" style="display: block;">
                              </td>
                              <td valign="middle" style="padding-left: 6px; font-size: 11px; color: #065F46; font-weight: 800;">
                                Region: ${safeCity}
                              </td>
                            </tr>
                          </table>

                          <!-- Summary item 2 -->
                          <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 6px;">
                            <tr>
                              <td width="18" valign="middle">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/check_circle_green.png" width="14" height="14" alt="" style="display: block;">
                              </td>
                              <td valign="middle" style="padding-left: 6px; font-size: 11px; color: #065F46; font-weight: 800;">
                                Tier: ${safeBudget}
                              </td>
                            </tr>
                          </table>

                          <!-- Summary item 3 -->
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="18" valign="middle">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/check_circle_green.png" width="14" height="14" alt="" style="display: block;">
                              </td>
                              <td valign="middle" style="padding-left: 6px; font-size: 11px; color: #065F46; font-weight: 800;">
                                24h SLA Active
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

          <!-- 3. INQUIRY DETAILS CARD (MATCHING 9 FIELDS) -->
          <tr>
            <td style="padding: 4px 30px 18px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1.5px solid #E2E8F0; border-radius: 18px; overflow: hidden; background-color: #FFFFFF; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
                
                <!-- Card Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); background-color: #0F172A; padding: 14px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="34" valign="middle">
                          <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/header_user_green.png" width="28" height="28" alt="" style="display: block;">
                        </td>
                        <td valign="middle" style="padding-left: 10px;">
                          <div style="font-size: 14.5px; font-weight: 900; color: #FFFFFF;">Applicant Profile &amp; Preferences</div>
                          <div style="font-size: 11px; color: #94A3B8;">Full Application Payload</div>
                        </td>
                        <td valign="middle" align="right">
                          <div style="background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 5px 12px; font-size: 11px; font-weight: 800; color: #FFFFFF; display: inline-block;">
                            Token <strong style="color: #4ADE80;">#${referenceId}</strong>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Card Body (2 Columns) -->
                <tr>
                  <td style="padding: 20px 22px; background-color: #FFFFFF;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Left Column: Name, Email, Phone, City, State -->
                        <td class="grid-col" valign="top" style="width: 48%; padding-right: 14px;">
                          
                          <!-- Name -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 13px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_user.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Applicant Name</div>
                                <div style="font-size: 13.5px; font-weight: 800; color: #0F172A; margin-top: 2px;">${safeName}</div>
                              </td>
                            </tr>
                          </table>

                          <!-- Email -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 13px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_email.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</div>
                                <div style="font-size: 12px; font-weight: 700; color: #0284C7; margin-top: 2px; word-break: break-all;">
                                  <a href="mailto:${safeEmail}" style="color: #0284C7; text-decoration: none;">${safeEmail}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Phone No -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 13px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_phone.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Direct Phone / WhatsApp</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 2px;">
                                  <a href="tel:${safePhone}" style="color: #0F172A; text-decoration: none;">${safePhone}</a>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- City & State -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_location.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">City &amp; State</div>
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 2px;">
                                  ${safeCity}, <span style="color: #64748B; font-weight: 700;">${safeState}</span>
                                </div>
                              </td>
                            </tr>
                          </table>

                        </td>

                        <!-- Right Column: Budget, Model, Previous Experience, Submitted On -->
                        <td class="grid-col grid-col-right" valign="top" style="width: 52%; padding-left: 16px; border-left: 1px solid #F1F5F9;">
                          
                          <!-- Budget -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_budget.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Investment Budget</div>
                                <div style="margin-top: 3px;">
                                  <span style="display: inline-block; background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; font-size: 11.5px; font-weight: 800; padding: 3px 9px; border-radius: 6px;">
                                    💰 ${safeBudget}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Franchise Model -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_model.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Franchise Model</div>
                                <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin-top: 2px;">
                                  ${safeModel}
                                </div>
                              </td>
                            </tr>
                          </table>

                          <!-- Previous Experience -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                            <tr>
                              <td width="22" valign="top" style="padding-top: 2px;">
                                <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_experience.png" width="16" height="16" alt="" style="display: block;">
                              </td>
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Previous Experience</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #334155; margin-top: 2px;">
                                  ${safeExperience}
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
                              <td valign="top" style="padding-left: 8px;">
                                <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Submission Timestamp</div>
                                <div style="font-size: 11.5px; font-weight: 700; color: #0F172A; margin-top: 2px;">${formattedDate}</div>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <!-- Full-Width Message Callout Box -->
                    <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #F1F5F9;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="22" valign="top" style="padding-top: 2px;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/card_message.png" width="16" height="16" alt="" style="display: block;">
                          </td>
                          <td valign="top" style="padding-left: 8px;">
                            <div style="font-size: 9.5px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Applicant’s Note / Queries</div>
                            <div style="background-color: #F8FAFC; border-left: 3.5px solid #DC2626; border-radius: 0 8px 8px 0; padding: 10px 14px; font-size: 12px; color: #334155; line-height: 1.5; margin-top: 6px; font-style: italic;">
                              “${safeMessage}”
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>

                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- 4. QUICK ACTION BUTTONS (REPLY, WHATSAPP & DOWNLOAD) -->
          <tr>
            <td style="padding: 0 30px 14px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="action-col" style="width: 48%; padding-right: 6px;">
                    <a href="mailto:${safeEmail}?subject=Re:%20Grillista%20Franchise%20Inquiry%20%23${referenceId}&body=Dear%20${encodeURIComponent(safeName)},%0A%0AThank%20you%20for%20your%20interest%20in%20a%20Grillista%20franchise%20in%20${encodeURIComponent(safeCity)}.%0A%0ABest%20regards,%0AGrillista%20Expansion%20Team" style="background: linear-gradient(135deg, #065F46 0%, #047857 100%); background-color: #065F46; color: #FFFFFF; text-decoration: none; padding: 12px 14px; border-radius: 14px; font-size: 12px; font-weight: 800; display: block; text-align: center; box-shadow: 0 4px 12px rgba(6, 95, 70, 0.25);">
                      <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/icon_reply_white.png" width="12" height="12" alt="" style="display: inline-block; vertical-align: middle; margin-right: 5px; margin-top: -2px;">
                      Reply via Email →
                    </a>
                  </td>
                  <td class="action-col" style="width: 48%; padding-left: 6px;">
                    <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(safeName)},%20thank%20you%20for%20reaching%20out%20to%20Grillista%20regarding%20the%20franchise%20opportunity%20in%20${encodeURIComponent(safeCity)}%20(Ref%20%23${referenceId})." target="_blank" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); background-color: #10B981; color: #FFFFFF; text-decoration: none; padding: 12px 14px; border-radius: 14px; font-size: 12px; font-weight: 800; display: block; text-align: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                      <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/whatsapp.png" width="14" height="14" alt="" style="display: inline-block; vertical-align: middle; margin-right: 5px; margin-top: -2px;">
                      Chat on WhatsApp →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DOWNLOAD OFFICIAL DOSSIER BUTTON -->
          <tr>
            <td style="padding: 0 30px 20px 30px;" align="center">
              <a href="${receiptUrl}" target="_blank" style="background-color: #F8FAFC; border: 1.5px solid #CBD5E1; color: #0F172A; text-decoration: none; padding: 10px 20px; border-radius: 12px; font-size: 11.5px; font-weight: 800; display: inline-block;">
                📥 Open &amp; Download Printable Application Dossier (PDF / JPG) →
              </a>
            </td>
          </tr>

          <!-- 5. SIGNATURE & INTERNAL ACTION NOTE -->
          <tr>
            <td style="padding: 0 30px 24px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border-radius: 14px; padding: 14px 18px; border: 1px solid #E2E8F0;">
                <tr>
                  <td width="30" valign="top">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/icon_team_dark.png" width="22" height="22" alt="" style="display: block;">
                  </td>
                  <td valign="top" style="padding-left: 10px; font-size: 11.5px; color: #475569; line-height: 1.5;">
                    <strong style="color: #0F172A;">Action Required:</strong> Please contact <strong>${safeName}</strong> within 24 hours to schedule an introductory franchise discovery session.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 6. DARK FOREST GREEN PILLARS BANNER -->
          <tr>
            <td style="background-color: #052410; padding: 14px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">✦</span>
                    Great Taste<br><span style="color: #94A3B8; font-weight: 600;">Always</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">✦</span>
                    Stronger<br><span style="color: #94A3B8; font-weight: 600;">Communities</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">✦</span>
                    Positive<br><span style="color: #94A3B8; font-weight: 600;">Energy</span>
                  </td>
                  <td align="center" style="width: 25%; font-size: 10px; font-weight: 800; color: #FFFFFF;">
                    <span style="color: #FFC72C; font-size: 12px; display: block; margin-bottom: 2px;">✦</span>
                    A Healthier<br><span style="color: #94A3B8; font-weight: 600;">Tomorrow</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 7. CORPORATE FOOTER WITH SOCIALS & QUICK LINKS -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 24px 30px 18px 30px; border-top: 1px solid #F1F5F9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Left Logo -->
                  <td class="footer-grid-col" valign="top" style="width: 20%; padding-right: 12px;">
                    <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/email-logo-clean.png" width="62" height="62" alt="Grillista" style="display: block; border-radius: 50%;">
                  </td>

                  <!-- Corporate Office -->
                  <td class="footer-grid-col" valign="top" style="width: 32%; padding-right: 12px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px;">Corporate Headquarters</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.45;">
                      Grillista Food Private Limited<br>
                      123, Food Street, Kakadeo,<br>
                      Kanpur, UP – 208025, India
                    </div>
                  </td>

                  <!-- Follow Us (Instagram, Facebook, Pinterest, YouTube) -->
                  <td class="footer-grid-col" valign="top" style="width: 26%; padding-right: 10px;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 8px;">Follow Us</div>
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-right: 6px;">
                          <a href="https://www.instagram.com/grillista1" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/instagram.png" width="24" height="24" alt="Instagram" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td style="padding-right: 6px;">
                          <a href="https://www.facebook.com/share/1EGML5sM3N/" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/facebook.png" width="24" height="24" alt="Facebook" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td style="padding-right: 6px;">
                          <a href="https://pin.it/1bi0APK1A" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/pinterest.png" width="24" height="24" alt="Pinterest" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                        <td>
                          <a href="https://youtube.com" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://raw.githubusercontent.com/AkarshanMishra/gfc2026/main/assets/icons/youtube.png" width="24" height="24" alt="YouTube" style="display: block; border-radius: 50%; border: none;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Quick Links -->
                  <td class="footer-grid-col" valign="top" style="width: 22%;">
                    <div style="font-size: 11px; font-weight: 900; color: #0F172A; margin-bottom: 4px;">Quick Links</div>
                    <div style="font-size: 10.5px; color: #64748B; line-height: 1.55;">
                      <a href="https://grillista.in" target="_blank" style="color: #64748B; text-decoration: none;">Website</a><br>
                      <a href="https://grillista.in/franchise.html" target="_blank" style="color: #64748B; text-decoration: none;">Franchise</a><br>
                      <a href="https://grillista.in/about.html" target="_blank" style="color: #64748B; text-decoration: none;">Contact</a><br>
                      <a href="https://grillista.in/join-us.html" target="_blank" style="color: #64748B; text-decoration: none;">Careers</a>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="height: 1px; background-color: #E2E8F0; margin: 18px 0 12px 0;"></div>

              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 10.5px; color: #94A3B8; font-weight: 600;">
                    © 2026 Grillista Food Private Limited. All Rights Reserved.
                  </td>
                  <td align="right" style="font-size: 10.5px; color: #065F46; font-weight: 800;">
                    🌱 Pure Veg • Positive Vibes
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
