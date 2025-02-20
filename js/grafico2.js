let chartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log("🔄 Carregando dados para o Gráfico...");

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

  popularSelect('select-coluna', colunas); // Permite escolher qualquer coluna

  // Botão para gerar o gráfico
  document.getElementById('btn-gerar').addEventListener('click', () => {
    console.log("📌 Botão 'Gerar Gráfico' clicado.");

    const coluna = document.getElementById('select-coluna').value;
    console.log("🔹 Coluna selecionada:", coluna);

    if (!coluna) {
      alert('❌ Selecione uma coluna para gerar o gráfico.');
      return;
    }

    const dadosFiltrados = prepararDadosPizza(dados, coluna);
    console.log("📊 Dados filtrados:", dadosFiltrados);

    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = document.getElementById('meuGrafico').getContext('2d');

    // Lista de cores para maior diversidade
    const cores = [
      '#1B4F72', // Azul Escuro
      '#78281F', // Vermelho Escuro
      '#145A32', // Verde Escuro
      '#7E5109', // Laranja Escuro
      '#4A235A', // Roxo Escuro
      '#873600', // Marrom Escuro
      '#186A3B', // Verde mais Escuro
      '#1F618D', // Azul Escuro Médio
      '#922B21', // Vermelho mais Escuro
      '#6C3483', // Roxo mais Escuro
      '#0E6251', // Verde Petróleo
      '#A04000', // Laranja Queimado
      '#2C3E50', // Cinza Azulado Escuro
      '#117A65', // Verde Profundo
      '#9A7D0A'  // Amarelo Mostarda Escuro
    ];
    
    // Garante que os índices das cores não ultrapassem o número disponível
    const backgroundColors = dadosFiltrados.labels.map((_, i) => cores[i % cores.length]);
    const borderColors = backgroundColors.map(color => color.replace(/,\s*\d+\)/, ", 0.8)")); // Adiciona bordas escuras
    
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: dadosFiltrados.labels,
        datasets: [{
          data: dadosFiltrados.values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverOffset: 15, // Destaca fatia ao passar o mouse
          offset: dadosFiltrados.values.map(() => 30) // Aplica separação fixa para todas as fatias
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              generateLabels: function (chart) {
                return chart.data.labels.map((label, index) => {
                  return {
                    text: label,
                    fillStyle: chart.data.datasets[0].backgroundColor[index],
                    hidden: chart.data.datasets[0].data[index] === null,
                    datasetIndex: 0,
                    index: index
                  };
                }).filter(label => label.text !== ""); // Remove itens ocultos da legenda
              }
            },
            onClick: (e, legendItem, legend) => {
              const dataset = legend.chart.data.datasets[0];
              const index = legendItem.index;
    
              if (dataset.data[index] !== null) {
                dataset.data[index] = null; // Oculta fatia
                legend.chart.data.labels[index] = ""; // Remove legenda
              } else {
                dataset.data[index] = dadosFiltrados.values[index]; // Reexibe fatia
                legend.chart.data.labels[index] = dadosFiltrados.labels[index]; // Reexibe legenda
              }
    
              legend.chart.update();
            }
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const value = tooltipItem.raw;
                return value !== null ? `${tooltipItem.label}: ${value}%` : '';
              }
            }
          },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 14 },
            formatter: (value) => (value !== null ? value + '%' : '')
          }
        }
      },
      plugins: [ChartDataLabels]
    });
    

    console.log("✅ Gráfico gerado com sucesso!");
  });

  // Botão para salvar o gráfico como imagem
  document.getElementById('btn-salvar').addEventListener('click', () => {
    console.log("📌 Salvando gráfico como imagem...");

    const canvas = document.getElementById('meuGrafico');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'grafico.png';
    link.click();

    console.log("✅ Gráfico salvo como imagem!");
  });

  // Botão para limpar os filtros
  document.getElementById('btn-limpar').addEventListener('click', () => {
    console.log("🧹 Botão 'Limpar' clicado.");
    document.getElementById('select-coluna').selectedIndex = 0;

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
      console.log("✅ Gráfico limpo.");
    }
  });
});
