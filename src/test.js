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
  let i = 0;
  let app, appid, appData, steamSql, giantbombSql;
  (async function() {
    appid = steamApps[i].appid;
    appJson = await axios.get(
      "http://store.steampowered.com/api/appdetails?appids=" + appid
    );
    const gbGame = await axios.get(giantbombPrefix + i + giantbombSuffix);
    console.log("GB " + i + " " + gbGame.data.error);
    app = appJson["data"][appid];
    if (app["success"]) {
      console.log("Steam " + appid + " OK");
    } else {
      console.log(appid + " not found in Steam\n");
    }
    i++;
    //fetchGiantBombData(i);
    setTimeout(arguments.callee, 1000);
  })();
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

async function fetchSteamData(name) {
  con.query(`SELECT * FROM steam WHERE name = '${name}'`, async function(
    err,
    result
  ) {
    if (err) throw err;
    // Get the appid matching the given name from the database.
    appid = result[0].appid;
    const json = await axios.get(urlPrefix + appid);
    const game = json.data;
    console.log(game);
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
