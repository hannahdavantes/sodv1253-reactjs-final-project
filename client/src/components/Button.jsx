import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Wrapper = styled.button`
  padding: 1.2rem 1.6rem;
  border-radius: 0.8rem;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  width: ${(props) => (props.$full ? "100%" : "auto")};

  background-color: ${({ variant }) =>
    variant === "cancel"
      ? "transparent"
      : variant === "secondary"
        ? "var(--primary-color-light)"
        : "var(--tertiary-color)"};

  color: ${({ variant }) =>
    variant === "cancel"
      ? "var(--secondary-color)"
      : variant === "secondary"
        ? "var(--off-white)"
        : "var(--primary-color-dark)"};

  border: ${({ variant }) =>
    variant === "cancel" ? "1px solid var(--secondary-color)" : "none"};

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 1.4rem;
    height: 1.4rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ${spin} 0.6s linear infinite;
  }
`;

const Button = ({
  children,
  type = "button",
  variant = "primary",
  full = false,
  to,
  onClick,
  isLoading = false,
  ...props
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (isLoading) return;

    if (onClick) onClick(e);

    if (to) {
      navigate(to);
    }
  };

  return (
    <Wrapper
      type={type}
      variant={variant}
      $full={full}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <span className="spinner" />}
      {isLoading ? "Please wait..." : children}
    </Wrapper>
  );
};

export default Button;
