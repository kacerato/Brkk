document.addEventListener('DOMContentLoaded', function() {
  const statsContainer = document.getElementById('stats-container');

  function showLoading() {
    statsContainer.innerHTML = `
            <div class="loading">
                <p>Carregando estatísticas...</p>
            </div>
        `;
  }

  function showError(message, details = '') {
    statsContainer.innerHTML = `
            <div class="error">
                <p>Erro: ${message}</p>
                ${details ? `<p>Detalhes: ${details}</p>` : ''}
                <button onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
  }

  async function fetchStats() {
    showLoading();

    try {
      const response = await fetch('http://localhost:3000/api/stats');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${response.statusText}: ${errorData.error}`);
      }

      const players = await response.json();

      if (!Array.isArray(players) || players.length === 0) {
        throw new Error('Nenhum dado encontrado');
      }

      displayStats(players);
      console.log('Dados atualizados com sucesso:', players);

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      showError('Não foi possível carregar as estatísticas.', error.message);
    }
  }

  function displayStats(players) {
    statsContainer.innerHTML = '';

    players.sort((a, b) => b.goals - a.goals);

    players.forEach(player => {
      const playerCard = document.createElement('div');
      playerCard.className = 'player-card';
      playerCard.innerHTML = `
                <h2>${player.name}</h2>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Shootout Score:</span>
                        <span class="stat-value">${player.score.toFixed(1)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Gols:</span>
                        <span class="stat-value">${player.goals}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Gols de Shootout:</span>
                        <span class="stat-value">${player.shootoutGoals}</span>
                    </div>
                </div>
            `;
      statsContainer.appendChild(playerCard);
    });

    const updateInfo = document.createElement('div');
    updateInfo.className = 'update-info';
    updateInfo.innerHTML = `
            <p>Última atualização: ${new Date().toLocaleString('pt-BR')}</p>
        `;
    statsContainer.appendChild(updateInfo);
  }

  function startUpdates() {
    fetchStats();
    setInterval(fetchStats, 300000);
  }

  window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Erro global:', error);
    showError('Ocorreu um erro inesperado.', msg);
    return false;
  };

  startUpdates();
});