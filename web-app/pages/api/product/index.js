const http = require("http");

export default function handler(req, res) {
  const urlObj = new URL("http://localhost:4000/product");

  let headers = {};
  const requesting = http.request(
    {
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: "/product",
      pathname: "/product",
      method: "GET",
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
    console.error("Error requesting to Product API", error);
    res.status(500).json({ message: "Error fetching Products" });
  });

  requesting.end();
}
