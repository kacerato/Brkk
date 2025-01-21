document.addEventListener("DOMContentLoaded", () => {
  const statsContainer = document.getElementById("stats-container")

  function showLoading() {
    statsContainer.innerHTML = `
            <div class="loading">
                <p>Carregando estatísticas...</p>
            </div>
        `
  }

  function showError(message) {
    statsContainer.innerHTML = `
            <div class="error">
                <p>Erro: ${message}</p>
                <button onclick="location.reload()">Tentar Novamente</button>
            </div>
        `
  }

  async function fetchStats() {
    showLoading()

    try {
      const response = await fetch("http://localhost:3000/api/stats")

      if (!response.ok) {
        throw new Error("Falha ao carregar os dados")
      }

      const players = await response.json()

      if (!Array.isArray(players) || players.length === 0) {
        throw new Error("Nenhum dado encontrado")
      }

      displayStats(players)
      console.log("Dados atualizados com sucesso:", players)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      showError("Não foi possível carregar as estatísticas. Por favor, tente novamente mais tarde.")
    }
  }

  function displayStats(players) {
    statsContainer.innerHTML = ""

    // Ordena os jogadores por gols
    players.sort((a, b) => b.goals - a.goals)

    // Cria os cards dos jogadores
    players.forEach((player) => {
      const playerCard = document.createElement("div")
      playerCard.className = "player-card"
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
            `
      statsContainer.appendChild(playerCard)
    })

    // Adiciona informação de última atualização
    const updateInfo = document.createElement("div")
    updateInfo.className = "update-info"
    updateInfo.innerHTML = `
            <p>Última atualização: ${new Date().toLocaleString("pt-BR")}</p>
        `
    statsContainer.appendChild(updateInfo)
  }

  // Inicia as atualizações
  function startUpdates() {
    fetchStats()
    setInterval(fetchStats, 300000) // Atualiza a cada 5 minutos
  }

  // Tratamento de erros global
  window.onerror = (msg, url, lineNo, columnNo, error) => {
    console.error("Erro global:", error)
    showError("Ocorreu um erro inesperado. Por favor, recarregue a página.")
    return false
  }

  // Inicia o processo de atualização
  startUpdates()
})

