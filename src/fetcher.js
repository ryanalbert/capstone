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

//insertAllGamesIntoDB();

main();

/*
var i = 0;
(function () {
  console.log(i);
  i++;
  fetchGiantBombData(i);
  setTimeout(arguments.callee, 1000);
})();
*/

//fetchSteamData("The Elder Scrolls V: Skyrim");
//fetchGiantBombData();

async function main() {
  const steamAppsJson = await axios.get(
    "http://api.steampowered.com/ISteamApps/GetAppList/v0002/"
  );
  const steamApps = steamAppsJson.data.applist.apps;
  let i = 1626;
  let app,
    appid,
    appData,
    name,
    steamSql,
    gbSql,
    steamPrice,
    steamUrl,
    metacriticScore,
    metacriticUrl;
  (async function() {
    try {
      /*
      appid = steamApps[i].appid;
      appJson = await axios.get(
        "http://store.steampowered.com/api/appdetails?appids=" + appid
      );
      app = appJson["data"][appid];
      if (app["success"]) {
        appData = app["data"];
        if (appData["type"] === "game") {
          if (appData.name != null) {
            name = appData.name.replace(/\\\//g, "/").replace(/"/g, "");
          }
          if (appData.price_overview != null) {
            steamPrice = appData.price_overview.final;
          }
          if (appData.appData.metacritic != null) {
            metacriticScore = appData.metacritic.score;
            metacriticUrl = appData.metacritic.url;
          }
          steamUrl = "http://store.steampowered.com/app/" + appid;
          steamSql = `INSERT INTO games (name, appid, image, description,
            releaseDate, platforms, genres, themes, similarGames) VALUES 
            ("${name}", ${appid}, "${steamPrice}", "${steamUrl}", "${releaseDate}", 
            "${platforms}", "${genres}", "${themes}", "${similarGames}")
            ON DUPLICATE KEY UPDATE appid=${appid}, `;
        }
      }
      */

      const gbJson = await axios.get(giantbombPrefix + i + giantbombSuffix);
      const gbGame = gbJson.data.results;

      let name,
        image,
        icon,
        giantbombUrl,
        description,
        releaseDate,
        platforms,
        genres,
        themes,
        similarGames = "";
      let id = 0;

      if (gbGame.name != null) {
        name = gbGame.name.replace(/\\\//g, "/").replace(/"/g, "");
      }
      if (gbGame.id != null) {
        id = gbGame.id;
      }
      if (gbGame.image != null) {
        image = gbGame.image.original_url
          .replace(/\\\//g, "/")
          .replace(/"/g, "");
        icon = gbGame.image.icon_url.replace(/\\\//g, "/").replace(/"/g, "");
      }
      if (gbGame.deck != null) {
        description = gbGame.deck.replace(/\\\//g, "/").replace(/"/g, "");
      }
      if (gbGame.site_detail_url != null) {
        giantbombUrl = gbGame.site_detail_url
          .replace(/\\\//g, "/")
          .replace(/"/g, "");
      }
      if (gbGame.original_release_date != null) {
        releaseDate = gbGame.original_release_date
          .substr(0, 10)
          .replace(/\\\//g, "/")
          .replace(/"/g, "");
      }
      if (gbGame.platforms != null) {
        platforms = getStringFromArray(gbGame.platforms)
          .replace(/\\\//g, "/")
          .replace(/"/g, "");
      }
      if (gbGame.genres != null) {
        genres = getStringFromArray(gbGame.genres)
          .replace(/\\\//g, "/")
          .replace(/"/g, "");
      }
      if (gbGame.themes != null) {
        themes = getStringFromArray(gbGame.themes)
          .replace(/\\\//g, "/")
          .replace(/"/g, "");
      }
      if (gbGame.similar_games != null) {
        similarGames = getStringFromArray(gbGame.similar_games)
          .replace(/\\\//g, "/")
          .replace(/"/g, "");
      }
      const gbSql = `INSERT INTO games (name, id, giantbombUrl, image, icon, description,
       releaseDate, platforms, genres, themes, similarGames) VALUES 
       ("${name}", ${id}, "${giantbombUrl}", "${image}", "${icon}", "${description}", "${releaseDate}", 
       "${platforms}", "${genres}", "${themes}", "${similarGames}") 
       ON DUPLICATE KEY UPDATE giantbombUrl="${giantbombUrl}", icon="${icon}"`;
      console.log(name + " inserted with ID " + id);
      con.query(gbSql);

      //con.query(steamSql);
      i++;
      setTimeout(arguments.callee, 1000);
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
