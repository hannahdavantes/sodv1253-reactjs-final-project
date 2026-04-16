const API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

// GET /api/stocks/:symbol - current price + company profile
export const getStockDetails = async (req, res) => {
  try {
    const { symbol } = req.params;
    const sym = symbol.toUpperCase();

    const [quoteRes, profileRes] = await Promise.all([
      fetch(`${BASE_URL}/quote?symbol=${sym}&token=${API_KEY}`),
      fetch(`${BASE_URL}/stock/profile2?symbol=${sym}&token=${API_KEY}`),
    ]);

    const quote = await quoteRes.json();
    const profile = await profileRes.json();

    if ((!quote.c || quote.c === 0) && (!quote.pc || quote.pc === 0)) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.json({ quote, profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/stocks/:symbol/history - 30-day price history
export const getStockHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const sym = symbol.toUpperCase();

    const to = Math.floor(Date.now() / 1000);
    const from = to - 30 * 24 * 60 * 60; // 30 days ago

    const response = await fetch(
      `${BASE_URL}/stock/candle?symbol=${sym}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`
    );
    const data = await response.json();

    if (data.s === "no_data" || !data.t) {
      return res.json({ history: [] });
    }

    // Convert arrays to array of objects for easier use on frontend
    const history = data.t.map((timestamp, i) => ({
      date: new Date(timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      close: parseFloat(data.c[i].toFixed(2)),
    }));

    res.json({ history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/stocks/news/market - general market news
export const getMarketNews = async (req, res) => {
  try {
    const response = await fetch(
      `${BASE_URL}/news?category=general&token=${API_KEY}`
    );
    const data = await response.json();

    const news = data.slice(0, 10).map((article) => ({
      id: article.id,
      headline: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      datetime: new Date(article.datetime * 1000).toLocaleDateString(),
    }));

    res.json({ news });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/stocks/:symbol/news - related news articles
export const getStockNews = async (req, res) => {
  try {
    const { symbol } = req.params;
    const sym = symbol.toUpperCase();

    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const response = await fetch(
      `${BASE_URL}/company-news?symbol=${sym}&from=${from}&to=${to}&token=${API_KEY}`
    );
    const data = await response.json();

    // Return latest 6 articles
    const news = data.slice(0, 6).map((article) => ({
      id: article.id,
      headline: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      datetime: new Date(article.datetime * 1000).toLocaleDateString(),
    }));

    res.json({ news });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
