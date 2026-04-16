import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";

const Wrapper = styled.div`
  min-height: calc(100vh - 7rem);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--background-color);

  .card {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.6rem;
    max-width: 480px;
    width: 100%;
  }

  .error-code {
    font-family: var(--font-heading);
    font-size: 10rem;
    font-weight: 700;
    color: var(--tertiary-color);
    line-height: 1;
  }

  .title {
    font-size: 2.4rem;
    color: var(--primary-color-dark);
  }

  .message {
    font-size: 1.5rem;
    color: var(--gray-7);
  }
`;

const ErrorPage = () => {
  const error = useRouteError();

  const is404 = isRouteErrorResponse(error) && error.status === 404;

  const title = is404 ? "404 — Page Not Found" : "Something went wrong";
  const message = is404
    ? "The page you're looking for doesn't exist."
    : error?.message || "An unexpected error occurred.";

  return (
    <Wrapper>
      <div className="card">
        <div className="error-code">{is404 ? "404" : "Error"}</div>
        <h1 className="title">{title}</h1>
        <p className="message">{message}</p>
        <Button to="/">Go back home</Button>
      </div>
    </Wrapper>
  );
};

export default ErrorPage;
