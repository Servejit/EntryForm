/**
 * 6thSense-Vardaan form → Google Sheets receiver.
 *
 * Create/open the destination Google Sheet, then choose Extensions → Apps Script.
 * Paste this complete file into Code.gs and save.
 *
 * In Apps Script: Project Settings → Script Properties, add:
 *   Property: SUBMISSION_TOKEN
 *   Value: a long private random string of your choice
 *
 * Deploy → New deployment → Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the deployed Web app URL into Streamlit secrets.
 */

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const expectedToken = PropertiesService.getScriptProperties()
      .getProperty("SUBMISSION_TOKEN");

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

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "Submitted At", "Full Name", "Contact Number", "WhatsApp Number", "City",
          "Occupation", "Trading Experience", "Areas of Interest", "Message",
          "Contact Consent"
        ]);
        sheet.setFrozenRows(1);
      }

      sheet.appendRow([
        new Date(),
        cleanCell(body.full_name),
        cleanCell(body.contact_number),
        cleanCell(body.whatsapp_number),
        cleanCell(body.city),
        cleanCell(body.occupation),
        cleanCell(body.trading_experience),
        cleanCell((body.areas_of_interest || []).join(", ")),
        cleanCell(body.message || ""),
        body.contact_consent === true ? "Yes" : "No"
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ success: true, message: "Registration received." });
  } catch (error) {
    return jsonResponse({ success: false, message: "Unable to save this submission." });
  }
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
