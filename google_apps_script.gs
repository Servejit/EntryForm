/**
 * 6thSense-Vardaan registration receiver and trial credential allocator.
 *
 * Script Properties required:
 *   SUBMISSION_TOKEN = your existing private token
 *   SPREADSHEET_ID = your existing spreadsheet ID
 *
 * In the same spreadsheet, create a tab named exactly: username
 * Column A = Username, Column B = Password, Column C = Assigned Client Name,
 * Column D = Username Assigned Date, Column E = Trial End Date (15 days later).
 *
 * Deploy as Web App: Execute as Me; access Anyone.
 */

/**
 * Browser health check. This does not read or change spreadsheet data.
 */
function doGet(e) {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>6thSense-Vardaan Registration API</title></head>' +
    '<body style="font-family:Arial,sans-serif;max-width:640px;margin:48px auto;padding:24px;line-height:1.6;color:#1f2937">' +
    '<h2>6thSense-Vardaan Registration API</h2>' +
    '<p style="color:#15803d;font-weight:bold">API endpoint is running.</p>' +
    '<p>The registration receiver is ready to accept submissions from the connected application.</p>' +
    '<p style="color:#64748b;font-size:14px">This page is a status check. It does not submit a registration.</p>' +
    '</body></html>'
  ).setTitle('6thSense-Vardaan Registration API');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let lockAcquired = false;

  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const properties = PropertiesService.getScriptProperties();
    const expectedToken = properties.getProperty("SUBMISSION_TOKEN");
    const acceptedToken = body.action === "plan_request"
      ? (properties.getProperty("PLAN_REQUEST_TOKEN") || expectedToken)
      : expectedToken;

    if (!acceptedToken || body.token !== acceptedToken) {
      return jsonResponse({ success: false, message: "Submission could not be authorised." });
    }

    // A plan request is an email notification only. It does not change account access.
    if (body.action === "plan_request") {
      const plans = {
        "15_days": { amount: 250, duration: "15 days", label: "Trial extension" },
        "1_month": { amount: 500, duration: "1 month", label: "Monthly plan" },
        "3_months": { amount: 1200, duration: "3 months", label: "Quarterly plan" }
      };
      const plan = plans[String(body.plan || "")];
      if (!plan) {
        return jsonResponse({ success: false, message: "Please select a valid plan." });
      }

      const accountEmail = String(body.account_email || "").trim();
      const accountId = String(body.account_id || "").trim();
      if (!accountEmail || !accountId) {
        return jsonResponse({ success: false, message: "Account details are missing." });
      }

      const requestedAt = new Date();
      const subject = "6thSense-Vardaan plan extension request";
      const message = [
        "A user has requested an account plan extension.",
        "",
        "Account email / User ID: " + accountEmail,
        "Supabase account ID: " + accountId,
        "Selected plan: " + plan.label,
        "Duration: " + plan.duration,
        "Amount: Rs. " + plan.amount,
        "Requested at: " + Utilities.formatDate(requestedAt, "Asia/Kolkata", "dd-MMM-yyyy hh:mm:ss a") + " IST",
        "",
        "This is only a request notification. No payment was collected and the account was not activated."
      ].join("\n");

      MailApp.sendEmail({
        to: "6thsense.live@gmail.com",
        subject: subject,
        body: message,
        name: "6thSense-Vardaan"
      });

      return jsonResponse({
        success: true,
        message: "Your request has been sent. Your account will remain inactive until the administrator reviews it."
      });
    }

    const required = [
      "full_name", "email", "contact_number", "whatsapp_number", "city", "occupation",
      "trading_experience", "areas_of_interest"
    ];
    for (const key of required) {
      if (!body[key] || (Array.isArray(body[key]) && body[key].length === 0)) {
        return jsonResponse({ success: false, message: "Please complete all required fields." });
      }
    }

    const emailAddress = String(body.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      return jsonResponse({ success: false, message: "Please provide a valid email address." });
    }

    const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
    if (!spreadsheetId) {
      throw new Error("Missing SPREADSHEET_ID script property.");
    }

    // Lock covers both the registration write and credential allocation.
    lock.waitLock(20000);
    lockAcquired = true;

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    // Create and check the dedicated Emails tab before allocating any credentials.
    let emailsSheet = spreadsheet.getSheetByName("Emails");
    if (!emailsSheet) {
      emailsSheet = spreadsheet.insertSheet("Emails");
      emailsSheet.getRange(1, 1, 1, 3).setValues([["Email Address", "Saved At", "Full Name"]]);
      emailsSheet.setFrozenRows(1);
    } else if (emailsSheet.getLastRow() === 0) {
      emailsSheet.getRange(1, 1, 1, 3).setValues([["Email Address", "Saved At", "Full Name"]]);
      emailsSheet.setFrozenRows(1);
    }

    const normalizedEmail = emailAddress.toLowerCase();
    const emailLastRow = emailsSheet.getLastRow();
    if (emailLastRow >= 2) {
      const savedEmails = emailsSheet.getRange(2, 1, emailLastRow - 1, 1).getDisplayValues();
      const alreadyRegistered = savedEmails.some(function (row) {
        return String(row[0] || "").trim().toLowerCase() === normalizedEmail;
      });
      if (alreadyRegistered) {
        return jsonResponse({
          success: false,
          duplicate: true,
          message: "Your Registration has been done."
        });
      }
    }

    const usernameSheet = spreadsheet.getSheetByName("username");
    if (!usernameSheet) {
      return jsonResponse({
        success: false,
        message: 'The "username" tab was not found. Please contact the administrator.'
      });
    }

    // Use the first response tab other than the credential tab or Emails tab.
    const responseSheet = spreadsheet.getSheets().find(function (sheet) {
      return sheet.getName() !== "username" && sheet.getName() !== "Emails";
    });
    if (!responseSheet) {
      throw new Error("Registration response sheet was not found.");
    }

    const firstCredentialRow = getFirstCredentialDataRow(usernameSheet);
    // Add date-column headings only when this sheet already uses a header row.
    // If row 1 contains the first credential pair, preserve it without inserting a row.
    if (firstCredentialRow === 2) {
      usernameSheet.getRange(1, 4, 1, 4).setValues([[
        "Username Assigned Date", "Trial End Date", "Email Address", "Email Status"
      ]]);
    }
    const lastCredentialRow = usernameSheet.getLastRow();
    if (lastCredentialRow < firstCredentialRow) {
      return jsonResponse({
        success: false,
        message: "No unused trial credentials are currently available."
      });
    }

    const rowCount = lastCredentialRow - firstCredentialRow + 1;
    const credentialRows = usernameSheet
      .getRange(firstCredentialRow, 1, rowCount, 3)
      .getDisplayValues();

    // Do not reuse a username or password that has already been assigned.
    const usedUsernames = new Set();
    const usedPasswords = new Set();

    credentialRows.forEach(function (row) {
      const username = String(row[0] || "").trim();
      const password = String(row[1] || "").trim();
      const assignedName = String(row[2] || "").trim();
      if (assignedName) {
        if (username) usedUsernames.add(username);
        if (password) usedPasswords.add(password);
      }
    });

    let selectedRow = -1;
    let selectedUsername = "";
    let selectedPassword = "";

    for (let i = 0; i < credentialRows.length; i++) {
      const username = String(credentialRows[i][0] || "").trim();
      const password = String(credentialRows[i][1] || "").trim();
      const assignedName = String(credentialRows[i][2] || "").trim();

      if (
        !assignedName &&
        username &&
        password &&
        !usedUsernames.has(username) &&
        !usedPasswords.has(password)
      ) {
        selectedRow = firstCredentialRow + i;
        selectedUsername = username;
        selectedPassword = password;
        break;
      }
    }

    if (selectedRow === -1) {
      return jsonResponse({
        success: false,
        message: "No unused username and password pair is available. Please contact the administrator."
      });
    }

    // Ensure the response sheet has headings if it is empty.
    if (responseSheet.getLastRow() === 0) {
      responseSheet.appendRow([
        "Submitted At", "Full Name", "Contact Number", "WhatsApp Number", "City",
        "Occupation", "Trading Experience", "Areas of Interest", "Message",
        "Contact Consent", "Email Address"
      ]);
      responseSheet.setFrozenRows(1);
    } else if (!String(responseSheet.getRange(1, 11).getDisplayValue() || "").trim()) {
      responseSheet.getRange(1, 11).setValue("Email Address");
    }

    // Save the registration first, then mark the credential row as assigned.
    responseSheet.appendRow([
      new Date(),
      cleanCell(body.full_name),
      cleanCell(body.contact_number),
      cleanCell(body.whatsapp_number),
      cleanCell(body.city),
      cleanCell(body.occupation),
      cleanCell(body.trading_experience),
      cleanCell(body.areas_of_interest || ""),
      cleanCell(body.message || ""),
      body.contact_consent === true ? "Yes" : "No",
      cleanCell(emailAddress)
    ]);

    const usernameAssignedDate = new Date();
    const trialEndDate = new Date(usernameAssignedDate);
    trialEndDate.setDate(trialEndDate.getDate() + 15);

    usernameSheet.getRange(selectedRow, 3).setValue(cleanCell(body.full_name));
    usernameSheet.getRange(selectedRow, 4).setValue(usernameAssignedDate).setNumberFormat("dd-MMM-yyyy");
    usernameSheet.getRange(selectedRow, 5).setValue(trialEndDate).setNumberFormat("dd-MMM-yyyy");
    // Keep the user's email beside the assigned username and trial dates.
    usernameSheet.getRange(selectedRow, 6).setValue(cleanCell(emailAddress));
    usernameSheet.getRange(selectedRow, 7).setValue("Email pending");
    SpreadsheetApp.flush();

    // Send the welcome email after the registration and credential assignment are saved.
    // Email failure does not undo a successful registration or release the assigned credentials.
    let welcomeEmailSent = false;
    let welcomeEmailMessage = "Registration is complete, but the welcome email could not be sent. Please use the credentials shown on this page.";
    try {
      sendWelcomeEmail(emailAddress, body.full_name, selectedUsername, selectedPassword);
      welcomeEmailSent = true;
      usernameSheet.getRange(selectedRow, 7).setValue("Email sent");
      // Save the address only after Gmail confirms the welcome email send call.
      emailsSheet.appendRow([normalizedEmail, new Date(), cleanCell(body.full_name)]);
      SpreadsheetApp.flush();
      welcomeEmailMessage = "Welcome email sent to " + emailAddress + ".";
    } catch (emailError) {
      const safeEmailError = String(emailError && emailError.message ? emailError.message : emailError);
      usernameSheet.getRange(selectedRow, 7).setValue("Email not sent: " + safeEmailError.substring(0, 180));
      SpreadsheetApp.flush();
      console.error("Welcome email failed: " + emailError);
      welcomeEmailMessage = "Registration saved, but welcome email failed: " + safeEmailError;
    }

    return jsonResponse({
      success: true,
      message: "Registration received and trial credentials assigned.",
      username: selectedUsername,
      password: selectedPassword,
      email_sent: welcomeEmailSent,
      email_message: welcomeEmailMessage
    });

  } catch (error) {
    console.error(error);
    return jsonResponse({
      success: false,
      message: "Unable to save this submission or assign trial credentials."
    });
  } finally {
    if (lockAcquired) {
      lock.releaseLock();
    }
  }
}

/**
 * Sends the new user's welcome email using the configured Gmail send-as alias.
 * The alias must be visible to the Apps Script owner in Gmail.
 */
function sendWelcomeEmail(recipient, fullName, username, password) {
  const senderAlias = "6thsense.live@gmail.com";
  const aliases = GmailApp.getAliases();
  if (aliases.indexOf(senderAlias) === -1) {
    throw new Error(
      "The sender alias " + senderAlias +
      " is not available to this Apps Script account. Check Gmail Send mail as settings."
    );
  }

  const loginUrl = "https://6thsense-vardaan.streamlit.app/";
  const subject = "Welcome to 6thSense-Vardaan";
  const bodyText = [
    "Dear " + String(fullName || "User").trim() + ",",
    "",
    "WELCOME to 6thSense-Vardaan!",
    "",
    "Your 15-days trial account has been created successfully. Use the login details below:",
    "",
    "Username: " + username,
    "Password: " + password,
    "",
    "Vardaan Login Link: " + loginUrl,
    "",
    "With Thanks,",
    "6THSENSE-VARDAAN Team"
  ].join("\n");

  const bodyHtml = [
    '<div style="font-family:Arial,sans-serif;color:#24332d;line-height:1.65;max-width:600px">',
    '<h2 style="color:#176b50">Welcome to 6thSense-Vardaan!</h2>',
    '<p>Dear ' + escapeHtml(fullName || "User") + ',</p>',
    '<p>Your 15-days trial account has been created successfully. Your login details are:</p>',
    '<div style="background:#f3f7f4;border:1px solid #d7e5dc;border-radius:10px;padding:16px">',
    '<p><strong>Username:</strong> ' + escapeHtml(username) + '</p>',
    '<p><strong>Password:</strong> ' + escapeHtml(password) + '</p>',
    '</div>',
    '<p><a href="' + loginUrl + '" style="display:inline-block;background:#176b50;color:#fff;padding:12px 18px;border-radius:7px;text-decoration:none">Open Vardaan Login</a></p>',
    '<p>With Thanks,<br><strong>6THSENSE-VARDAAN Team</strong></p>',
    '</div>'
  ].join("");

  GmailApp.sendEmail(recipient, subject, bodyText, {
    from: senderAlias,
    name: "6THSENSE-VARDAAN",
    htmlBody: bodyHtml
  });
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * If row 1 contains column headings, credentials start at row 2.
 * Otherwise credentials start at row 1 (so A1/B1 can be a real pair).
 */
function getFirstCredentialDataRow(sheet) {
  const headings = sheet.getRange(1, 1, 1, 3).getDisplayValues()[0]
    .map(function (value) { return String(value || "").trim().toLowerCase(); });

  const hasHeadings =
    headings[0] === "username" &&
    headings[1] === "password";

  return hasHeadings ? 2 : 1;
}

function cleanCell(value) {
  const text = String(value == null ? "" : value).trim();
  // Prevent spreadsheet formula injection from user-entered text.
  return /^[=+@\\-]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


/** One-time manual authorization helper. Run this from the Apps Script editor. */
function authorizeGmail() {
  const aliases = GmailApp.getAliases();
  const ownerEmail = Session.getEffectiveUser().getEmail();
  GmailApp.sendEmail(
    ownerEmail,
    "6thSense-Vardaan Gmail authorization test",
    "This test confirms that the Apps Script project has Gmail send permission."
  );
  Logger.log("Gmail authorization successful. Available aliases: " + aliases.join(", "));
}


/**
 * Resends the welcome email for the already-assigned credentials in row 4
 * of the "username" sheet. Does not create or change any credentials.
 */
function resendWelcomeEmailForRow4() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Missing SPREADSHEET_ID script property.");

  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("username");
  if (!sheet) throw new Error('The "username" tab was not found.');

  const row = 4;
  const values = sheet.getRange(row, 1, 1, 7).getDisplayValues()[0];
  const username = String(values[0] || "").trim();
  const password = String(values[1] || "").trim();
  const fullName = String(values[2] || "").trim();
  const email = String(values[5] || "").trim();

  if (!username || !password || !fullName || !email) {
    throw new Error("Row 4 is missing username, password, client name, or email address. No email was sent.");
  }

  sendWelcomeEmail(email, fullName, username, password);
  sheet.getRange(row, 7).setValue("Email sent");
  SpreadsheetApp.flush();
  Logger.log("Welcome email successfully resent to " + email + " for username " + username);
}
