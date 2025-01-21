const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/api/stats', async (req, res) => {
  try {
    console.log('Iniciando requisição para Kings League...');
    const response = await axios.get('https://kingsleague.pro/en/espana/stats/goals-grouped', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    console.log('Resposta recebida. Status:', response.status);
    const $ = cheerio.load(response.data);
    const players = [];

    console.log('Iniciando extração de dados...');
    $('.player-stats-table tbody tr').each((i, elem) => {
      const name = $(elem).find('td:nth-child(2)').text().trim();
      const goals = parseInt($(elem).find('td:nth-child(3)').text().trim()) || 0;
      const shootoutGoals = parseInt($(elem).find('td:nth-child(4)').text().trim()) || 0;

      const score = 7 + (goals * 0.5) + (shootoutGoals * 0.7);

      players.push({
        name,
        goals,
        shootoutGoals,
        score
      });
    });

    console.log(`Extração concluída. ${players.length} jogadores encontrados.`);

    if (players.length === 0) {
      throw new Error('Nenhum jogador encontrado na página');
    }

    res.json(players);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error.message);
    if (error.response) {
      console.error('Detalhes da resposta:', error.response.status, error.response.statusText);
    }
    res.status(500).json({ error: 'Falha ao buscar estatísticas', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});