const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/tcmb-table", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto("https://evds2.tcmb.gov.tr/index.php?/evds/portlet/K24NEG9DQ1s%3D/tr", {
      waitUntil: "networkidle2",
      timeout: 0,
    });

    await page.waitForSelector("#gridContainer2926 table");

    const rows = await page.evaluate(() => {
      const table = document.querySelector("#gridContainer2926 table");
      if (!table) return [];

      return Array.from(table.rows).map(row => {
        return Array.from(row.cells).map(cell => cell.innerText.trim());
      });
    });

    await browser.close();

    res.json({
      success: true,
      rowCount: rows.length,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("TCMB Puppeteer API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
