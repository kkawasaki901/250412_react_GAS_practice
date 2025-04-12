function doGet() {
  return HtmlService.createHtmlOutputFromFile("index");
}

// データを新規追加
function submitData(partName, quantity, date, note, project) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("部品記録");
  const lastRow = sheet.getLastRow();

  // 初回時にヘッダー行がなければ追加
  if (lastRow === 0) {
    sheet.appendRow(["部品名", "使用数", "日付", "メモ", "プロジェクト名"]);
  }

  sheet.appendRow([partName, quantity, date, note, project]);
}

function getData() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("部品記録"); // シート名を実際のものに変更
    if (!sheet) {
      console.log("シートが見つかりません");
      return [];
    }
    
    var data = sheet.getDataRange().getValues();
    // ヘッダー行を除外
    data = data.slice(1);
    Logger.log("取得したデータ: " + JSON.stringify(data));
    return data;
  } catch(e) {
    Logger.log("エラー: " + e.toString());
    return [];
  }
}


// 指定期間内の部品使用数を集計
function getDataInRange(startDateStr, endDateStr) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("部品記録");
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const rows = data.slice(1);

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const partIndex = header.indexOf("部品名");
  const qtyIndex = header.indexOf("使用数");
  const dateIndex = header.indexOf("日付");

  const summary = {};

  for (const row of rows) {
    const date = new Date(row[dateIndex]);
    if (date >= startDate && date <= endDate) {
      const part = row[partIndex];
      const qty = Number(row[qtyIndex]) || 0;
      summary[part] = (summary[part] || 0) + qty;
    }
  }

  return Object.entries(summary); // [["抵抗 (10kΩ)", 3], ...]
}

// 行番号を指定して削除（1始まり）
function deleteRow(rowNumber) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("部品記録");
  if (rowNumber > 1) {
    sheet.deleteRow(rowNumber);
  }
}

// 行番号を指定して上書き（1始まり）
function updateRow(rowNumber, partName, quantity, date, note, project) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("部品記録");
  sheet.getRange(rowNumber, 1, 1, 5).setValues([[partName, quantity, date, note, project]]);
}
