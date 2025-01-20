const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.static('public'));

app.get('/api/stats', async (req, res) => {
    try {
        const response = await axios.get('https://kingsleague.pro/en/espana/stats/goals-grouped');
        const $ = cheerio.load(response.data);
        const players = [];

        $('.player-stats-table tbody tr').each((i, elem) => {
            const name = $(elem).find('td:nth-child(2)').text().trim();
            const goals = parseInt($(elem).find('td:nth-child(3)').text().trim(), 10);
            const shootoutGoals = parseInt($(elem).find('td:nth-child(4)').text().trim(), 10);
            
            const score = 7 + (goals * 0.5) + (shootoutGoals * 0.7);

            players.push({ name, goals, shootoutGoals, score });
        });

        res.json(players);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
