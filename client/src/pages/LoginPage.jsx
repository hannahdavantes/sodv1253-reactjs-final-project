import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import styled from "styled-components";

import FormInputGroup from "../components/FormInputGroup";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const Wrapper = styled.main`
  min-height: calc(100vh - 7rem);
  display: grid;
  place-items: center;
  background-color: var(--off-white);
  padding: 4rem 2rem;

  form {
    width: 100%;
    max-width: 45rem;
    background-color: var(--white);
    padding: 3rem;
    border-radius: 1rem;
    box-shadow: 0 0.8rem 2rem rgba(0, 0, 0, 0.08);

    display: grid;
    gap: 1.8rem;
  }

  .title {
    font-size: 3rem;
    text-align: center;
    color: var(--primary-color-dark);
  }

  .error {
    background-color: rgba(155, 17, 17, 0.08);
    color: var(--secondary-color);
    padding: 1rem;
    border-radius: 0.8rem;
    font-size: 1.3rem;
  }

  .button-group {
    display: grid;
    gap: 1rem;
  }

  .bottom-text {
    text-align: center;
    font-size: 1.4rem;
    color: var(--gray-9);
  }

  .bottom-text a {
    color: var(--tertiary-color);
    text-decoration: none;
    font-weight: 600;
  }
`;

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await login(formData);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <form onSubmit={handleSubmit}>
        <h1 className="title">Login</h1>

        {error && <p className="error">{error}</p>}

        <FormInputGroup
          type="email"
          name="email"
          labelText="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <FormInputGroup
          type="password"
          name="password"
          labelText="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <div className="button-group">
          <Button type="submit" full isLoading={isSubmitting}>
            Login
          </Button>

          <Button type="button" variant="cancel" full to="/">
            Cancel
          </Button>
        </div>

        <p className="bottom-text">
          Don&apos;t have an account? Click <Link to="/register">here</Link> to
          register.
        </p>
      </form>
    </Wrapper>
  );
};

export default LoginPage;
