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

function doPost(e) {
  const lock = LockService.getScriptLock();
  let lockAcquired = false;

  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const properties = PropertiesService.getScriptProperties();
    const expectedToken = properties.getProperty("SUBMISSION_TOKEN");

    if (!expectedToken || body.token !== expectedToken) {
      return jsonResponse({ success: false, message: "Submission could not be authorised." });
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
  return /^[=+@\-]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
