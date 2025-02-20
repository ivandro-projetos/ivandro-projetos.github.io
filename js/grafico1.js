// js/grafico1.js

let chartInstance = null; // variável global para guardar a instância do gráfico

document.addEventListener('DOMContentLoaded', async () => {
  const dados = await carregarDadosCSV();
  if (!dados || dados.length === 0) {
    console.error('Não há dados disponíveis para processamento.');
    return;
  }

  // Extrai as colunas a partir do primeiro registro do CSV
  const colunas = Object.keys(dados[0]);
  popularSelect('select-coluna1', colunas);
  popularSelect('select-coluna2', colunas);

  // Botão para gerar o gráfico
  document.getElementById('btn-gerar').addEventListener('click', () => {
    const coluna1 = document.getElementById('select-coluna1').value;
    const coluna2 = document.getElementById('select-coluna2').value;

    if (coluna1 === coluna2) {
      alert('Selecione colunas diferentes para comparação.');
      return;
    }

    const dadosFiltrados = prepararDados(dados, coluna1, coluna2);

    // Se já existir um gráfico, destrói antes de criar um novo
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = document.getElementById('meuGrafico').getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dadosFiltrados.labels,
        datasets: [{
          label: `${coluna1} ${coluna2}`,
          data: dadosFiltrados.values,
          backgroundColor: 'rgba(0, 123, 255, 0.7)',
          borderColor: 'rgba(0, 0, 0, 0.3)',
          borderWidth: 2,
          barPercentage: 0.8,
          categoryPercentage: 0.5,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { 
            beginAtZero: true,
            grid: {
              display: true,
              color: "rgba(0,0,0,0.1)"
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            titleColor: "#fff",
            bodyColor: "#fff"
          }
        }
      }
    });
    
    
  });

  // Botão para limpar os filtros
  document.getElementById('btn-limpar').addEventListener('click', () => {
    // Retorna os selects para a posição inicial (por exemplo, primeiro item)
    const selectColuna1 = document.getElementById('select-coluna1');
    const selectColuna2 = document.getElementById('select-coluna2');
    selectColuna1.selectedIndex = 0;
    selectColuna2.selectedIndex = 0;

    // Se desejar, destrua o gráfico atual
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null; // redefine a variável
    }
  });
});
