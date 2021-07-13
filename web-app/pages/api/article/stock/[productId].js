const http = require("http");

export default function handler(req, res) {
  const { productId } = req.query;
  const urlObj = new URL("http://localhost:4000/");

  let headers = {};
  const payload = JSON.stringify({
    quantity: 1,
  });
  if (req.body.method === "POST") {
    headers = {
      "Content-Type": "application/json",
      "Content-Length": payload.length,
    };
  }

  const requesting = http.request(
    {
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: "/article/stock-update/by/product/" + productId,
      pathname: "/article/stock-update/by/product/" + productId,
      method: "POST",
      headers,
      rejectUnauthorized: false,
    },
    (resRemote) => {
      resRemote.on("data", (d) => {
        process.stdout.write(d);
      });
      if (resRemote.statusCode !== 200) {
        console.error(`expected status 200 but found ${resRemote.statusCode}`);
        res.statusCode = resRemote.statusCode;
      }
      return resRemote.pipe(res);
    }
  );

  requesting.on("error", (error) => {
    console.error("Error requesting to Article API", error);
    res.status(500).json({ message: "Error fetching Articles" });
  });

  requesting.write(payload);
  requesting.end();
}
