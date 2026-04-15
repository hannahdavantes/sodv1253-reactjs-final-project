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

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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
      await register(formData);
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
        <h1 className="title">Register</h1>

        {error && <p className="error">{error}</p>}

        <FormInputGroup
          type="text"
          name="firstName"
          labelText="First Name"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter your first name"
        />

        <FormInputGroup
          type="text"
          name="lastName"
          labelText="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter your last name"
        />

        <FormInputGroup
          type="email"
          name="email"
          labelText="Email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />

        <FormInputGroup
          type="password"
          name="password"
          labelText="Password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
        />

        <div className="button-group">
          <Button type="submit" full isLoading={isSubmitting}>
            Register
          </Button>

          <Button type="button" variant="cancel" full to="/">
            Cancel
          </Button>
        </div>

        <p className="bottom-text">
          Already have an account? Click <Link to="/login">here</Link> to log
          in.
        </p>
      </form>
    </Wrapper>
  );
};

export default RegisterPage;
