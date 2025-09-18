import { useEffect, useState } from "react";
import LogoutButton from "../LogoutButton";
import StoreList from "../StoreList";

export default function UserDashboard() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) {
      setUsername(user.name);
    } else {
      setUsername("User"); // fallback
    }
  }, []);

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <StoreList />
      <LogoutButton />
    </div>
  );
}
