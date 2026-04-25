// ============================================================
// Google Apps Script — רישום קבלות בגיליון Google Sheets
// ============================================================
// הוראות פריסה (ב-tamars1984@gmail.com):
//
// 1. פתחי את script.google.com
// 2. צרי פרויקט חדש (New project)
// 3. מחקי את הקוד הקיים והדביקי את כל הקובץ הזה
// 4. שמרי (Ctrl+S)
// 5. לחצי על "Deploy" → "New deployment"
// 6. סוג: "Web app"
//    - Description: "קבלות תמר פורת"
//    - Execute as: "Me (tamars1984@gmail.com)"
//    - Who has access: "Anyone"
// 7. לחצי "Deploy" ואשרי הרשאות
// 8. העתיקי את כתובת ה-Web app URL
// 9. הדביקי אותה ב-index.html בשורה:  const GOOGLE_SHEETS_SCRIPT_URL = "..."
// ============================================================

var SHEET_NAME = "קבלות";
var SPREADSHEET_NAME = "קבלות - תמר פורת";

var HEADERS = [
  "מספר קבלה",
  "שם לקוח/ה",
  "תאריך תשלום",
  "סכום כולל",
  "טיפולים",
  "הערות",
  "תאריך הפקה"
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = getOrCreateSpreadsheet();
    var sheet = getOrCreateSheet(ss);

    sheet.appendRow([
      data.receiptNum    || "",
      data.name          || "",
      data.fmtPayDate    || "",
      "₪" + (data.fmtTotal || "0"),
      data.treatments    || "",
      data.notes         || "",
      data.timestamp     || new Date().toLocaleString("he-IL")
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var ssId  = props.getProperty("SPREADSHEET_ID");

  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      // הגיליון נמחק — ניצור חדש
    }
  }

  var ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  props.setProperty("SPREADSHEET_ID", ss.getId());
  return ss;
}

function getOrCreateSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // אם הגיליון ריק — הוסף כותרות ועצב
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);

    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#7c3aed");
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");

    sheet.setRightToLeft(true);
    sheet.setFrozenRows(1);

    // רוחב עמודות
    sheet.setColumnWidth(1, 100); // מס' קבלה
    sheet.setColumnWidth(2, 160); // שם לקוח
    sheet.setColumnWidth(3, 120); // תאריך תשלום
    sheet.setColumnWidth(4, 100); // סכום
    sheet.setColumnWidth(5, 300); // טיפולים
    sheet.setColumnWidth(6, 200); // הערות
    sheet.setColumnWidth(7, 150); // תאריך הפקה
  }

  return sheet;
}
