import styled from "styled-components";

const Wrapper = styled.div`
  display: grid;
  gap: 0.8rem;

  label {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--primary-color-dark);
  }

  input {
    width: 100%;
    padding: 1.2rem 1.4rem;
    border: 0.1rem solid var(--gray-4);
    border-radius: 0.8rem;
    font-size: 1.4rem;
    background-color: var(--white);
    color: var(--primary-color-dark);
  }

  input:focus {
    outline: none;
    border-color: var(--tertiary-color);
    box-shadow: 0 0 0 0.2rem rgba(238, 162, 52, 0.2);
  }
`;

const FormInputGroup = ({
  type = "text",
  name,
  labelText,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <Wrapper>
      <label htmlFor={name}>{labelText}</label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </Wrapper>
  );
};

export default FormInputGroup;
