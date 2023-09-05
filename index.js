const CryptoJS = require('crypto-js');
const rpc = require('discord-rich-presence')('1148377208864374884');
const fs = require('fs');
const path = require('path');

/* Load settings from settings.json and prepare Subsonic login information */
const SETTINGS_PATH = path.join(__dirname, 'settings.json');
const SETTINGS = JSON.parse(fs.readFileSync(SETTINGS_PATH, { encoding: 'utf8' }));
const SALT = Math.random()*100000000000000000000;
const TOKEN = CryptoJS.MD5(`${SETTINGS.subsonic.password}${SALT}`)

/* We create two empty objects to compare against and decide whether the song has changed or not */
let prevResponse = {};
let response = {};
/* When reads is 5, it means that we have detected that the song has been playing for long enough
 * for it to not be an incorrectly detected skip, so we don't spam Discord's API and Discord is happy. */
let reads = 0;
/* RPC client status */
let connected = false;

function getLargeImage(album, id, server) {
  if (SETTINGS.subsonic.imagesUrl) {
    return {
      image: `${SETTINGS.subsonic.imagesUrl}${id}`,
      text: album
    };
  } else {
    return {
      image: server,
      text: server
    };
  }
}

function getSmallImage(server) {
  if (SETTINGS.subsonic.imagesUrl) {
    return {
      image: server,
      text: server
    };
  } else {
    return {
      image: 'play',
      text: 'Playing'
    };
  }
}

function setPresence(name, artist, album, server, id) {
  let largeImage = getLargeImage(album, id, server);
  let smallImage = getSmallImage(server);
  rpc.updatePresence({
    state: `by ${artist}`,
    details: name,
    largeImageKey: largeImage.image,
    largeImageText: largeImage.text,
    smallImageKey: smallImage.image,
    smallImageText: smallImage.text,
    instance: true
  });
  console.log(`[RPC] Updated presence: now playing "${name}" by "${artist}" on "${server}"`);
}

function getData() {
  fetch(`${SETTINGS.subsonic.url}/rest/getNowPlaying?f=json&c=${SETTINGS.client.clientName}&v=${SETTINGS.client.clientVersion}&u=${SETTINGS.subsonic.username}&s=${SALT}&t=${TOKEN}`)
    .then(r => r.json())
    .then(j => {
      let nowPlaying = j['subsonic-response']['nowPlaying'];
      if (nowPlaying.entry) {
        if (!connected) {
          console.log("[RPC] Connecting RPC...");
          connected = true;
        }
        let entries = nowPlaying['entry'];
        /* We save the existing response to compare later */
        prevResponse = response;
        response = entries[0];
        if (JSON.stringify(response) != JSON.stringify(prevResponse)) {
          /* The song has changed. */
          reads = 0;
        }
        if (reads == 5) {
          /* See comment above declaration of "reads" */
          setPresence(response.title, response.artist, response.album, j['subsonic-response'].type, response.id);
        }
        if (reads <= 5) {
          reads++;
        }
      } else {
        /* We disconnect the RPC client when the server reports an empty player list */
        if (connected) {
          console.log("[RPC] Disconnecting RPC...");
          rpc.disconnect();
          connected = false;
        }
      }
      setTimeout(getData, SETTINGS.subsonic.queryInterval);
    })
}

getData()
