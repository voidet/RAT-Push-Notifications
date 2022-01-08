import axios from "axios";
import flatCache from "flat-cache";
import readline from "readline-sync";

var [myLat, myLng, radius, token, userKey] = Array(6).fill("");

const cache = flatCache.load("rat");
const defaults = cache.getKey("defaults");
purgeExpiredCache();

if (defaults) {
  var { myLat, myLng, radius, token, userKey } = defaults;
}

if (myLat === "") {
  myLat = readline.question("What your lat? ");
}

if (myLng === "") {
  myLng = readline.question("What your lng? ");
}

if (radius === "") {
  radius = readline.question("What radius in km? ");
}

if (token === "") {
  token = readline.question("What your pushover token (not user key)? ");
}

if (userKey === "") {
  userKey = readline.question("What your pushover user key? ");
}

if (!defaults) {
  const persist = readline.question("Save these as defaults (write true)? ");
  if (persist === "true") {
    cache.setKey("defaults", { myLat, myLng, radius, token, userKey });
    cache.save(true);
  }
}

// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function distance(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

async function getRats() {
  /// HUGE SHOUT OUT TO FINDARAT.COM.AU
  return axios
    .get("https://sparkling-voice-bdd0.pipelabs-au.workers.dev/")
    .then((res) => {
      const rats = res.data.filter((store) => {
        if (
          distance(store.lat, store.lng, myLat, myLng) <= radius &&
          ["IN_STOCK", "LOW_STOCK"].includes(store.status)
        ) {
          return true;
        }
        return false;
      });
      return getNewRats(rats);
    })
    .catch(function (error) {
      console.log("Error finding a rat, will try again in 5mins");
    });
}

async function postMessage(results) {
  const storeNames = results
    .map((store) => {
      return store.name.trim();
    })
    .join(", ");

  await axios
    .post("https://api.pushover.net/1/messages.json", {
      token: token,
      user: userKey,
      title: `Found ${results.length} Rats`,
      message: storeNames,
    })
    .then((res) => {
      console.log(storeNames);
      console.log("Posted Notification to hunters");
    });
}

function purgeExpiredCache() {
  var cachedRats = cache.getKey("rats") || [];
  const targetTime = new Date().getTime() - 4 * 60 * 60 * 1000;
  const newCache = cachedRats.filter((rat) => {
    return rat.discovered_time > targetTime;
  });
  cache.setKey("rats", newCache);
  cache.save(true);
}

function updateCache(rats) {
  var cachedRats = cache.getKey("rats") || [];
  rats.forEach((rat) => {
    rat.discovered_time = new Date().getTime();
  });
  cachedRats = cachedRats.concat(rats);
  cache.setKey("rats", cachedRats);
  cache.save(true);
}

function getNewRats(rats) {
  var cachedRats = cache.getKey("rats") || [];
  const cachedRatsIds = cachedRats.map((rat) => {
    return rat.id;
  });
  const newRats = rats.filter((cachedRat) => {
    return !cachedRatsIds.includes(cachedRat.id);
  });
  return newRats;
}

function hunt() {
  getRats().then((newRats) => {
    if (newRats && newRats.length === 0) {
      console.log("Found no rats this round.");
      return;
    }

    console.log(`Found ${newRats.length} Rats`);

    postMessage(newRats);
    updateCache(newRats);
  });
}

var minutes = 5 * 60 * 1000;
setInterval(function () {
  hunt();
}, minutes);
hunt();
