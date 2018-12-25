const fs = require("fs");
const path = require("path");

const api = require('./api');

const TEAM_ID = process.env.TEAM_ID;

const MODS_FILENAME = path.join(__dirname, "mods.txt");
const BANNED_FILENAME = path.join(__dirname, "banned.txt");

let modUsernames = [];
let bannedUsernames = [];
let teamUsernames = [];

exports.banUsername = username => {
  fs.appendFile(BANNED_FILENAME, username.toLowerCase() + "\n", err => {
    if (err) throw err;
    console.log("wrote username to banned.txt:", username);
    bannedUsernames.push(username.toLowerCase());
    chatSpectator(`Banned ${username}.`);
  });
};

exports.unbanUsername = username => {
  bannedUsernames = bannedUsernames.filter(
    name => name !== username.toLowerCase()
  );
  fs.writeFile(BANNED_FILENAME, bannedUsernames.join("\n") + "\n", err => {
    if (err) throw err;
    console.log("unbanned:", username);
    chatSpectator(`Unbanned ${username}.`);
  });
};

exports.makeMod = username => {
  fs.appendFile(MODS_FILENAME, username.toLowerCase() + "\n", err => {
    if (err) throw err;
    console.log("made mod:", username);
    modUsernames.push(username.toLowerCase());
    chatSpectator(`Promoted ${username} to mod.`);
  });
};


exports.usernameIsMod = username => {
  return modUsernames.includes(username.toLowerCase());
};

exports.usernameIsBanned = username => {
  return bannedUsernames.includes(username.toLowerCase());
};

exports.usernameInTeam = username => {
  if (!TEAM_ID) return true;
  return teamUsernames.includes(username.toLowerCase());
}


function cacheModUsernames() {
  fs.readFile(MODS_FILENAME, (err, data) => {
    if (err) throw err;
    modUsernames = data
      .toString()
      .split("\n")
      .filter(line => !!line.trim());
    console.log(`cached ${MODS_FILENAME}: `, modUsernames);
  });
}

function cacheBannedUsernames() {
  fs.readFile(BANNED_FILENAME, (err, data) => {
    if (err) throw err;
    bannedUsernames = data
      .toString()
      .split("\n")
      .filter(line => !!line.trim());
    console.log(`cached ${BANNED_FILENAME}: `, bannedUsernames);
  });
}

function cacheTeamUsernames() {
  if (!TEAM_ID) return;

  let usernames = [];

  api.getTeamMembers(TEAM_ID,
    data => {
      usernames.push(data.username.toLowerCase());
    },
    _ => {
      teamUsernames = usernames;
      console.log(`cached team users: `, teamUsernames);
    }
  );
}

function updateCache() {
  cacheModUsernames();
  cacheBannedUsernames();
  cacheTeamUsernames();
}

setImmediate(updateCache);
setInterval(updateCache, 60000);
