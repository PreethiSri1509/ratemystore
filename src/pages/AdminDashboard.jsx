import { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "../LogoutButton";
import "../AdminDashboard.css"; // new CSS file

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="admin-container">
      <header>
        <h1>Welcome, Admin!</h1>
        <LogoutButton />
      </header>
      <div className="users-grid">
        {users.map((user) => (
          <div key={`${user.user_id}-${user.store_id}`} className="user-card">
            <h2>{user.user_name} <span className="role">({user.role})</span></h2>
            <p>Email: {user.email}</p>
            <p>Address: {user.address}</p>

            {user.store_id && (
              <div className="store-info">
                <h3>{user.store_name}</h3>
                <p>{user.store_address}</p>
                <p>
                  ⭐ {parseFloat(user.average_rating).toFixed(1)} | 
                  {user.total_ratings} ratings
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
