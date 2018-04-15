const io = require("socket.io")();
const axios = require("axios");
const { fetchTop100 } = require("./fetcher");

/*
io.on("connection", client => {
  client.on("subscribeToTimer", interval => {
    console.log("client is subscribing to timer with interval ", interval);
    setInterval(() => {
      client.emit("timer", new Date());
    }, interval);
  });
});

const port = 8000;
io.listen(port);
console.log("listening on port ", port);
*/

io.on("connection", client => {
  client.on("fetchTop100", interval => {
    console.log("something");
    fetchTop100().then(top100 => {
      client.emit("top100", top100);
    });
  });
});

const port = 8000;
io.listen(port);
console.log("listening on port ", port);
async function fetchTop100() {
  const top100 = await axios.get(
    "https://api.twitch.tv/kraken/games/top?client_id=a3jfs2fcysl8kyqyz0wbrjqxsyzggq&limit=100"
  );
  return top100.data.top;
}
