const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors'); 
const app = express();

app.use(cors()); // Permite la comunicación con tu index.html
const PORT = process.env.PORT || 3000;

app.get('/check/:id', async (req, res) => {
    const playerID = req.params.id;
    if (!playerID) return res.status(400).json({ success: false, error: "Falta ID" });

    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process'],
            headless: "new"
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        // Navegación a Pagostore
        await page.goto('https://pagostore.com/app/100067/login', { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector('input[name="player_id"]');
        await page.type('input[name="player_id"]', playerID);
        await page.click('button[type="submit"]');

        // Esperar el nombre del jugador
        await page.waitForSelector('.player-name', { timeout: 15000 });
        const nickname = await page.$eval('.player-name', el => el.innerText);

        res.json({ success: true, nickname: nickname.trim() });
    } catch (error) {
        res.status(500).json({ success: false, message: "ID no encontrado o sitio lento" });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => console.log(`API activa en puerto ${PORT}`));
