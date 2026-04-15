import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link> | <Link to="/watchlist">Watchlist</Link> |{" "}
      <Link to="/portfolio">Portfolio</Link> | <Link to="/chat">Chat</Link>
    </nav>
  );
}

export default Navbar;
