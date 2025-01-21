const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/api/stats', async (req, res) => {
    try {
        const response = await axios.get('https://kingsleague.pro/en/espana/stats/goals-grouped');
        const $ = cheerio.load(response.data);
        const players = [];

        $('.player-stats-table tbody tr').each((i, elem) => {
            const name = $(elem).find('td:nth-child(2)').text().trim();
            const goals = parseInt($(elem).find('td:nth-child(3)').text().trim(), 10) || 0;
            const shootoutGoals = parseInt($(elem).find('td:nth-child(4)').text().trim(), 10) || 0;
            
            const score = 7 + (goals * 0.5) + (shootoutGoals * 0.7);

            players.push({
                name,
                goals,
                shootoutGoals,
                score
            });
        });

        res.json(players);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});