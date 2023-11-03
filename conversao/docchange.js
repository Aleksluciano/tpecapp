const ExcelJS = require("exceljs");

//import 'core-js/actual/Map';

function changeColor(cell, diasemana, type) {
  //color white in rgb
  let color = "FFFFFFFF";
  if (diasemana == "Segunda" && type == "P") color = "C4D79B";
  if (diasemana == "Segunda" && type == "H") color = "EBF1DE";
  if (diasemana == "Terça" && type == "P") color = "95B3D7";
  if (diasemana == "Terça" && type == "H") color = "DCE6F1";
  if (diasemana == "Quarta" && type == "P") color = "F2DCDB";
  if (diasemana == "Quarta" && type == "H") color = "F8F2F1";
  if (diasemana == "Quinta" && type == "P") color = "FABF8F";
  if (diasemana == "Quinta" && type == "H") color = "FDE9D9";
  if (diasemana == "Sexta" && type == "P") color = "B1A0C7";
  if (diasemana == "Sexta" && type == "H") color = "E4DFEC";
  if (diasemana == "Sábado" && type == "P") color = "8DB4E2";
  if (diasemana == "Sábado" && type == "H") color = "DAEEF3";
  if (diasemana == "Domingo" && type == "P") color = "E6B8B7";
  if (diasemana == "Domingo" && type == "H") color = "F2DCDB";
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: color }, // Código ARGB para cinza claro
  };
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
}

async function readAndWriteExcel(readFilePath, writeFilePath) {
  // Create a new workbook instance
  const workbook = new ExcelJS.Workbook();
  // Read the Excel file
  await workbook.xlsx.readFile(readFilePath);

  // Get the first worksheet
  const worksheet = workbook.getWorksheet(1);

  // Log the existing data (optional)
  let oValues = {};
  let aLines = [];
  const oLines = new Lines();
  const maxRows = worksheet.rowCount;
  worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
    aLines.push(row.values);
    if (rowNumber == maxRows) {
      aLines.shift();
      const oValues = aLines.map((aValue) => {
        aValue.splice(0, 2);
        aValue.pop();
        // aValue = aValue.replace(/[\[\]']+/g,'');
        return { ...new Line(...aValue) };
      });

      oValues.sort((a, b) => (a.dia > b.dia ? 1 : -1));
      oValues.forEach((oValue) => {
        oLines.push(oValue);
      });
    }
  });

  // console.log(aLines);
  const workbookOut = new ExcelJS.Workbook();
  const worksheetOut = workbookOut.addWorksheet("Meu Worksheet");

  //console.log(oLines.lines);
  console.log(Object.entries(oLines.lines));
  oLines.lines.forEach((value, key) => {
    // Adiciona a data e o dia da semana
    console.log(key, value);
    worksheetOut.addRow([`Data ${value.diasemana} ${value.diaFormatado}`]);
    // Obtendo o número da última linha adicionada
    let lastRowNumber = worksheetOut.lastRow.number;

    // Mesclando as cinco primeiras células da última linha adicionada
    worksheetOut.mergeCells(`A${lastRowNumber}:E${lastRowNumber}`);
    let mergedCell = worksheetOut.getCell(`A${lastRowNumber}`);
    mergedCell.alignment = { vertical: "middle", horizontal: "center" };
    mergedCell.font = { name: "Calibri", bold: true, size: 12 };
    mergedCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9D9D9" }, // Código ARGB para cinza claro
    };
    mergedCell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    //console.log(value.periodo.entries())
    // Adiciona os cabeçalhos
    let aPeriodo = new Array(4).fill("");
    const vals = Array.from(value.periodo.keys());
    if (vals.length == 1) {
      aPeriodo[0] = vals[0];
    }
    if (vals.length == 2) {
      aPeriodo[0] = vals[0];
      aPeriodo[2] = vals[1];
    }
    if (vals.length == 3) {
      aPeriodo[0] = vals[0];
      aPeriodo[1] = vals[1];
      aPeriodo[3] = vals[2];
    }
    worksheetOut.addRow(["Ponto", ...aPeriodo]);
    lastRowNumber = worksheetOut.lastRow.number;
    let cell = worksheetOut.getCell(`A${lastRowNumber}`);
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.font = { name: "Calibri", bold: true, size: 11 };

    changeColor(cell, value.diasemana, "P");

    if (vals.length == 1) {
      worksheetOut.mergeCells(`B${lastRowNumber}:E${lastRowNumber}`);
      cell = worksheetOut.getCell(`B${lastRowNumber}`);
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.font = { name: "Calibri", bold: true, size: 12 };
      changeColor(cell, value.diasemana, "H");
    }

    if (vals.length == 2) {
      worksheetOut.mergeCells(`B${lastRowNumber}:C${lastRowNumber}`);
      let cell = worksheetOut.getCell(`B${lastRowNumber}`);
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.font = { name: "Calibri", bold: true, size: 12 };
      changeColor(cell, value.diasemana, "H");
      worksheetOut.mergeCells(`D${lastRowNumber}:E${lastRowNumber}`);
      cell = worksheetOut.getCell(`D${lastRowNumber}`);
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.font = { name: "Calibri", bold: true, size: 12 };
      changeColor(cell, value.diasemana, "P");
    }
    if (vals.length == 3) {
      worksheetOut.mergeCells(`C${lastRowNumber}:D${lastRowNumber}`);
      let cell = worksheetOut.getCell(`C${lastRowNumber}`);
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.font = { name: "Calibri", bold: true, size: 12 };
      changeColor(cell, value.diasemana, "H");
      cell = worksheetOut.getCell(`B${lastRowNumber}`);
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.font = { name: "Calibri", bold: true, size: 12 };
      changeColor(cell, value.diasemana, "H");
      cell = worksheetOut.getCell(`E${lastRowNumber}`);
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.font = { name: "Calibri", bold: true, size: 12 };
      changeColor(cell, value.diasemana, "H");
    }

    // Adiciona os valores
    const publicadores = Array.from(value.periodo.values());
    console.log(publicadores);
    for (let i = 0; i < 2; i++) {
      if (publicadores.length == 1) {
        worksheetOut.addRow([value.ponto, publicadores[0][i]]);
        lastRowNumber = worksheetOut.lastRow.number;
        worksheetOut.mergeCells(`B${lastRowNumber}:E${lastRowNumber}`);
        let cell = worksheetOut.getCell(`B${lastRowNumber}`);
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Calibri", bold: false, size: 11 };
        changeColor(cell, value.diasemana, "H");
      }

      if (publicadores.length == 2) {
        worksheetOut.addRow([
          value.ponto,
          publicadores[0][i],
          "",
          publicadores[1][i],
        ]);
        lastRowNumber = worksheetOut.lastRow.number;
        worksheetOut.mergeCells(`B${lastRowNumber}:C${lastRowNumber}`);
        let cell = worksheetOut.getCell(`B${lastRowNumber}`);
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Calibri", bold: false, size: 11 };
        changeColor(cell, value.diasemana, "H");
        worksheetOut.mergeCells(`D${lastRowNumber}:E${lastRowNumber}`);
        cell = worksheetOut.getCell(`D${lastRowNumber}`);
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Calibri", bold: false, size: 11 };
        changeColor(cell, value.diasemana, "P");
      }
      if (publicadores.length == 3) {
        worksheetOut.addRow([
          value.ponto,
          publicadores[0][i],
          publicadores[1][i],
          "",
          publicadores[2][i],
        ]);
        lastRowNumber = worksheetOut.lastRow.number;
        worksheetOut.mergeCells(`C${lastRowNumber}:D${lastRowNumber}`);
        let row = worksheetOut.getRow(lastRowNumber);
        row.height = 30;

        let cell = worksheetOut.getCell(`C${lastRowNumber}`);
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.font = { name: "Calibri", bold: false, size: 11 };
        changeColor(cell, value.diasemana, "H");
        cell = worksheetOut.getCell(`B${lastRowNumber}`);
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.font = { name: "Calibri", bold: false, size: 11 };
        changeColor(cell, value.diasemana, "H");
        cell = worksheetOut.getCell(`E${lastRowNumber}`);
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.font = { name: "Calibri", bold: false, size: 11 };
        changeColor(cell, value.diasemana, "H");
      }
    }

    lastRowNumber = worksheetOut.lastRow.number;
    worksheetOut.mergeCells(`A${lastRowNumber}:A${lastRowNumber - 1}`);
    mergedCell = worksheetOut.getCell(`A${lastRowNumber}`);
    mergedCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    mergedCell.font = { name: "Calibri", bold: true, size: 11 };
    changeColor(mergedCell, value.diasemana, "P");

    // Adiciona uma linha em branco entre os conjuntos de dados
    worksheetOut.addRow([]);
  });
  worksheetOut.getColumn("A").width = 6.72;
  worksheetOut.getColumn("B").width = 13.7;
  worksheetOut.getColumn("C").width = 11.7;
  worksheetOut.getColumn("D").width = 4.22;
  worksheetOut.getColumn("E").width = 14.7;
  await workbookOut.xlsx.writeFile(writeFilePath);
}

class Line {
  constructor(dia, diasemana, ponto, periodo, publicador) {
    const day = new Date(dia).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    this.dia = dia;
    this.diasemana = diasemana.at(0).toUpperCase() + diasemana.slice(1);
    this.ponto = ponto;
    this.periodo = periodo;
    this.publicador = publicador;
    this.diaFormatado = day;
  }
}

class LineMap {
  constructor(dia, diasemana, ponto, diaFormatado) {
    this.dia = dia;
    this.diasemana = diasemana;
    this.ponto = ponto;
    this.periodo = new Map();
    this.diaFormatado = diaFormatado;
  }
}

class Lines {
  constructor() {
    this.lines = new Map();
  }

  push(line) {
    const key =
      line.dia.toLocaleDateString("pt-BR", { timeZone: "UTC" }) +
      "---" +
      line.ponto;
    const lineMap = new LineMap(
      line.dia,
      line.diasemana,
      line.ponto,
      line.diaFormatado
    );
    if (!this.lines.has(key)) {
      this.lines.set(key, lineMap);
      this.lines.get(key).periodo.set(line.periodo, []);
      this.lines.get(key).periodo.get(line.periodo).push(line.publicador);
    } else {
      if (!this.lines.get(key).periodo.has(line.periodo))
        this.lines.get(key).periodo.set(line.periodo, []);
      this.lines.get(key).periodo.get(line.periodo).push(line.publicador);
    }
  }
}

// // Replace 'path_to_your_file.xlsx' and 'new_file_path.xlsx' with actual file paths
const readFilePath = "Report.xlsx";
const writeFilePath = "CarrinhoFormatado.xlsx";
//
// // Call the function
readAndWriteExcel(readFilePath, writeFilePath).catch(console.error);
