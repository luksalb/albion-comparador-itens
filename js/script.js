let contador = 0;
    let mapaItens = {};

    async function carregarItens() {
      const response = await fetch('https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json');
      const itens = await response.json();
      const datalist = document.getElementById('itemList');

      itens.forEach(item => {
        const nome = item.LocalizedNames?.['EN-US'];
        const id = item.UniqueName;

        if (nome && id && !id.includes('@')) {
          if (!mapaItens[nome]) {
            mapaItens[nome] = id;
            const option = document.createElement('option');
            option.value = nome;
            datalist.appendChild(option);
          }
        }
      });
    }

    async function buscarPreco() {
    const itemInput = document.getElementById("item").value;
    const cidade = document.getElementById("cidade").value;

    if (!itemInput || !cidade) return;

    salvarHistorico(itemInput);

    const url = `https://west.albion-online-data.com/api/v2/stats/history/${itemInput}?locations=${cidade}&time-scale=24`;
    const response = await fetch(url);
    const historico = await response.json();

    if (!historico.length) return alert("Sem dados para esse item.");

    adicionarGrafico(itemInput, cidade, historico);
  }

    async function adicionarGrafico() {
      const nomeInput = document.getElementById('itemInput').value.trim();
      const cidade = document.getElementById('citySelect').value;
      const itemId = mapaItens[nomeInput];

      if (!itemId) {
        alert("Item inválido. Escolha um da lista.");
        return;
      }

      const url = `https://www.albion-online-data.com/api/v2/stats/history/${itemId}?locations=${cidade}`;
      const response = await fetch(url);
      const dados = await response.json();

      if (!dados[0] || !dados[0].data || dados[0].data.length === 0) {
        alert("Dados não encontrados.");
        return;
      }

      const historico = dados[0].data;
      const labels = historico.map(d => d.timestamp.split("T")[0]);
      const avgPrices = historico.map(d => d.avg_price);
      const ultimoPreco = avgPrices[avgPrices.length - 1];
      const penultimoPreco = avgPrices[avgPrices.length - 2];
      
      // Calcular variação percentual
      let variacao = 0;
      let variacaoTexto = '';
        if (penultimoPreco && penultimoPreco > 0) {
          variacao = ((ultimoPreco - penultimoPreco) / penultimoPreco) * 100;
          const direcao = variacao >= 0 ? '🔺' : '🔻';
          const cor = variacao >= 0 ? 'green' : 'red';
          variacaoTexto = `<span style="color:${cor}; font-weight:500;">${direcao} ${variacao.toFixed(2)}%</span>`;
        }
      
      const cardId = `grafico-${contador++}`;
      const iconUrl = `https://render.albiononline.com/v1/item/${itemId}.png`;

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${iconUrl}" class="item-icon" alt="${nomeInput}" />
        <h3>${nomeInput} - ${cidade}</h3>
        <p style="margin: 0 0 10px 0; font-size: 14px;">Variação diária: ${variacaoTexto}</p>
        <canvas id="${cardId}" width="400" height="250"></canvas>
        <button class="remove-btn" onclick="this.parentElement.remove()">Remover</button>
      `;
      document.getElementById('graficos').appendChild(card);

      const ctx = document.getElementById(cardId).getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Preço Médio — Último: ¥ ' + ultimoPreco.toLocaleString(),
              data: avgPrices,
              borderColor: 'green',
              fill: false,
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: { enabled: true }
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });

      // document.getElementById('itemInput').value = '';
    }

    carregarItens();

  function alternarTema() {
    document.body.classList.toggle('dark-mode');
    const botao = document.querySelector('.tema-btn');
    botao.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
  }

  function removerTodos() {
  const container = document.getElementById('graficos');
  container.innerHTML = '';
}