// js/util.js

// Função para carregar os dados do arquivo CSV
async function carregarDadosCSV() {
  try {
    const response = await fetch('dados/DadosOrganizados.csv');
    if (!response.ok) {
      throw new Error('Erro ao carregar os dados CSV.');
    }
    
    // Obtém o arrayBuffer para decodificar manualmente
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    let csvText = decoder.decode(arrayBuffer);
    console.log("CSV decodificado:", csvText);
    
    // Remova o BOM, se existir (apenas se necessário)
    csvText = csvText.replace(/^\uFEFF/, '');
    console.log("CSV após remoção do BOM:", csvText);
    
    return parseCSV(csvText);
  } catch (error) {
    console.error('Falha ao carregar os dados:', error);
  }
}



// Função simples para converter CSV em array de objetos
function parseCSV(csvText) {
  console.log("📌 Iniciando o parsing do CSV");

  // Ajuste para considerar o \r opcional no Windows, se necessário
  const linhas = csvText.split(/\r?\n/);  
  if (linhas.length < 2) {
    console.warn("❌ CSV sem dados suficientes.");
    return [];
  }

  // Detecta separador ("," ou ";") e divide corretamente
  const delimitador = linhas[0].includes(";") ? ";" : ",";
  const cabecalhos = linhas[0].split(delimitador).map(h => h.trim());
  
  const dados = [];
  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue; // Ignora linhas vazias
    
    const valores = linha.split(delimitador).map(v => v.trim());
    const obj = {};

    cabecalhos.forEach((cab, index) => {
      obj[cab] = valores[index] || ""; // Evita valores indefinidos
    });

    dados.push(obj);
  }

  console.log("✅ CSV processado corretamente:", dados);
  return dados;
}



// Função para popular um select com os nomes das colunas
function popularSelect(selectId, colunas) {
  const select = document.getElementById(selectId);
  colunas.forEach(col => {
    const option = document.createElement('option');
    option.value = col;
    option.textContent = col;
    select.appendChild(option);
  });
}

// Função para preparar os dados para o gráfico
// Este exemplo realiza uma contagem simples dos valores da coluna selecionada
function prepararDados(dados, coluna1, coluna2) {
  const mapValores = {};

  dados.forEach(item => {
    let chave = item[coluna1];
    
    // Verifica se é uma data (formato YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(chave)) {
      chave = chave.substring(0, 4); // Extrai apenas o ano
    }

    if (mapValores[chave]) {
      mapValores[chave] += 1;
    } else {
      mapValores[chave] = 1;
    }
  });

  return {
    labels: Object.keys(mapValores),
    values: Object.values(mapValores)
  };
}



function prepararDadosPizza(dados, coluna) {
  console.log(`📊 Processando dados para a coluna: ${coluna}`);

  if (!dados || dados.length === 0) {
    console.warn("❌ Nenhum dado recebido.");
    return { labels: [], values: [] };
  }

  const contagem = {};

  // Verifica se a coluna existe no conjunto de dados
  if (!Object.keys(dados[0]).includes(coluna)) {
    console.warn(`❌ Coluna '${coluna}' não encontrada no CSV.`);
    return { labels: [], values: [] };
  }

  // Conta apenas os valores reais da coluna selecionada
  dados.forEach(item => {
    if (!item[coluna]) return; // Se a chave da coluna não existir, ignora

    let valor = item[coluna]?.trim(); // Remove espaços extras

    // Filtra valores inválidos
    if (valor && valor !== "-" && valor !== "N/A" && valor !== "") { 
      contagem[valor] = (contagem[valor] || 0) + 1;
    }
  });

  if (Object.keys(contagem).length === 0) {
    console.warn("❌ Nenhum dado válido encontrado.");
    return { labels: [], values: [] };
  }

  // Converte os valores em porcentagem
  const total = Object.values(contagem).reduce((a, b) => a + b, 0);
  let dadosOrdenados = Object.entries(contagem)
    .map(([label, count]) => ({ label, value: (count / total * 100).toFixed(1) }))
    .sort((a, b) => a.value - b.value); // 🔥 Ordena da menor para a maior porcentagem

  const labels = dadosOrdenados.map(item => item.label);
  const values = dadosOrdenados.map(item => item.value);

  console.log("📊 Dados processados e ordenados:", { labels, values });
  return { labels, values };
}
