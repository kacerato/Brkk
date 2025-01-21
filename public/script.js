document.addEventListener('DOMContentLoaded', function() {
    const statsContainer = document.getElementById('stats-container');
    
    // Adiciona um indicador de carregamento
    function showLoading() {
        statsContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p>Carregando estatísticas...</p>
            </div>
        `;
    }

    // Mostra mensagem de erro
    function showError(message) {
        statsContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: red;">
                <p>Erro: ${message}</p>
                <button onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
    }

    // Função principal para buscar estatísticas
    async function fetchStats() {
        showLoading();
        
        try {
            // Fazendo a requisição direta ao site da Kings League
            const response = await fetch('https://kingsleague.pro/en/espana/stats/goals-grouped', {
                method: 'GET',
                headers: {
                    'Accept': 'text/html',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar os dados');
            }

            const html = await response.text();
            
            // Criar um DOM parser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Encontrar a tabela de estatísticas
            const rows = doc.querySelectorAll('table tbody tr');
            const players = [];

            rows.forEach(row => {
                const columns = row.querySelectorAll('td');
                if (columns.length >= 4) {
                    const name = columns[1].textContent.trim();
                    const goals = parseInt(columns[2].textContent.trim()) || 0;
                    const shootoutGoals = parseInt(columns[3].textContent.trim()) || 0;
                    
                    // Cálculo do score
                    const score = 7 + (goals * 0.5) + (shootoutGoals * 0.7);

                    players.push({
                        name,
                        goals,
                        shootoutGoals,
                        score
                    });
                }
            });

            if (players.length === 0) {
                throw new Error('Nenhum dado encontrado');
            }

            displayStats(players);
            console.log('Dados atualizados com sucesso:', players);

        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            showError('Não foi possível carregar as estatísticas. Por favor, tente novamente mais tarde.');
        }
    }

    // Função para exibir as estatísticas
    function displayStats(players) {
        // Limpa o container
        statsContainer.innerHTML = '';

        // Ordena os jogadores por gols (do maior para o menor)
        players.sort((a, b) => b.goals - a.goals);

        // Cria os cards dos jogadores
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

        // Adiciona timestamp da última atualização
        const updateInfo = document.createElement('div');
        updateInfo.className = 'update-info';
        updateInfo.innerHTML = `
            <p>Última atualização: ${new Date().toLocaleString('pt-BR')}</p>
        `;
        statsContainer.appendChild(updateInfo);
    }

    // Função para iniciar o processo de atualização
    function startUpdates() {
        // Primeira busca
        fetchStats();

        // Atualiza a cada 5 minutos
        setInterval(fetchStats, 300000);
    }

    // Adiciona tratamento de erros global
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.error('Erro global:', error);
        showError('Ocorreu um erro inesperado. Por favor, recarregue a página.');
        return false;
    };

    // Inicia o processo de atualização
    startUpdates();
});