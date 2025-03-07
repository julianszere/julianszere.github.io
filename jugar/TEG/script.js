let chart = null;
let attackerData = {};
let defenderData = {};
let probabilityData = {};
let showingAttacker = true;

window.onload = () => {
  setupEventListeners();
  Promise.all([
    fetch('./attacker_distributions.csv').then(response => response.text()),
    fetch('./defender_distributions.csv').then(response => response.text()),
    fetch('./probabilities.csv').then(response => response.text())
  ])
    .then(([attackerText, defenderText, probText]) => {
      parseCSV(attackerText, attackerData);
      parseCSV(defenderText, defenderData);
      parseProbabilitiesCSV(probText, probabilityData);
      updateChart();
    })
    .catch(error => {
      document.getElementById('last-probability').textContent = `Error: ${error.message}`;
    });
};

function parseCSV(csvText, dataStore) {
  const rows = csvText.trim().split('\n');
  const headers = rows[0].split(',').map(h => h.trim());
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue;
    const cols = rows[i].split(',').map(c => c.trim());
    const loss = parseInt(cols[0]);
    for (let j = 1; j < cols.length; j++) {
      const key = headers[j];
      if (!dataStore[key]) dataStore[key] = {};
      dataStore[key][loss] = parseFloat(cols[j]) || 0;
    }
  }
}

function parseProbabilitiesCSV(csvText, dataStore) {
  const rows = csvText.trim().split('\n');
  rows.forEach((row, attacker) => {
    const probs = row.split(',').map(p => parseFloat(p));
    dataStore[attacker] = {};
    probs.forEach((prob, defender) => {
      dataStore[attacker][defender] = prob;
    });
  });
}

function setupEventListeners() {
  document.getElementById('attacker').addEventListener('input', updateChart);
  document.getElementById('defender').addEventListener('input', updateChart);
  const toggleSwitch = document.getElementById('toggleSwitch');
  toggleSwitch.addEventListener('change', () => {
    showingAttacker = !toggleSwitch.checked;
    updateChart();
  });
}

function updateChart() {
  const attacker = parseInt(document.getElementById('attacker').value) || 0;
  const defender = parseInt(document.getElementById('defender').value) || 0;
  const lastProbElement = document.getElementById('last-probability');
  const probabilityContainer = document.querySelector('.probability-container');
  const chartContainer = document.querySelector('.chart-container');

  if (attacker < 2 || defender < 1 || isNaN(attacker) || isNaN(defender)) {
    lastProbElement.textContent = 'Ingrese el número de ejércitos atacantes y defensores';
    probabilityContainer.style.display = 'none';
    chartContainer.style.display = 'none';
    if (chart) chart.destroy();
    return;
  }

  const key = `${attacker}-${defender}`;
  const attData = attackerData[key];
  const defData = defenderData[key];
  const totalProb = probabilityData[attacker]?.[defender];

  if (!attData || !defData || totalProb === undefined) {
    lastProbElement.textContent = `No hay datos para ${attacker} vs ${defender}`;
    probabilityContainer.style.display = 'block';
    chartContainer.style.display = 'none';
    if (chart) chart.destroy();
    return;
  }

  const data = showingAttacker ? attData : defData;
  const labelPrefix = showingAttacker ? 'atacante' : 'defensor';
  const color = showingAttacker ? '#0066cc' : '#cc0000';
  const borderColor = showingAttacker ? '#004d99' : '#990000';
  const winProb = showingAttacker ? totalProb : 1 - totalProb;

  const allLosses = Object.keys(data).map(Number).sort((a, b) => a - b);
  let maxLoss = -1;
  for (const loss of allLosses) {
    if (data[loss] > 0) maxLoss = loss;
  }
  const filteredLosses = allLosses.filter(loss => loss <= maxLoss);
  const probs = filteredLosses.map(loss => data[loss]);
  const totalDistProb = probs.reduce((sum, p) => sum + p, 0);
  const normalizedProbs = probs.map(p => p / totalDistProb || 0);

  lastProbElement.textContent = `${(winProb * 100).toFixed(2)}%`;
  lastProbElement.style.backgroundColor = showingAttacker ? '#0066cc' : '#cc0000';
  lastProbElement.style.color = '#fff';
  probabilityContainer.style.display = 'flex';
  chartContainer.style.display = 'block';

  const ctx = document.getElementById('barChart').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: filteredLosses,
      datasets: [{
        label: `Pérdidas del ${labelPrefix}`,
        data: normalizedProbs,
        backgroundColor: color,
        borderColor: borderColor,
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.9
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { 
          title: { display: true, text: `Ejércitos perdidos por el ${labelPrefix}` }, 
          ticks: { font: { size: 10 }, color: '#000' },
          grid: { color: 'rgba(0, 0, 0, 0.3)' }
        },
        y: { 
          title: { display: true, text: 'Probabilidad' }, 
          ticks: { font: { size: 10 }, color: '#000' },
          grid: { color: 'rgba(0, 0, 0, 0.3)' },
          beginAtZero: true
        }
      },
      plugins: { legend: { display: false } },
      devicePixelRatio: window.devicePixelRatio
    }
  });
}