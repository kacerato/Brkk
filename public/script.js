document.addEventListener('DOMContentLoaded', function() {
    const statsContainer = document.getElementById('stats-container');
    
    function fetchStats() {
        fetch('http://localhost:3000/api/stats')
            .then(response => response.json())
            .then(players => {
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