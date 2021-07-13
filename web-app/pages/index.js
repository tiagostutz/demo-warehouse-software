import Head from "next/head";
import styles from "../styles/Home.module.css";
import Product from "./product";
import Inventory from "./inventory";
import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    const res = await fetch("/api/product");
    const productsJSON = await res.json();
    if (res.status === 200) {
      setProducts([...productsJSON]);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const buyProduct = async (productId) => {
    const res = await fetch("/api/article/stock/" + productId);
    if (res.status === 200) {
      fetchData();
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Warehouse Management</title>
        <meta name="description" content="Warehouse Management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Warehouse Management</h1>

        <p className={styles.description}>Let&apos;s see what we have here</p>

        {/* force refresh */}
        <div className={styles.grid} key={new Date().getTime()}>
          {products.map((product) => (
            <Product
              doBuy={buyProduct}
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
            />
          ))}
        </div>

        <div className={styles.grid}>
          {/* force refresh */}
          <Inventory key={new Date().getTime()} />
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tiago Stutz // 2021
        </a>
      </footer>
    </div>
  );
}
