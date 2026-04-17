import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import LandingPage from "../pages/LandingPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/stockService", () => ({
  getMarketNews: () =>
    Promise.resolve({
      news: [
        {
          id: 1,
          headline: "Markets hit record high",
          summary: "Stocks surged today.",
          source: "Reuters",
          url: "https://example.com",
          image: "",
          datetime: "4/15/2026",
        },
        {
          id: 2,
          headline: "Fed holds interest rates",
          summary: "No change expected.",
          source: "Bloomberg",
          url: "https://example.com/2",
          image: "",
          datetime: "4/15/2026",
        },
      ],
    }),
}));

const renderLandingPage = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );

describe("LandingPage", () => {
  afterEach(() => vi.clearAllMocks());

  test("renders app name", () => {
    renderLandingPage();
    expect(screen.getByText("StockApp")).toBeInTheDocument();
  });

  test("renders search bar", () => {
    renderLandingPage();
    expect(screen.getByPlaceholderText(/search a stock symbol/i)).toBeInTheDocument();
  });

  test("renders popular stocks", () => {
    renderLandingPage();
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("TSLA")).toBeInTheDocument();
    expect(screen.getByText("NVDA")).toBeInTheDocument();
  });

  test("navigates to stock page on search", async () => {
    renderLandingPage();
    const input = screen.getByPlaceholderText(/search a stock symbol/i);
    fireEvent.change(input, { target: { value: "TSLA" } });
    fireEvent.submit(input.closest("form"));
    expect(mockNavigate).toHaveBeenCalledWith("/stocks/TSLA");
  });

  test("does not navigate when search is empty", () => {
    renderLandingPage();
    const input = screen.getByPlaceholderText(/search a stock symbol/i);
    fireEvent.submit(input.closest("form"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("renders breaking news after load", async () => {
    renderLandingPage();
    await waitFor(() =>
      expect(screen.getByText("Markets hit record high")).toBeInTheDocument()
    );
    expect(screen.getByText("Breaking")).toBeInTheDocument();
  });

  test("renders remaining news articles", async () => {
    renderLandingPage();
    await waitFor(() =>
      expect(screen.getByText("Fed holds interest rates")).toBeInTheDocument()
    );
  });
});
