import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import {
  getStockDetails,
  getStockHistory,
  getStockNews,
  addToWatchlist,
  addToPortfolio,
} from "../services/stockService";

const API_URL = import.meta.env.VITE_API_URL;

const StockDetailsPage = () => {
  const { symbol } = useParams();
  const { user } = useAuth();

  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Portfolio modal state
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  // Feedback messages
  const [feedback, setFeedback] = useState("");

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch stock data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [detailsData, historyData, newsData] = await Promise.all([
          getStockDetails(symbol),
          getStockHistory(symbol),
          getStockNews(symbol),
        ]);
        setStock(detailsData);
        setHistory(historyData.history);
        setNews(newsData.news);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [symbol]);

  // Socket.io chat setup
  useEffect(() => {
    socketRef.current = io(API_URL);
    socketRef.current.emit("join-stock", symbol.toUpperCase());

    socketRef.current.on("chat-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current.emit("leave-stock", symbol.toUpperCase());
      socketRef.current.disconnect();
    };
  }, [symbol]);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleAddToWatchlist = async () => {
    if (!user) return showFeedback("Please log in to add to watchlist");
    try {
      await addToWatchlist(symbol, stock?.profile?.name);
      showFeedback("Added to watchlist!");
    } catch (err) {
      showFeedback(err.message);
    }
  };

  const handleAddToPortfolio = async (e) => {
    e.preventDefault();
    if (!user) return showFeedback("Please log in to add to portfolio");
    try {
      await addToPortfolio(symbol, stock?.profile?.name, quantity, purchasePrice);
      showFeedback("Added to portfolio!");
      setShowPortfolioModal(false);
      setQuantity("");
      setPurchasePrice("");
    } catch (err) {
      showFeedback(err.message);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    if (!user) return showFeedback("Please log in to chat");

    socketRef.current.emit("chat-message", {
      symbol: symbol.toUpperCase(),
      message: chatInput,
      user: `${user.firstName} ${user.lastName}`,
    });
    setChatInput("");
  };

  if (loading) return <PageWrapper><p>Loading...</p></PageWrapper>;
  if (error) return <PageWrapper><p>Error: {error}</p></PageWrapper>;

  const { quote, profile } = stock;
  const priceChange = quote.d >= 0;

  return (
    <PageWrapper>
      {feedback && <FeedbackBanner $positive={feedback.includes("Added")}>{feedback}</FeedbackBanner>}

      {/* Stock Header */}
      <StockHeader>
        <HeaderLeft>
          {profile.logo && <Logo src={profile.logo} alt={profile.name} />}
          <div>
            <CompanyName>{profile.name || symbol.toUpperCase()}</CompanyName>
            <SymbolText>{symbol.toUpperCase()} · {profile.exchange}</SymbolText>
          </div>
        </HeaderLeft>
        <PriceBlock>
          <CurrentPrice>${quote.c?.toFixed(2)}</CurrentPrice>
          <Change $positive={priceChange}>
            {priceChange ? "▲" : "▼"} {Math.abs(quote.d)?.toFixed(2)} ({Math.abs(quote.dp)?.toFixed(2)}%)
          </Change>
        </PriceBlock>
      </StockHeader>

      {/* Stats Row */}
      <StatsRow>
        <StatItem><StatLabel>Open</StatLabel><StatValue>${quote.o?.toFixed(2)}</StatValue></StatItem>
        <StatItem><StatLabel>High</StatLabel><StatValue>${quote.h?.toFixed(2)}</StatValue></StatItem>
        <StatItem><StatLabel>Low</StatLabel><StatValue>${quote.l?.toFixed(2)}</StatValue></StatItem>
        <StatItem><StatLabel>Prev Close</StatLabel><StatValue>${quote.pc?.toFixed(2)}</StatValue></StatItem>
      </StatsRow>

      {/* Action Buttons */}
      <ActionButtons>
        <WatchlistBtn onClick={handleAddToWatchlist}>+ Add to Watchlist</WatchlistBtn>
        <PortfolioBtn onClick={() => setShowPortfolioModal(true)}>+ Add to Portfolio</PortfolioBtn>
      </ActionButtons>

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <ModalOverlay>
          <Modal>
            <ModalTitle>Add {symbol.toUpperCase()} to Portfolio</ModalTitle>
            <form onSubmit={handleAddToPortfolio}>
              <ModalInput
                type="number"
                placeholder="Quantity (e.g. 10)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
              <ModalInput
                type="number"
                placeholder="Purchase price (e.g. 150.00)"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
              <ModalButtons>
                <PortfolioBtn type="submit">Add</PortfolioBtn>
                <CancelBtn type="button" onClick={() => setShowPortfolioModal(false)}>Cancel</CancelBtn>
              </ModalButtons>
            </form>
          </Modal>
        </ModalOverlay>
      )}

      <ContentGrid>
        {/* Left Column: Chart + News */}
        <LeftColumn>
          {/* Price History Chart */}
          <Section>
            <SectionTitle>30-Day Price History</SectionTitle>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`$${value}`, "Price"]} />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={priceChange ? "#22c55e" : "#ef4444"}
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>No historical data available.</p>
            )}
          </Section>

          {/* News */}
          <Section>
            <SectionTitle>Related News</SectionTitle>
            {news.length > 0 ? (
              <NewsList>
                {news.map((article) => (
                  <NewsItem key={article.id} href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.image && <NewsImage src={article.image} alt={article.headline} />}
                    <NewsContent>
                      <NewsHeadline>{article.headline}</NewsHeadline>
                      <NewsMeta>{article.source} · {article.datetime}</NewsMeta>
                    </NewsContent>
                  </NewsItem>
                ))}
              </NewsList>
            ) : (
              <p>No news available.</p>
            )}
          </Section>
        </LeftColumn>

        {/* Right Column: Chat */}
        <RightColumn>
          <Section>
            <SectionTitle>Live Chat — {symbol.toUpperCase()}</SectionTitle>
            <ChatBox>
              {messages.length === 0 && (
                <EmptyChat>No messages yet. Be the first to comment!</EmptyChat>
              )}
              {messages.map((msg, i) => (
                <ChatMessage key={i}>
                  <ChatUser>{msg.user}</ChatUser>
                  <ChatText>{msg.message}</ChatText>
                  <ChatTime>{msg.timestamp}</ChatTime>
                </ChatMessage>
              ))}
              <div ref={messagesEndRef} />
            </ChatBox>
            <ChatInputRow>
              <ChatInput
                type="text"
                placeholder={user ? "Type a message..." : "Log in to chat"}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={!user}
              />
              <SendBtn onClick={handleSendMessage} disabled={!user}>Send</SendBtn>
            </ChatInputRow>
          </Section>
        </RightColumn>
      </ContentGrid>
    </PageWrapper>
  );
};

export default StockDetailsPage;

// --- Styled Components ---

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
`;

const FeedbackBanner = styled.div`
  background: ${({ $positive }) => ($positive ? "#dcfce7" : "#fee2e2")};
  color: ${({ $positive }) => ($positive ? "#16a34a" : "#dc2626")};
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 500;
`;

const StockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
`;

const CompanyName = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const SymbolText = styled.p`
  color: #6b7280;
  margin: 4px 0 0;
  font-size: 0.9rem;
`;

const PriceBlock = styled.div`
  text-align: right;
`;

const CurrentPrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
`;

const Change = styled.div`
  font-size: 1rem;
  color: ${({ $positive }) => ($positive ? "#22c55e" : "#ef4444")};
  font-weight: 500;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
`;

const StatValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const WatchlistBtn = styled.button`
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  &:hover { background: #1d4ed8; }
`;

const PortfolioBtn = styled.button`
  padding: 10px 20px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  &:hover { background: #15803d; }
`;

const CancelBtn = styled.button`
  padding: 10px 20px;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  &:hover { background: #d1d5db; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 360px;
`;

const ModalTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 1.2rem;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 1rem;
  box-sizing: border-box;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RightColumn = styled.div``;

const Section = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 16px;
`;

const NewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NewsItem = styled.a`
  display: flex;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  &:hover h3 { color: #2563eb; }
`;

const NewsImage = styled.img`
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
`;

const NewsContent = styled.div``;

const NewsHeadline = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 4px;
  line-height: 1.4;
`;

const NewsMeta = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
`;

const ChatBox = styled.div`
  height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  padding-right: 4px;
`;

const EmptyChat = styled.p`
  color: #9ca3af;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 40px;
`;

const ChatMessage = styled.div`
  background: #f3f4f6;
  border-radius: 8px;
  padding: 8px 12px;
`;

const ChatUser = styled.div`
  font-weight: 600;
  font-size: 0.8rem;
  color: #2563eb;
`;

const ChatText = styled.div`
  font-size: 0.9rem;
  margin: 2px 0;
`;

const ChatTime = styled.div`
  font-size: 0.7rem;
  color: #9ca3af;
`;

const ChatInputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  &:disabled { background: #f9fafb; cursor: not-allowed; }
`;

const SendBtn = styled.button`
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  &:disabled { background: #93c5fd; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #1d4ed8; }
`;
