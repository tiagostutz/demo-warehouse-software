import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
export default function Inventory() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/article");
      const articlesJSON = await res.json();
      if (res.status === 200) {
        setArticles(articlesJSON);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={styles.card} style={{ width: "100%" }}>
      <h2>Inventory</h2>
      {articles && (
        <ul>
          {articles.map((art) => (
            <li key={art.id} className="flex">
              <span className="mr-2" style={{ width: "100px" }}>
                {art.name}
              </span>
              <span className="mr-2">&rarr;</span>
              <span>{art.availableStock}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
