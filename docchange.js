const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

async function populateDocxTemplate() {
    // Load the docx file as a binary
    const content = fs.readFileSync(path.resolve(__dirname, 'template.docx'), 'binary');
    const zip = new PizZip(content);

    // Create docxtemplater instance
    const doc = new Docxtemplater().loadZip(zip);

    // Read the Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.resolve(__dirname, 'export.xlsx'));

    // Get the first worksheet
    const worksheet = workbook.getWorksheet(1);

    // Prepare an object to hold the data
    const data = {};
//console.log(worksheet);
    // Iterate over all rows (excluding the header)
    let rowNumber = 1;
    let lastRow = worksheet.actualRowCount;
    for(let i = lastRow; i > 1; i--) {
        let row = worksheet.getRow(i);
       rowNumber++;
        // Do something with row

   // worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber == 2) {
           // console.log(data);
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d1`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po1`] = row.getCell('D').value;
            data[`s1`] = getDayName(mydate);
            data[`pe11`] = row.getCell('E').value;
            data[`u11`] = row.getCell('F').value;
        }
        if (rowNumber == 3) {
            data[`u12`] = row.getCell('F').value;
        }
        if (rowNumber == 4) {
            data[`pe12`] = row.getCell('E').value;
            data[`u13`] = row.getCell('F').value;
        }
        if (rowNumber == 5) {
            data[`u14`] = row.getCell('F').value;
        }
        if (rowNumber == 6) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d2`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po2`] = row.getCell('D').value;
            data[`s2`] = getDayName(mydate);
            data[`pe21`] = row.getCell('E').value;
            data[`u21`] = row.getCell('F').value;
        }
        if (rowNumber == 7) {
            data[`u22`] = row.getCell('F').value;
        }
        if (rowNumber == 8) {
            data[`pe22`] = row.getCell('E').value;
            data[`u23`] = row.getCell('F').value;
        }
        if (rowNumber == 9) {
            data[`u24`] = row.getCell('F').value;
        }
        if (rowNumber == 10) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d3`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po3`] = row.getCell('D').value;
            data[`s3`] = getDayName(mydate);
            data[`pe31`] = row.getCell('E').value;
            data[`u31`] = row.getCell('F').value;
        }
        if (rowNumber == 11) {
            data[`u32`] = row.getCell('F').value;
        }
        if (rowNumber == 12) {
            data[`pe32`] = row.getCell('E').value;
            data[`u33`] = row.getCell('F').value;
        }
        if (rowNumber == 13) {
            data[`u34`] = row.getCell('F').value;
        }
        //complete the code until d12
        if (rowNumber == 14) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d4`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po4`] = row.getCell('D').value;
            data[`s4`] = getDayName(mydate);
            data[`pe41`] = row.getCell('E').value;
            data[`u41`] = row.getCell('F').value;
        }
        if (rowNumber == 15) {
            data[`u42`] = row.getCell('F').value;
        }
        if (rowNumber == 16) {
            data[`pe42`] = row.getCell('E').value;
            data[`u43`] = row.getCell('F').value;
        }
        if (rowNumber == 17) {
            data[`u44`] = row.getCell('F').value;
        }
        if (rowNumber == 18) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d5`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po5`] = row.getCell('D').value;
            data[`s5`] = getDayName(mydate);
            data[`pe51`] = row.getCell('E').value;
            data[`u51`] = row.getCell('F').value;
        }
        if (rowNumber == 19) {
            data[`u52`] = row.getCell('F').value;
        }

        if (rowNumber == 20) {
            data[`pe52`] = row.getCell('E').value;
            data[`u53`] = row.getCell('F').value;
        }
        if (rowNumber == 21) {
            data[`u54`] = row.getCell('F').value;
        }
        if (rowNumber == 22) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d6`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po6`] = row.getCell('D').value;
            data[`s6`] = getDayName(mydate);
            data[`pe61`] = row.getCell('E').value;
            data[`u61`] = row.getCell('F').value;
        }
        if (rowNumber == 23) {
            data[`u62`] = row.getCell('F').value;
        }
        if (rowNumber == 24) {
            data[`pe62`] = row.getCell('E').value;
            data[`u63`] = row.getCell('F').value;
        }
          if (rowNumber == 25) {
            data[`u64`] = row.getCell('F').value;
          }
            if (rowNumber == 26) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d7`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po7`] = row.getCell('D').value;
            data[`s7`] = getDayName(mydate);
            data[`pe71`] = row.getCell('E').value;
            data[`u71`] = row.getCell('F').value;
            }
            if (rowNumber == 27) {
            data[`u72`] = row.getCell('F').value;

            }
            if (rowNumber == 28) {
            data[`pe72`] = row.getCell('E').value;
            data[`u73`] = row.getCell('F').value;
            }
            if (rowNumber == 29) {
            data[`u74`] = row.getCell('F').value;
            }

            if (rowNumber == 30) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d8`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po8`] = row.getCell('D').value;
            data[`s8`] = getDayName(mydate);
            data[`pe81`] = row.getCell('E').value;
            data[`u81`] = row.getCell('F').value;
            }
            if (rowNumber == 31) {
            data[`u82`] = row.getCell('F').value;

            }
            if (rowNumber == 32) {
            data[`pe82`] = row.getCell('E').value;
            data[`u83`] = row.getCell('F').value;

            }
            if (rowNumber == 33) {
            data[`u84`] = row.getCell('F').value;

            }
            if (rowNumber == 34) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d9`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po9`] = row.getCell('D').value;
            data[`s9`] = getDayName(mydate);
            data[`pe91`] = row.getCell('E').value;
            data[`u91`] = row.getCell('F').value;

            }
            if (rowNumber == 35) {
            data[`u92`] = row.getCell('F').value;

            }
            if (rowNumber == 36) {
            data[`pe92`] = row.getCell('E').value;
            data[`u93`] = row.getCell('F').value;

            }
            if (rowNumber == 37) {
            data[`u94`] = row.getCell('F').value;


            }
            if (rowNumber == 38) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d10`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po10`] = row.getCell('D').value;
            data[`s10`] = getDayName(mydate);
            data[`pe101`] = row.getCell('E').value;
            data[`u101`] = row.getCell('F').value;

            }
            if (rowNumber == 39) {
            data[`u102`] = row.getCell('F').value;

            }
            if (rowNumber == 40) {
            data[`pe102`] = row.getCell('E').value;
            data[`u103`] = row.getCell('F').value;

            }
            if (rowNumber == 41) {
            data[`u104`] = row.getCell('F').value;

            }
            if (rowNumber == 42) {
            const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
            data[`d11`] = getDayName(mydate,true) + formatDate(mydate);
            data[`po11`] = row.getCell('D').value;
            data[`s11`] = getDayName(mydate);
            data[`pe111`] = row.getCell('E').value;
            data[`u111`] = row.getCell('F').value;

            }
            if (rowNumber == 43) {
                data[`u112`] = row.getCell('F').value;

            }
            if (rowNumber == 44) {
                data[`pe112`] = row.getCell('E').value;
                data[`u113`] = row.getCell('F').value;

            }
            if (rowNumber == 45) {
                data[`u114`] = row.getCell('F').value;

            }
            if (rowNumber == 46) {
                const mydate = new Date(row.getCell('B').value.getTime() + (row.getCell('B').value.getTimezoneOffset() * 60000));
                data[`d12`] = getDayName(mydate,true) + formatDate(mydate);
                data[`po12`] = row.getCell('D').value;
                data[`s12`] = getDayName(mydate);
                data[`pe121`] = row.getCell('E').value;
                data[`u121`] = row.getCell('F').value;

            }
            if (rowNumber == 47) {
                data[`u122`] = row.getCell('F').value;

            }
            if (rowNumber == 48) {
                data[`pe122`] = row.getCell('E').value;
                data[`u123`] = row.getCell('F').value;

            }
            if (rowNumber == 49) {
                data[`u124`] = row.getCell('F').value;

            }

    }

    // Set the template variables
    doc.setData(data);

    // Apply the changes
    doc.render();

    // Write the result
    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync(path.resolve(__dirname, 'designacoes_carrinho.docx'), buf);
}

populateDocxTemplate().catch(console.error);
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
function getDayName(date, completo = false) {
    const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    if (completo) {
        return 'Data ' + days[date.getDay()] + ' ';
    }
    return days[date.getDay()].substr(0, 3);
}



