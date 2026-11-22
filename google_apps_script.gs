/**
 * 6thSense-Vardaan registration receiver and trial credential allocator.
 *
 * Script Properties required:
 *   SUBMISSION_TOKEN = your existing private token
 *   SPREADSHEET_ID = your existing spreadsheet ID
 *
 * In the same spreadsheet, create a tab named exactly: username
 * Column A = Username, Column B = Password, Column C = Assigned Client Name.
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
      ].join("\\n");

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
      "full_name", "contact_number", "whatsapp_number", "city", "occupation",
      "trading_experience", "areas_of_interest"
    ];
    for (const key of required) {
      if (!body[key] || (Array.isArray(body[key]) && body[key].length === 0)) {
        return jsonResponse({ success: false, message: "Please complete all required fields." });
      }
    }

    const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
    if (!spreadsheetId) {
      throw new Error("Missing SPREADSHEET_ID script property.");
    }

    // Lock covers both the registration write and credential allocation.
    lock.waitLock(20000);
    lockAcquired = true;

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const usernameSheet = spreadsheet.getSheetByName("username");
    if (!usernameSheet) {
      return jsonResponse({
        success: false,
        message: 'The "username" tab was not found. Please contact the administrator.'
      });
    }

    // Use the first response tab other than the credential tab.
    const responseSheet = spreadsheet.getSheets().find(function (sheet) {
      return sheet.getName() !== "username";
    });
    if (!responseSheet) {
      throw new Error("Registration response sheet was not found.");
    }

    const firstCredentialRow = getFirstCredentialDataRow(usernameSheet);
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
        "Contact Consent"
      ]);
      responseSheet.setFrozenRows(1);
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
      body.contact_consent === true ? "Yes" : "No"
    ]);

    usernameSheet.getRange(selectedRow, 3).setValue(cleanCell(body.full_name));
    SpreadsheetApp.flush();

    return jsonResponse({
      success: true,
      message: "Registration received and trial credentials assigned.",
      username: selectedUsername,
      password: selectedPassword
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
