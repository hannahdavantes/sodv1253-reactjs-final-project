import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthContext } from "../context/AuthContext";

const renderWithAuth = (authValue, initialPath = "/protected") => {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <p>Secret Content</p>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>Login Page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("ProtectedRoute", () => {
  test("renders children when user is authenticated", () => {
    renderWithAuth({
      user: { firstName: "Shakiba" },
      token: "abc123",
    });
    expect(screen.getByText("Secret Content")).toBeInTheDocument();
  });

  test("redirects to login when not authenticated", () => {
    renderWithAuth({ user: null, token: null });
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
  });
});
