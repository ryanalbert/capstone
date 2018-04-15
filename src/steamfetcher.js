const mysql = require("mysql");
const axios = require("axios");
const steamPrefix = "http://store.steampowered.com/api/appdetails?appids=";
const giantbombPrefix = "https://www.giantbomb.com/api/game/";
const giantbombSuffix =
  "/?api_key=68dc80ef5bba5b1da4a2120edbc78d6abdb984cd&format=json";

// Connection to the database.
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql",
  database: "capstone"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

main();

async function main() {
  const steamAppsJson = await axios.get(
    "http://api.steampowered.com/ISteamApps/GetAppList/v0002/"
  );
  const steamApps = steamAppsJson.data.applist.apps;
  let i = 0;
  let app,
    appid,
    appData,
    name,
    steamID,
    steamPrice,
    steamUrl,
    metacriticScore,
    metacriticUrl,
    steamSql;
  (async function() {
    try {
      const test = await axios.get(
        "http://store.steampowered.com/api/appdetails?appids=2540"
      );
      steamID = steamApps[i].appid;
      appJson = await axios.get(
        "http://store.steampowered.com/api/appdetails?appids=" + steamID
      );
      app = appJson["data"][steamID];
      if (app["success"]) {
        appData = app["data"];
        if (appData["type"] === "game") {
          if (appData.name != null) {
            name = appData.name
              .replace(/\\\//g, "/")
              .replace(/"/g, "")
              .replace(/®/g, "")
              .replace(/™/g, "");
            steamUrl = ("http://store.steampowered.com/app/" + steamID)
              .replace(/\\\//g, "/")
              .replace(/"/g, "");
          }
          if (appData.price_overview != null) {
            steamPrice = appData.price_overview.final;
          }
          if (appData.metacritic != null) {
            metacriticScore = appData.metacritic.score;
            metacriticUrl = appData.metacritic.url
              .replace(/\\\//g, "/")
              .replace(/"/g, "");
          }
          console.log(name, " inserted with ID ", steamID);
          steamSql = `INSERT INTO games (name, steamID, steamPrice, steamUrl, metacriticScore, 
                      metacriticUrl) VALUES ("${name}", ${steamID}, "${steamPrice}", 
                      "${steamUrl}", "${metacriticScore}", "${metacriticUrl}")
                      ON DUPLICATE KEY UPDATE steamID="${steamID}", steamUrl="${steamUrl}", steamPrice=${steamPrice}, 
                      metacriticScore=${metacriticScore}, metacriticUrl="${metacriticUrl}"`;
        }
        con.query(steamSql);
      }
      i++;
      setTimeout(arguments.callee, 1500);
    } catch (err) {
      console.log(err);
    }
  })();
}

function getStringFromArray(array) {
  if (array != null) {
    return Object.keys(array)
      .map((element, index) => array[index].name)
      .join();
  }
}

async function fetchTop100() {
  const top100 = await axios.get(
    "https://api.twitch.tv/kraken/games/top?client_id=a3jfs2fcysl8kyqyz0wbrjqxsyzggq&limit=100"
  );
  return top100;
}

async function fetchGiantBombData(guid) {
  const url = giantbombPrefix + guid + giantbombSuffix;
  const game = await axios.get(url);
  console.log(game.data);
}

async function insertSteamData(appid) {
  const url = steamPrefix + appid;
  const game = await axios.get(url);
  console.log(game.data);
}

function fetchGame(name) {
  con.query(`SELECT * FROM games WHERE name = '${name}'`, function(
    err,
    result
  ) {
    if (err) throw err;
    console.log(result);
  });
}

async function insertAllGamesIntoDB() {
  var allGamesJson = await axios.get(
    "http://api.steampowered.com/ISteamApps/GetAppList/v0002/"
  );
  var allGames = allGamesJson.data.applist.apps;
  allGames.forEach(game => {
    if (!game.name.includes('"')) {
      var appid = game["appid"];
      var name = '"' + game["name"] + '"';
      var sql =
        // Ignore duplicate values.
        "INSERT IGNORE INTO steam (appid, name) VALUES (" +
        appid +
        ", " +
        name +
        ")";
      // Insert into the database.
      con.query(sql, function(err, result) {
        if (err) throw err;
        //console.log("Number of records inserted: " + result.affectedRows);
      });
    }
  });
}

module.exports.fetchGame = fetchGame;
