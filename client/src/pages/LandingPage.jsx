import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { getMarketNews } from "../services/stockService";

const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "NFLX", name: "Netflix Inc." },
];

const LandingPage = () => {
  const [search, setSearch] = useState("");
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMarketNews()
      .then((data) => setNews(data.news))
      .catch(() => setNews([]))
      .finally(() => setLoadingNews(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/stocks/${search.trim().toUpperCase()}`);
  };

  const breakingNews = news[0] || null;
  const restNews = news.slice(1);

  return (
    <PageWrapper>
      {/* Hero */}
      <Hero>
        <AppName>StockApp</AppName>
        <Tagline>Your social stock monitoring platform</Tagline>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="Search a stock symbol (e.g. AAPL)"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
          />
          <SearchBtn type="submit">Search</SearchBtn>
        </SearchForm>
      </Hero>

      <Content>
        {/* Popular Stocks */}
        <Section>
          <SectionTitle>Popular Stocks</SectionTitle>
          <StocksGrid>
            {POPULAR_STOCKS.map((stock) => (
              <StockCard key={stock.symbol} to={`/stocks/${stock.symbol}`}>
                <StockSymbol>{stock.symbol}</StockSymbol>
                <StockName>{stock.name}</StockName>
              </StockCard>
            ))}
          </StocksGrid>
        </Section>

        {/* News */}
        <Section>
          <SectionTitle>Latest Market News</SectionTitle>
          {loadingNews ? (
            <p>Loading news...</p>
          ) : news.length === 0 ? (
            <p>No news available.</p>
          ) : (
            <>
              {/* Breaking news — most recent article highlighted */}
              {breakingNews && (
                <BreakingCard
                  href={breakingNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BreakingBadge>Breaking</BreakingBadge>
                  <BreakingBody>
                    {breakingNews.image && (
                      <BreakingImage
                        src={breakingNews.image}
                        alt={breakingNews.headline}
                      />
                    )}
                    <BreakingText>
                      <BreakingHeadline>
                        {breakingNews.headline}
                      </BreakingHeadline>
                      {breakingNews.summary && (
                        <BreakingSummary>
                          {breakingNews.summary}
                        </BreakingSummary>
                      )}
                      <NewsMeta>
                        {breakingNews.source} · {breakingNews.datetime}
                      </NewsMeta>
                    </BreakingText>
                  </BreakingBody>
                </BreakingCard>
              )}

              {/* Remaining news */}
              <NewsList>
                {restNews.map((article) => (
                  <NewsItem
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.image && (
                      <NewsImage src={article.image} alt={article.headline} />
                    )}
                    <NewsContent>
                      <NewsHeadline>{article.headline}</NewsHeadline>
                      <NewsMeta>
                        {article.source} · {article.datetime}
                      </NewsMeta>
                    </NewsContent>
                  </NewsItem>
                ))}
              </NewsList>
            </>
          )}
        </Section>
      </Content>
    </PageWrapper>
  );
};

export default LandingPage;

// --- Styled Components ---

const PageWrapper = styled.div``;

const Hero = styled.div`
  background: #0f172a;
  color: white;
  padding: 64px 24px;
  text-align: center;
`;

const AppName = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #f59e0b;
  margin: 0 0 8px;
`;

const Tagline = styled.p`
  font-size: 1.1rem;
  color: #94a3b8;
  margin: 0 0 32px;
`;

const SearchForm = styled.form`
  display: flex;
  justify-content: center;
  gap: 0;
  max-width: 520px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 14px 18px;
  font-size: 1rem;
  border: none;
  border-radius: 8px 0 0 8px;
  outline: none;
`;

const SearchBtn = styled.button`
  padding: 14px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #1d4ed8;
  }
`;

const Content = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 16px;
`;

const Section = styled.div`
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: #111827;
`;

const StocksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;

const StockCard = styled(Link)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 28px 24px;
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #2563eb;
  }
`;

const StockSymbol = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 6px;
`;

const StockName = styled.div`
  font-size: 1.4rem;
  color: #6b7280;
`;

const BreakingCard = styled.a`
  display: block;
  background: #fff7ed;
  border: 2px solid #f97316;
  border-radius: 12px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  margin-bottom: 24px;
  &:hover h3 {
    color: #2563eb;
  }
`;

const BreakingBadge = styled.span`
  display: inline-block;
  background: #ef4444;
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  border-radius: 4px;
  margin-bottom: 12px;
`;

const BreakingBody = styled.div`
  display: flex;
  gap: 16px;
`;

const BreakingImage = styled.img`
  width: 160px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    display: none;
  }
`;

const BreakingText = styled.div`
  flex: 1;
`;

const BreakingHeadline = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.4;
`;

const BreakingSummary = styled.p`
  font-size: 1.4rem;
  color: #374151;
  margin: 0 0 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NewsItem = styled.a`
  display: flex;
  gap: 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  text-decoration: none;
  color: inherit;
  &:hover h3 {
    color: #2563eb;
  }
`;

const NewsImage = styled.img`
  width: 90px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
`;

const NewsContent = styled.div`
  flex: 1;
`;

const NewsHeadline = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 6px;
  line-height: 1.4;
`;

const NewsMeta = styled.p`
  font-size: 1.4rem;
  color: #6b7280;
  margin: 0;
`;
