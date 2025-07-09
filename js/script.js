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
      datasets: [{
        label: 'Preço Médio — Último: ¥ ' + ultimoPreco.toLocaleString(),
        data: avgPrices,
        borderColor: 'green',
        fill: false,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
      },
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}

function adicionarTodasCidades() {
  const nomeInput = document.getElementById('itemInput').value.trim();
  const itemId = mapaItens[nomeInput];

  if (!itemId) {
    alert("Item inválido. Escolha um da lista.");
    return;
  }


  const cidades = ["Caerleon", "Martlock", "Lymhurst", "Bridgewatch", "Fort Sterling", "Thetford"];

  cidades.forEach(async cidade => {
    const url = `https://www.albion-online-data.com/api/v2/stats/history/${itemId}?locations=${cidade}`;
    const response = await fetch(url);
    const dados = await response.json();

    if (!dados[0] || !dados[0].data || dados[0].data.length === 0) return;

    const historico = dados[0].data;
    const labels = historico.map(d => d.timestamp.split("T")[0]);
    const avgPrices = historico.map(d => d.avg_price);
    const ultimoPreco = avgPrices[avgPrices.length - 1];
    const penultimoPreco = avgPrices[avgPrices.length - 2];

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
        datasets: [{
          label: 'Preço Médio — Último: ¥ ' + ultimoPreco.toLocaleString(),
          data: avgPrices,
          borderColor: 'green',
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true }
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  });
}

function removerTodos() {
  document.getElementById('graficos').innerHTML = '';
}

function alternarTema() {
  document.body.classList.toggle('dark-mode');
  const botao = document.querySelector('.tema-btn');
  botao.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function mostrarAba(id) {
  document.querySelectorAll('.aba').forEach(el => el.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');

  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const index = id === 'comparador' ? 0 : 1;
  document.querySelectorAll('.tab-btn')[index].classList.add('active');

  if (id === 'ranking') {
    carregarRanking();
  }
}

async function carregarRanking() {
  const tabela = document.querySelector('#ranking-tabela tbody');
  const loading = document.querySelector('.ranking-container .loading');
  tabela.innerHTML = '';
  loading.style.display = 'block';

  const cidades = ["Caerleon", "Martlock", "Lymhurst", "Bridgewatch", "Fort Sterling", "Thetford"];
  const response = await fetch('https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json');
  const itens = await response.json();

  const topResultados = [];

  for (const item of itens.slice(0, 100)) {
    const nome = item.LocalizedNames?.["EN-US"];
    const id = item.UniqueName;
    if (!nome || id.includes("@")) continue;

    for (const cidade of cidades) {
      const url = `https://www.albion-online-data.com/api/v2/stats/history/${id}?locations=${cidade}`;
      const r = await fetch(url);
      const dados = await r.json();

      const historico = dados[0]?.data;
      if (historico?.length >= 2) {
        const prices = historico.map(d => d.avg_price).filter(p => p > 0);
        const penultimo = prices.at(-2);
        const ultimo = prices.at(-1);
        if (penultimo && ultimo) {
          const variacao = ((ultimo - penultimo) / penultimo) * 100;
          topResultados.push({ nome, cidade, ultimo, variacao });
        }
      }
    }

    if (topResultados.length > 50) break; // performance
  }

  loading.style.display = 'none';

  topResultados
    .sort((a, b) => Math.abs(b.variacao) - Math.abs(a.variacao))
    .slice(0, 20)
    .forEach(({ nome, cidade, ultimo, variacao }) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${nome}</td>
        <td>${cidade}</td>
        <td>¥ ${ultimo.toFixed(2)}</td>
        <td style="color:${variacao >= 0 ? 'green' : 'red'}">${variacao.toFixed(2)}%</td>
      `;
      tabela.appendChild(row);
    });
}


carregarItens();
