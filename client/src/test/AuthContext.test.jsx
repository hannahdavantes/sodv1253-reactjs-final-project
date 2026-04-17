import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";

vi.mock("../utils/api", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "../utils/api";

const TestComponent = () => {
  const { user, login, logout, register } = useAuth();
  return (
    <div>
      <p>{user ? `Logged in as ${user.firstName}` : "Not logged in"}</p>
      <button onClick={() => login({ email: "s@test.com", password: "pass" })}>
        Login
      </button>
      <button
        onClick={() =>
          register({
            firstName: "Shakiba",
            lastName: "M",
            email: "s@test.com",
            password: "pass",
          })
        }
      >
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuth = () =>
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("starts with no user", () => {
    renderWithAuth();
    expect(screen.getByText("Not logged in")).toBeInTheDocument();
  });

  test("login sets user and saves to localStorage", async () => {
    apiFetch.mockResolvedValue({
      token: "tok123",
      user: { firstName: "Shakiba", email: "s@test.com" },
    });
    renderWithAuth();
    fireEvent.click(screen.getByText("Login"));
    await waitFor(() =>
      expect(screen.getByText("Logged in as Shakiba")).toBeInTheDocument()
    );
    expect(localStorage.getItem("token")).toBe("tok123");
  });

  test("register sets user and saves to localStorage", async () => {
    apiFetch.mockResolvedValue({
      token: "tok456",
      user: { firstName: "Shakiba", email: "s@test.com" },
    });
    renderWithAuth();
    fireEvent.click(screen.getByText("Register"));
    await waitFor(() =>
      expect(screen.getByText("Logged in as Shakiba")).toBeInTheDocument()
    );
    expect(localStorage.getItem("token")).toBe("tok456");
  });

  test("logout clears user and localStorage", async () => {
    apiFetch.mockResolvedValue({
      token: "tok123",
      user: { firstName: "Shakiba", email: "s@test.com" },
    });
    renderWithAuth();
    fireEvent.click(screen.getByText("Login"));
    await waitFor(() =>
      expect(screen.getByText("Logged in as Shakiba")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Logout"));
    expect(screen.getByText("Not logged in")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
