import { Link, NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";

const Wrapper = styled.nav`
  width: 100%;
  height: 7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background-color: var(--primary-color);
  color: var(--off-white);
  font-size: 1.4rem;

  .left,
  .center,
  .right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .logo {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--tertiary-color);
    text-decoration: none;
    letter-spacing: 0.2rem;
  }

  a {
    color: var(--off-white);
    text-decoration: none;
    transition: all 0.2s ease;
  }

  a:hover {
    color: var(--tertiary-color);
  }

  .center a.active {
    border-bottom: 2px solid var(--tertiary-color);
    padding-bottom: 0.2rem;
    pointer-events: none;
    cursor: default;
  }

  .center a.active:hover {
    color: var(--off-white);
  }

  .user {
    font-size: 1.3rem;
  }

  .btn {
    padding: 0.8rem 1.2rem;
    border-radius: 0.6rem;
    border: 1px solid var(--tertiary-color);
    cursor: pointer;
    font-size: 1.3rem;
    font-weight: 600;
    transition: all 0.2s ease;
    background-color: var(--primary-color);
    color: var(--off-white);
  }

  .login-btn,
  .register-btn {
    background-color: var(--primary-color);
    color: var(--off-white);
    border: 1px solid var(--tertiary-color);
  }

  .login-btn:hover,
  .register-btn:hover {
    background-color: var(--tertiary-color);
    color: var(--primary-color-dark);
  }

  .login-btn.active,
  .register-btn.active {
    background-color: var(--tertiary-color);
    color: var(--primary-color-dark);
    border: 1px solid var(--tertiary-color);
    pointer-events: none;
    cursor: default;
  }

  .login-btn.active:hover,
  .register-btn.active:hover {
    background-color: var(--tertiary-color);
    color: var(--primary-color-dark);
  }

  .logout-btn {
    background-color: var(--secondary-color);
    color: var(--off-white);
    border: none;
  }

  .logout-btn:hover {
    opacity: 0.85;
  }
`;

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!user && !!token;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Wrapper>
      <div className="left">
        <Link to="/" className="logo">
          StockApp
        </Link>
      </div>

      <div className="center">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>

        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Stocks
        </NavLink>

        {isAuthenticated && (
          <>
            <NavLink
              to="/watchlist"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Watchlist
            </NavLink>

            <NavLink
              to="/portfolio"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Portfolio
            </NavLink>

            <NavLink
              to="/chat"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Chat
            </NavLink>
          </>
        )}
      </div>

      <div className="right">
        {!isAuthenticated ? (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `btn login-btn ${isActive ? "active" : ""}`
              }
            >
              Login
            </NavLink>

            <NavLink
              to="/register"
              className={({ isActive }) =>
                `btn register-btn ${isActive ? "active" : ""}`
              }
            >
              Register
            </NavLink>
          </>
        ) : (
          <>
            <span className="user">
              Hi,{" "}
              {user?.firstName
                ? user.firstName.charAt(0).toUpperCase() +
                  user.firstName.slice(1)
                : user?.email}
              !
            </span>

            <button
              type="button"
              className="btn logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default Navbar;
