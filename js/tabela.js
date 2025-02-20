document.addEventListener('DOMContentLoaded', async () => {
    console.log("🔄 Carregando dados para a tabela...");

    const dados = await carregarDadosCSV();
    if (!dados || dados.length === 0) {
        console.error('❌ Nenhum dado disponível.');
        return;
    }

    console.log("✅ Dados carregados:", dados);

    // Extrai todas as colunas do CSV e preenche o select
    const colunas = Object.keys(dados[0]);
    console.log("📊 Colunas detectadas:", colunas);

    if (colunas.length === 0) {
        console.error("❌ Nenhuma coluna encontrada no CSV.");
        return;
    }

    popularSelect('select-coluna', colunas);

    // Evento para filtrar e exibir os dados
    document.getElementById('btn-filtrar').addEventListener('click', () => {
        console.log("📌 Botão 'Filtrar' clicado.");

        const colunaSelecionada = document.getElementById('select-coluna').value;
        console.log("🔹 Coluna selecionada:", colunaSelecionada);

        if (!colunaSelecionada) {
            alert('❌ Selecione uma coluna para exibir a tabela.');
            return;
        }

        gerarTabela(dados, colunaSelecionada);
    });
});

// Função para gerar a tabela com base na coluna selecionada
function gerarTabela(dados, coluna) {
    const tabelaHead = document.getElementById('tabela-head');
    const tabelaBody = document.getElementById('tabela-body');

    // Limpa a tabela
    tabelaHead.innerHTML = "";
    tabelaBody.innerHTML = "";

    // Cabeçalho da tabela com 3 colunas: Valor | Repetições | Porcentagem
    const headers = ["Age", "Effectifs", "Pourcentage (%)"];
    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tabelaHead.appendChild(th);
    });

    // Contagem de valores únicos
    const contagem = {};
    dados.forEach(item => {
        if (item[coluna] && item[coluna].trim() !== "") { // Filtra vazios
            let valor = item[coluna].trim();

            // Converte valores numéricos corretamente para evitar ".0"
            if (!isNaN(valor)) {
                valor = Number(valor); // Converte para número
                if (valor % 1 === 0) {
                    valor = parseInt(valor); // Remove decimal se for inteiro
                }
            }

            contagem[valor] = (contagem[valor] || 0) + 1;
        }
    });

    // Calcula total de valores para porcentagem
    const total = Object.values(contagem).reduce((a, b) => a + b, 0);

    // Popula a tabela com os dados filtrados e processados
    Object.entries(contagem).forEach(([valor, qtd]) => {
        const tr = document.createElement('tr');

        const tdValor = document.createElement('td');
        tdValor.textContent = valor;

        const tdQtd = document.createElement('td');
        tdQtd.textContent = qtd;

        const tdPorcentagem = document.createElement('td');
        tdPorcentagem.textContent = ((qtd / total) * 100).toFixed(1) + "%";

        tr.appendChild(tdValor);
        tr.appendChild(tdQtd);
        tr.appendChild(tdPorcentagem);

        tabelaBody.appendChild(tr);
    });

    // Linha final com totalizadores
    const trTotal = document.createElement('tr');
    trTotal.style.fontWeight = "bold";

    const tdTotalLabel = document.createElement('td');
    tdTotalLabel.textContent = "Total";
    
    const tdTotalQtd = document.createElement('td');
    tdTotalQtd.textContent = total;

    const tdTotalPorcentagem = document.createElement('td');
    tdTotalPorcentagem.textContent = "100%";

    trTotal.appendChild(tdTotalLabel);
    trTotal.appendChild(tdTotalQtd);
    trTotal.appendChild(tdTotalPorcentagem);

    tabelaBody.appendChild(trTotal);

    console.log("✅ Tabela gerada com sucesso!");
}

document.getElementById('btn-salvar-tabela').addEventListener('click', () => {
    const tabela = document.getElementById('tabela-container');

    html2canvas(tabela, {
        scale: 3, // Aumenta a qualidade da imagem
        backgroundColor: null, // Fundo transparente
        logging: false,
        useCORS: true
    }).then(canvas => {
        let link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "tabela-dados.png";
        link.click();
    });
});
