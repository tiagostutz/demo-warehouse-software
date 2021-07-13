import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
export default function Product({ id, name, price, doBuy }) {
  return (
    <div className={styles.card}>
      <h2>{name}</h2>

      <div>
        <p>
          <strong>$ {price}</strong>
        </p>
        <QuantityAvailable productId={id} />
      </div>
      <div className="mt-1">
        <button onClick={() => doBuy(id)}>Instant buy!</button>
      </div>
    </div>
  );
}

const QuantityAvailable = ({ productId }) => {
  const [quantityAvailable, setQuantityAvailable] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/product/" + productId);
      const singleProductJSON = await res.json();
      setQuantityAvailable(singleProductJSON[0].quantityAvailable);
    };
    fetchData();
  }, [productId]);

  return <>{quantityAvailable && <p>{quantityAvailable} available</p>}</>;
};
