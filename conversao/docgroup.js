const XLSX = require('xlsx');

// Ler o arquivo Excel
const workbook = XLSX.readFile('Report.xlsx');
const sheetName = workbook.SheetNames[0]; // Pressupondo que os dados estão na primeira planilha
const worksheet = workbook.Sheets[sheetName];

// Converter a planilha em JSON
const data = XLSX.utils.sheet_to_json(worksheet, {raw: false});

// Processar os dados para agrupar 'Publicador'
const groupedData = {};

// Percorrer cada linha
data.forEach(row => {
    // Criar uma chave com base nas colunas de agrupamento
    const key = `${row['Escala R']}_${row['Dia']}_${row['Dia semana']}_${row['Ponto']}_${row['Período']}`;

    if (!groupedData[key]) {
        // Inicializar a entrada sem a coluna 'Sexo'
        groupedData[key] = {
            'Escala R': row['Escala R'],
            'Dia': row['Dia'],
            'Dia semana': row['Dia semana'],
            'Ponto': row['Ponto'],
            'Período': row['Período'],
            'Publicador': row['Publicador']
        };
    } else {
        // Concatenar o valor de 'Publicador'
        groupedData[key]['Publicador'] += ' / ' + row['Publicador'];
    }
});

// Converter os dados agrupados de volta para um array
const outputData = Object.values(groupedData);

// Definir as colunas desejadas (cabeçalhos)
const columns = ['Escala R', 'Dia', 'Dia semana', 'Ponto', 'Período', 'Publicador'];

// Criar um novo workbook e adicionar os dados
const newWorkbook = XLSX.utils.book_new();
const newWorksheet = XLSX.utils.json_to_sheet(outputData, {header: columns});

// Formatar os cabeçalhos em negrito
const range = XLSX.utils.decode_range(newWorksheet['!ref']);
for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({r: 0, c: C});
    if (!newWorksheet[address]) continue;
    newWorksheet[address].s = {
        font: {
            bold: true
        }
    };
}

// Corrigir a formatação da coluna 'Dia' para exibir como data
for (let R = 1; R <= range.e.r; ++R) {
    const address = XLSX.utils.encode_cell({r: R, c: columns.indexOf('Dia')});
    const cell = newWorksheet[address];
    if (cell && cell.v) {
        // Tentar converter a data para o formato desejado
        const date = new Date(cell.v);
        if (!isNaN(date)) {
            cell.v = XLSX.SSF.format("dd/mm/yyyy", date);
            cell.t = 's'; // Define o tipo como string
        }
    }
}

// Adicionar a planilha ao workbook
XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');

// Escrever o novo arquivo Excel
XLSX.writeFile(newWorkbook, 'Agrupado.xlsx');
