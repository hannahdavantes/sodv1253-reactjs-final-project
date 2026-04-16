import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  getWatchlist,
  removeFromWatchlist,
  addToPortfolio,
} from "../services/stockService";
import { getStockDetails } from "../services/stockService";
import Button from "../components/Button";
import FormInputGroup from "../components/FormInputGroup";

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 2rem;

  .page-header {
    margin-bottom: 3.2rem;
  }

  .page-header h1 {
    font-size: 3.2rem;
    color: var(--primary-color-dark);
    margin-bottom: 0.8rem;
  }

  .page-header p {
    font-size: 1.5rem;
    color: var(--gray-7);
  }

  .status-text {
    font-size: 1.5rem;
    color: var(--gray-7);
  }

  .error-text {
    font-size: 1.5rem;
    color: var(--secondary-color);
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.6rem;
    padding: 6rem 2rem;
    text-align: center;
    background-color: var(--white);
    border: 1px solid var(--gray-3);
    border-radius: 1.2rem;
  }

  .empty-state h2 {
    font-size: 2.2rem;
    color: var(--primary-color-dark);
  }

  .empty-state p {
    font-size: 1.5rem;
    color: var(--gray-7);
    max-width: 38rem;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--white);
    border: 1px solid var(--gray-3);
    border-radius: 1.2rem;
    overflow: hidden;
  }

  th {
    text-align: left;
    padding: 1.4rem 1.8rem;
    font-size: 1.3rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gray-7);
    background-color: var(--gray-1);
    border-bottom: 1px solid var(--gray-3);
  }

  tbody tr {
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  tbody tr:not(:last-child) {
    border-bottom: 1px solid var(--gray-2);
  }

  tbody tr:hover {
    background-color: var(--gray-1);
  }

  td {
    padding: 1.4rem 1.8rem;
    vertical-align: middle;
  }

  .symbol {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--primary-color-dark);
  }

  .company-name {
    font-size: 1.4rem;
    color: var(--gray-8);
  }

  .date-text {
    font-size: 1.3rem;
    color: var(--gray-6);
  }

  .action-cell {
    display: flex;
    gap: 0.8rem;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 2rem;
  }

  .modal {
    background: var(--white);
    padding: 3.2rem;
    border-radius: 1.2rem;
    width: 100%;
    max-width: 420px;
  }

  .modal h2 {
    font-size: 2rem;
    color: var(--primary-color-dark);
    margin-bottom: 2.4rem;
  }

  .modal-fields {
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
    margin-bottom: 2.4rem;
  }

  .modal-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .get-price-btn {
    width: 100%;
    padding: 0.8rem 1.2rem;
    background: var(--gray-1);
    color: var(--gray-9);
    border: 1px solid var(--gray-3);
    border-radius: 0.8rem;
    cursor: pointer;
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 1.6rem;
    text-align: left;
    transition: background 0.2s;
    font-family: var(--font-body);
  }

  .get-price-btn:hover:not(:disabled) {
    background: var(--gray-2);
  }

  .get-price-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingSymbol, setRemovingSymbol] = useState(null);
  const [portfolioItem, setPortfolioItem] = useState(null);
  const [portfolioForm, setPortfolioForm] = useState({
    quantity: "",
    purchasePrice: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getWatchlist()
      .then((data) => setWatchlist(data.watchlist))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (symbol) => {
    setRemovingSymbol(symbol);
    try {
      await removeFromWatchlist(symbol);
      setWatchlist((prev) => prev.filter((item) => item.Symbol !== symbol));
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingSymbol(null);
    }
  };

  const handlePortfolioOpen = (item) => {
    setPortfolioItem(item);
    setPortfolioForm({ quantity: "", purchasePrice: "" });
  };

  const handlePortfolioClose = () => {
    setPortfolioItem(null);
    setPortfolioForm({ quantity: "", purchasePrice: "" });
  };

  const handleGetCurrentPrice = async () => {
    setIsFetchingPrice(true);
    try {
      const data = await getStockDetails(portfolioItem.Symbol);
      setPortfolioForm((prev) => ({
        ...prev,
        purchasePrice: data.quote.c?.toFixed(2),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addToPortfolio(
        portfolioItem.Symbol,
        portfolioItem.Description,
        portfolioForm.quantity,
        portfolioForm.purchasePrice,
      );
      handlePortfolioClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Wrapper>
      <div className="page-header">
        <h1>My Watchlist</h1>
        <p>Track the stocks you care about.</p>
      </div>

      {loading && <p className="status-text">Loading watchlist...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && watchlist.length === 0 && (
        <div className="empty-state">
          <h2>Your watchlist is empty</h2>
          <p>
            Search for a stock and add it to your watchlist to track it here.
          </p>
          <Button to="/">Browse Stocks</Button>
        </div>
      )}

      {!loading && watchlist.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Company</th>
              <th>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((item) => (
              <tr
                key={item.Symbol}
                onClick={() => navigate(`/stocks/${item.Symbol}`)}
              >
                <td>
                  <span className="symbol">
                    {item.DisplaySymbol || item.Symbol}
                  </span>
                </td>
                <td>
                  <span className="company-name">
                    {item.Description || "—"}
                  </span>
                </td>
                <td>
                  <span className="date-text">
                    {new Date(item.AddedAt).toLocaleDateString()}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="action-cell">
                    <Button
                      variant="secondary"
                      onClick={() => handlePortfolioOpen(item)}
                    >
                      + Portfolio
                    </Button>
                    <Button
                      variant="cancel"
                      isLoading={removingSymbol === item.Symbol}
                      onClick={() => handleRemove(item.Symbol)}
                    >
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {portfolioItem && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              Add {portfolioItem.DisplaySymbol || portfolioItem.Symbol} to
              Portfolio
            </h2>
            <form onSubmit={handlePortfolioSubmit}>
              <div className="modal-fields">
                <FormInputGroup
                  type="number"
                  name="quantity"
                  labelText="Quantity"
                  value={portfolioForm.quantity}
                  onChange={(e) =>
                    setPortfolioForm((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  placeholder="e.g. 10"
                  min="1"
                  step="1"
                />
                <FormInputGroup
                  type="number"
                  name="purchasePrice"
                  labelText="Purchase Price"
                  value={portfolioForm.purchasePrice}
                  onChange={(e) =>
                    setPortfolioForm((prev) => ({
                      ...prev,
                      purchasePrice: e.target.value,
                    }))
                  }
                  placeholder="e.g. 150.00"
                  min="0.01"
                  step="0.01"
                />
                <button
                  type="button"
                  className="get-price-btn"
                  onClick={handleGetCurrentPrice}
                  disabled={isFetchingPrice}
                >
                  {isFetchingPrice ? "Fetching price..." : "Get Current Price"}
                </button>
              </div>
              <div className="modal-buttons">
                <Button type="submit" full isLoading={isAdding}>
                  Add to Portfolio
                </Button>
                <Button
                  type="button"
                  variant="cancel"
                  full
                  onClick={handlePortfolioClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default WatchlistPage;
