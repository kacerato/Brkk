document.addEventListener('DOMContentLoaded', function() {
  const statsContainer = document.getElementById('stats-container');

  function fetchStats() {
    axios.get('https://kingsleague.pro/en/espana/stats/goals-grouped')
      .then(response => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, 'text/html');
        const players = [];

        doc.querySelectorAll('.player-stats-table tbody tr').forEach(row => {
          const name = row.querySelector('td:nth-child(2)').textContent.trim();
          const goals = parseInt(row.querySelector('td:nth-child(3)').textContent.trim(), 10);
          const shootoutGoals = parseInt(row.querySelector('td:nth-child(4)').textContent.trim(), 10);

          // As we don't have direct access to assists, we'll use a placeholder value
          const assists = 0;

          // Calculate a simple score based on goals and shootout goals
          const score = 7 + (goals * 0.5) + (shootoutGoals * 0.7);

          players.push({ name, goals, assists, shootoutGoals, score });
        });

        displayStats(players);
      })
      .catch(error => {
        console.error('Error fetching stats:', error);
        statsContainer.innerHTML = '<p>Erro ao carregar estatísticas. Por favor, tente novamente mais tarde.</p>';
      });
  }

  function displayStats(players) {
    statsContainer.innerHTML = '';
    players.forEach(player => {
      const playerCard = document.createElement('div');
      playerCard.className = 'player-card';
      playerCard.innerHTML = `
                <h2>${player.name}</h2>
                <p>Shootout Score: ${player.score.toFixed(1)}</p>
                <p>Gols: ${player.goals}</p>
                <p>Gols de Shootout: ${player.shootoutGoals}</p>
            `;
      statsContainer.appendChild(playerCard);
    });
  }

  // Fetch stats immediately and then every minute
  fetchStats();
  setInterval(fetchStats, 60000);
});