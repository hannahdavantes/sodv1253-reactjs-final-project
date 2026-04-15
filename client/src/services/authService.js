const API_URL = "http://localhost:5000/api/auth";

//Register a new user
export const registerUser = async (userData) => {
  //Send POST request to backend register endpoint
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    //Convert user data to JSON string
    body: JSON.stringify(userData),
  });

  //Convert response to JSON
  const data = await response.json();

  //If request failed, throw error
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  //Return response data (token + user)
  return data;
};

//Login existing user
export const loginUser = async (userData) => {
  //Send POST request to backend login endpoint
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    //Convert login data to JSON string
    body: JSON.stringify(userData),
  });

  //Convert response to JSON
  const data = await response.json();

  //If request failed, throw error
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  //Return response data (token + user)
  return data;
};

//Get current logged-in user info
export const getMe = async (token) => {
  //Send GET request with Authorization header
  const response = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      //Attach JWT token
      Authorization: `Bearer ${token}`,
    },
  });

  //Convert response to JSON
  const data = await response.json();

  //If request failed, throw error
  if (!response.ok) {
    throw new Error(data.message || "Failed to get user");
  }

  //Return user data
  return data;
};
