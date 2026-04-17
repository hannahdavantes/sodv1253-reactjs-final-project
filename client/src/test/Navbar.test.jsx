import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderNavbar = (authValue) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("Navbar", () => {
  afterEach(() => vi.clearAllMocks());

  test("shows Login and Register when logged out", () => {
    renderNavbar({ user: null, token: null, logout: vi.fn() });
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  test("shows user greeting when logged in", () => {
    renderNavbar({
      user: { firstName: "Shakiba", email: "s@test.com" },
      token: "abc123",
      logout: vi.fn(),
    });
    expect(screen.getByText(/Hi, Shakiba/i)).toBeInTheDocument();
  });

  test("shows Watchlist, Portfolio, Chat links when logged in", () => {
    renderNavbar({
      user: { firstName: "Shakiba", email: "s@test.com" },
      token: "abc123",
      logout: vi.fn(),
    });
    expect(screen.getByText("Watchlist")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Chat")).toBeInTheDocument();
  });

  test("hides Watchlist, Portfolio, Chat when logged out", () => {
    renderNavbar({ user: null, token: null, logout: vi.fn() });
    expect(screen.queryByText("Watchlist")).not.toBeInTheDocument();
    expect(screen.queryByText("Portfolio")).not.toBeInTheDocument();
    expect(screen.queryByText("Chat")).not.toBeInTheDocument();
  });

  test("calls logout and navigates on Logout click", () => {
    const mockLogout = vi.fn();
    renderNavbar({
      user: { firstName: "Shakiba", email: "s@test.com" },
      token: "abc123",
      logout: mockLogout,
    });
    fireEvent.click(screen.getByText("Logout"));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("renders StockApp logo", () => {
    renderNavbar({ user: null, token: null, logout: vi.fn() });
    expect(screen.getByText("StockApp")).toBeInTheDocument();
  });
});
