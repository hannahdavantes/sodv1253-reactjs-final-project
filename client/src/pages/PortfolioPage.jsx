import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  getPortfolio,
  updatePortfolioHolding,
  removeFromPortfolio,
} from "../services/stockService";
import Button from "../components/Button";
import FormInputGroup from "../components/FormInputGroup";

const Wrapper = styled.div`
  max-width: 1100px;
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

  /* Summary bar */
  .summary-bar {
    display: flex;
    gap: 2.4rem;
    margin-bottom: 2.4rem;
    padding: 2rem 2.4rem;
    background-color: var(--primary-color);
    border-radius: 1.2rem;
    flex-wrap: wrap;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .summary-label {
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--low-opacity-white);
  }

  .summary-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--tertiary-color);
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

  .value-text {
    font-size: 1.4rem;
    color: var(--gray-9);
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
`;

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: "",
    purchasePrice: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPortfolio()
      .then((data) => setPortfolio(data.portfolio))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalValue = portfolio.reduce((sum, item) => {
    return sum + item.Quantity * (item.PurchasePrice || 0);
  }, 0);

  const handleEditOpen = (item) => {
    setEditingItem(item);
    setEditForm({
      quantity: item.Quantity,
      purchasePrice: item.PurchasePrice || "",
    });
  };

  const handleEditClose = () => {
    setEditingItem(null);
    setEditForm({ quantity: "", purchasePrice: "" });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updatePortfolioHolding(
        editingItem.Id,
        editForm.quantity,
        editForm.purchasePrice,
      );
      setPortfolio((prev) =>
        prev.map((item) =>
          item.Id === editingItem.Id
            ? {
                ...item,
                Quantity: parseFloat(editForm.quantity),
                PurchasePrice: parseFloat(editForm.purchasePrice),
              }
            : item,
        ),
      );
      handleEditClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      await removeFromPortfolio(id);
      setPortfolio((prev) => prev.filter((item) => item.Id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Wrapper>
      <div className="page-header">
        <h1>My Portfolio</h1>
        <p>Manage your stock holdings.</p>
      </div>

      {loading && <p className="status-text">Loading portfolio...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && portfolio.length === 0 && (
        <div className="empty-state">
          <h2>Your portfolio is empty</h2>
          <p>
            Search for a stock and add a holding to start tracking your
            investments.
          </p>
          <Button to="/">Browse Stocks</Button>
        </div>
      )}

      {!loading && portfolio.length > 0 && (
        <>
          <div className="summary-bar">
            <div className="summary-item">
              <span className="summary-label">Total Holdings</span>
              <span className="summary-value">{portfolio.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Cost Basis</span>
              <span className="summary-value">${totalValue.toFixed(2)}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Quantity</th>
                <th>Purchase Price</th>
                <th>Total Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => (
                <tr
                  key={item.Id}
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
                    <span className="value-text">{item.Quantity}</span>
                  </td>
                  <td>
                    <span className="value-text">
                      {item.PurchasePrice
                        ? `$${parseFloat(item.PurchasePrice).toFixed(2)}`
                        : "—"}
                    </span>
                  </td>
                  <td>
                    <span className="value-text">
                      {item.PurchasePrice
                        ? `$${(item.Quantity * item.PurchasePrice).toFixed(2)}`
                        : "—"}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-cell">
                      <Button
                        variant="secondary"
                        onClick={() => handleEditOpen(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="cancel"
                        isLoading={removingId === item.Id}
                        onClick={() => handleRemove(item.Id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {editingItem && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit {editingItem.DisplaySymbol || editingItem.Symbol}</h2>
            <form onSubmit={handleEditSave}>
              <div className="modal-fields">
                <FormInputGroup
                  type="number"
                  name="quantity"
                  labelText="Quantity"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  placeholder="e.g. 10"
                />
                <FormInputGroup
                  type="number"
                  name="purchasePrice"
                  labelText="Purchase Price"
                  value={editForm.purchasePrice}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      purchasePrice: e.target.value,
                    }))
                  }
                  placeholder="e.g. 150.00"
                />
              </div>
              <div className="modal-buttons">
                <Button type="submit" full isLoading={isSaving}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="cancel"
                  full
                  onClick={handleEditClose}
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

export default PortfolioPage;
