const express = require("express");
const ejs = require("ejs");
const axios = require("axios");
const { Pool } = require("pg");

// PostgreSQL client setup
const pool = new Pool({
  user: "",
  host: "",
  database: "",
  password: "",
  port: ,
});

const app = express();
app.set("view engine", "ejs");

// Fetch data from API and store in PostgreSQL
const fetchData = async () => {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const data = response.data;

    // Clear existing data
    await pool.query("DELETE FROM tickers");

    // Insert new data
    const insertQuery = `
      INSERT INTO tickers (name, last, buy, sell, volume, base_unit)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const [key, ticker] of Object.entries(data).slice(0, 10)) {
      await pool.query(insertQuery, [
        ticker.name,
        ticker.last,
        ticker.buy,
        ticker.sell,
        ticker.volume,
        ticker.base_unit,
      ]);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Fetch data and render page
app.get("/", async (req, res) => {
  await fetchData();

  try {
    const result = await pool.query("SELECT * FROM tickers");
    res.render("index", { tickers: result.rows });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.send("Error fetching data");
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
