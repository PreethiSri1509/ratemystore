import { useEffect, useState } from "react";
import axios from "axios";
import "./StoreList.css";

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const user_id = localStorage.getItem("user_id"); // store this on login

  const fetchStores = () => {
    axios.get("http://localhost:5000/api/stores")
      .then((res) => setStores(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleRate = (store_id, rating) => {
    if (!user_id) return alert("User not logged in");
    axios.post("http://localhost:5000/api/rate", { user_id, store_id, rating })
      .then(() => fetchStores()) // refresh ratings
      .catch((err) => console.error(err));
  };

  return (
    <div className="store-container">
      {stores.map((store) => (
        <div key={store.id} className="store-card">
          <h2>{store.name}</h2>
          <p>{store.address}</p>
          <p>Average Rating: {parseFloat(store.average_rating).toFixed(1)} ⭐</p>
          <p>Total Ratings: {store.total_ratings}</p>

          <div className="rating-buttons">
            <span>Rate this store: </span>
            {[1,2,3,4,5].map((num) => (
              <button
                key={num}
                onClick={() => handleRate(store.id, num)}
              >
                {num}⭐
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
