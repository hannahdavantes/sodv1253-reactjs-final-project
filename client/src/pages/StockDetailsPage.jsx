import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Client as ConversationsClient } from "@twilio/conversations";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import {
  getStockDetails,
  getStockHistory,
  getStockNews,
  addToWatchlist,
  addToPortfolio,
} from "../services/stockService";

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
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatIdentity, setChatIdentity] = useState("");
  const [chatLoading, setChatLoading] = useState(true);
  const [chatError, setChatError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const clientRef = useRef(null);
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
        console.log("historyData:", historyData);
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

  // Twilio chat setup
  useEffect(() => {
    if (!user) {
      setChatLoading(false);
      return;
    }

    const initChat = async () => {
      try {
        const data = await apiFetch(`/api/chat/token/${symbol}`);

        clientRef.current = new ConversationsClient(data.token);
        setChatIdentity(data.identity);

        const convo = await clientRef.current.getConversationByUniqueName(
          data.conversationUniqueName,
        );

        if (convo.status !== "joined") await convo.join();

        const msgs = await convo.getMessages();
        setMessages(msgs.items);

        convo.on("messageAdded", (msg) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.sid === msg.sid);
            if (exists) return prev;
            return [...prev, msg];
          });
        });

        setConversation(convo);
      } catch (err) {
        console.error("Stock chat error:", err);
        setChatError("Failed to connect to chat.");
      } finally {
        setChatLoading(false);
      }
    };

    initChat();

    return () => {
      if (clientRef.current) clientRef.current.shutdown();
    };
  }, [symbol, user]);

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

  const handleGetCurrentPrice = () => {
    setPurchasePrice(stock?.quote?.c?.toFixed(2));
  };

  const handleAddToPortfolio = async (e) => {
    e.preventDefault();
    if (!user) return showFeedback("Please log in to add to portfolio");
    try {
      await addToPortfolio(
        symbol,
        stock?.profile?.name,
        quantity,
        purchasePrice,
      );
      showFeedback("Added to portfolio!");
      setShowPortfolioModal(false);
      setQuantity("");
      setPurchasePrice("");
    } catch (err) {
      showFeedback(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !conversation || chatError) return;
    try {
      setIsSending(true);
      await conversation.sendMessage(chatInput);
      setChatInput("");
    } catch (err) {
      console.error("Send error:", err);
      setChatError("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const formatAuthor = (author) => {
    const parts = author.split("-");
    if (parts.length >= 4) {
      const firstName = parts[2];
      const lastName = parts[3];
      if (firstName && lastName) return `${firstName} ${lastName}`;
    }
    return "Unknown User";
  };

  if (loading)
    return (
      <PageWrapper>
        <p>Loading...</p>
      </PageWrapper>
    );
  if (error)
    return (
      <PageWrapper>
        <p>Error: {error}</p>
      </PageWrapper>
    );

  const { quote, profile } = stock;
  const priceChange = quote.d >= 0;

  return (
    <PageWrapper>
      {feedback && (
        <FeedbackBanner $positive={feedback.includes("Added")}>
          {feedback}
        </FeedbackBanner>
      )}

      {/* Stock Header */}
      <StockHeader>
        <HeaderLeft>
          {profile.logo && <Logo src={profile.logo} alt={profile.name} />}
          <div>
            <CompanyName>{profile.name || symbol.toUpperCase()}</CompanyName>
            <SymbolText>
              {symbol.toUpperCase()} · {profile.exchange}
            </SymbolText>
          </div>
        </HeaderLeft>
        <PriceBlock>
          <CurrentPrice>${quote.c?.toFixed(2)}</CurrentPrice>
          <Change $positive={priceChange}>
            {priceChange ? "▲" : "▼"} {Math.abs(quote.d)?.toFixed(2)} (
            {Math.abs(quote.dp)?.toFixed(2)}%)
          </Change>
        </PriceBlock>
      </StockHeader>

      {/* Stats Row */}
      <StatsRow>
        <StatItem>
          <StatLabel>Open</StatLabel>
          <StatValue>${quote.o?.toFixed(2)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>High</StatLabel>
          <StatValue>${quote.h?.toFixed(2)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Low</StatLabel>
          <StatValue>${quote.l?.toFixed(2)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Prev Close</StatLabel>
          <StatValue>${quote.pc?.toFixed(2)}</StatValue>
        </StatItem>
      </StatsRow>

      {/* Action Buttons */}
      {user && (
        <ActionButtons>
          <WatchlistBtn onClick={handleAddToWatchlist}>
            + Add to Watchlist
          </WatchlistBtn>
          <PortfolioBtn onClick={() => setShowPortfolioModal(true)}>
            + Add to Portfolio
          </PortfolioBtn>
        </ActionButtons>
      )}

      {/* Portfolio Modal */}
      {user && showPortfolioModal && (
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
                min="1"
                step="1"
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
              <GetPriceBtn type="button" onClick={handleGetCurrentPrice}>
                Get Current Price (${quote.c?.toFixed(2)})
              </GetPriceBtn>
              <ModalButtons>
                <PortfolioBtn type="submit">Add</PortfolioBtn>
                <CancelBtn
                  type="button"
                  onClick={() => setShowPortfolioModal(false)}
                >
                  Cancel
                </CancelBtn>
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
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 15 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 15 }} />
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
              {chatLoading && (
                <div className="status-box">
                  <div className="spinner" />
                  <p>Connecting to chat...</p>
                </div>
              )}

              {!chatLoading && chatError && (
                <div className="status-box">
                  <p className="error">⚠️ {chatError}</p>
                </div>
              )}

              {!chatLoading && !chatError && !user && (
                <div className="status-box">
                  <p>Log in to participate in the chat.</p>
                </div>
              )}

              {!chatLoading && !chatError && user && messages.length === 0 && (
                <div className="status-box">
                  <p>No messages yet. Be the first to comment!</p>
                </div>
              )}

              {!chatLoading &&
                !chatError &&
                user &&
                messages.map((msg) => {
                  const isOwn = msg.author === chatIdentity;
                  return (
                    <ChatMessage key={msg.sid} $own={isOwn}>
                      <ChatUser>
                        {isOwn ? "You" : formatAuthor(msg.author)}
                      </ChatUser>
                      <ChatBubble $own={isOwn}>{msg.body}</ChatBubble>
                      <ChatTime>
                        {new Date(msg.dateCreated).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </ChatTime>
                    </ChatMessage>
                  );
                })}
              <div ref={messagesEndRef} />
            </ChatBox>

            {user && (
              <ChatInputRow>
                <ChatInput
                  type="text"
                  placeholder={
                    chatError ? "Chat unavailable" : "Type a message..."
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={!!chatError || isSending}
                />
                <SendBtn
                  onClick={handleSendMessage}
                  disabled={!!chatError || isSending}
                >
                  {isSending ? "..." : "Send"}
                </SendBtn>
              </ChatInputRow>
            )}
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
  font-size: 1.4rem;
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
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0;
`;

const SymbolText = styled.p`
  color: #6b7280;
  margin: 4px 0 0;
  font-size: 1.4rem;
`;

const PriceBlock = styled.div`
  text-align: right;
`;

const CurrentPrice = styled.div`
  font-size: 2.8rem;
  font-weight: 700;
`;

const Change = styled.div`
  font-size: 1.6rem;
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
  font-size: 1.2rem;
  color: #6b7280;
  text-transform: uppercase;
`;

const StatValue = styled.span`
  font-size: 1.6rem;
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
  font-size: 1.4rem;
  &:hover {
    background: #1d4ed8;
  }
`;

const PortfolioBtn = styled.button`
  padding: 10px 20px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.4rem;
  &:hover {
    background: #15803d;
  }
`;

const CancelBtn = styled.button`
  padding: 10px 20px;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.4rem;
  &:hover {
    background: #d1d5db;
  }
`;

const GetPriceBtn = styled.button`
  width: 100%;
  padding: 0.8rem 1.2rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 500;
  margin-bottom: 12px;
  text-align: left;
  transition: background 0.2s;
  font-family: var(--font-body);
  &:hover {
    background: #e5e7eb;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
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
  font-size: 2rem;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 1.4rem;
  box-sizing: border-box;
  font-family: var(--font-body);
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
  font-size: 2.8rem;
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
  &:hover h3 {
    color: #2563eb;
  }
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
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0 0 4px;
  line-height: 1.4;
`;

const NewsMeta = styled.p`
  font-size: 1.4rem;
  color: #6b7280;
  margin: 0;
`;

const ChatBox = styled.div`
  height: 420px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  padding: 1.2rem;
  background-color: var(--off-white);
  border-radius: 0.8rem;
  border: 3px solid var(--gray-3);

  &::-webkit-scrollbar {
    width: 0.5rem;
  }

  &::-webkit-scrollbar-track {
    background: var(--gray-2);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--gray-4);
    border-radius: 1rem;
  }

  .status-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
    height: 100%;

    p {
      font-size: 1.4rem;
      color: var(--gray-6);
      text-align: center;

      &.error {
        color: var(--secondary-color);
      }
    }

    .spinner {
      width: 3.2rem;
      height: 3.2rem;
      border: 3px solid var(--gray-3);
      border-top-color: var(--tertiary-color);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  }
`;

const ChatMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $own }) => ($own ? "flex-end" : "flex-start")};
`;

const ChatUser = styled.div`
  font-weight: 600;
  font-size: 1.2rem;
  color: var(--gray-6);
  margin-bottom: 0.3rem;
`;

const ChatBubble = styled.div`
  max-width: 80%;
  padding: 1rem 1.4rem;
  font-size: 1.4rem;
  word-break: break-word;
  color: var(--primary-color-dark);
  box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.06);
  background-color: ${({ $own }) =>
    $own ? "var(--tertiary-color)" : "var(--white)"};
  border-radius: ${({ $own }) =>
    $own ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0"};
  border: ${({ $own }) => ($own ? "none" : "1px solid var(--gray-3)")};
`;

const ChatTime = styled.div`
  font-size: 1.1rem;
  color: var(--gray-5);
  margin-top: 0.3rem;
`;

const ChatInputRow = styled.div`
  display: flex;
  gap: 1.2rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--gray-2);
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 1.2rem 1.4rem;
  border: 0.1rem solid var(--gray-4);
  border-radius: 0.8rem;
  font-size: 1.4rem;
  background-color: var(--off-white);
  color: var(--primary-color-dark);
  font-family: var(--font-body);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--tertiary-color);
    box-shadow: 0 0 0 0.2rem rgba(238, 162, 52, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--gray-2);
  }
`;

const SendBtn = styled.button`
  padding: 1.2rem 1.6rem;
  background-color: var(--tertiary-color);
  color: var(--primary-color-dark);
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.4rem;
  font-family: var(--font-body);
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`;
