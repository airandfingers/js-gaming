
var _ = require("lodash");

/*

Player Enters
-Query for compatible games
-Add the player to a list for those games
-Do next tick - Find a match with current players

Find a match with current players
-For each player
--for each of those players compatible game's waiting list
---check if that players player query matches the games waiting list (Remove blocked players/leavers/winloss/etc)
----If the remaining players is enough to start a game
-----Remove players until we hit maximum
-----Remove the players here from all waiting lists
-----Send a match Start request to the game.

*/

function MatchMaker(games){
  this.games = games;
  this.gameIndex = {};
  this.waiting_players = [];
  this.needing_players = [];
  this.isChecking = false;
  var l = games.length;
  var game;
  while(l--){
    game = games[l];
    this.gameIndex[game.name] = {
      min_players:game.minplayers,
      waiting:[]
    };
  }
}

MatchMaker.prototype.addUser = function(user,query,next){
  var _this = this;
  var games = query.game?_.filter(this.games, query.game):this.games;
  var l = games.length;
  if(!l) return next(new Error("404"));
  var item = {user:user,query:query,games:games};
  if(!user.joinInProgress || !this.needing_players.length){
    return this.addToWaitingList(item,next);
  }
  this.checkActiveMatches(item,function(err){
    if(err) return next(err);
    _this.addToWaitingList(item,next);
  });
};

MatchMaker.prototype.removeUser = function(userInfo){
  var i = _.indexOf(this.waiting_players, userInfo);
  this.waiting_players.splice(i,1);
  var l = userInfo.games.length;
  while(l--){
    i = _.indexOf(this.gameIndex[userInfo.games[l].name].waiting, userInfo);
    this.gameIndex[userInfo.games[l].name].waiting.splice(i,1);
  }
};

MatchMaker.prototype.checkActiveMatches = function(userItem,next){
  //We would cast a query on the active matches
  //Nothing for now though

  this.addToWaitingList(userItem,next);
};

MatchMaker.prototype.addToWaitingList = function(userItem,next){
  var games = userItem.games;
  var l = games.length;
  this.waiting_players.push(userItem);
  while(l--){
    this.gameIndex[games[l]].waiting.push(userItem);
  }
  this.checkForMatch();
  next();
};

MatchMaker.prototype.checkForMatch = function(){
  if(this.isChecking) return;
  this.isChecking = true;
  process.nextTick(this.createMatch.bind(this));
};

MatchMaker.prototype.needPlayer = function(matchInfo, game){
  game = _.findOne(this.games, {name:game});
  var l = this.waiting_players.length;
  var match_found = this.waiting_players.some(function(player) {
    if(_.matches(player.query.game)(game)){
      this.removePlayer(player);
      game.sendPlayerToMatch(player,matchInfo);
      return true; //break
    }
  });
  if (match_found) return;

  var index = _.indexOf(_.pluck(this.needing_players,"id"),id);
  if(index === -1){
    this.needing_players.push({
      id:matchInfo.id,
      matchInfo:matchInfo,
      game:game,
      needs:1
    });
  }else{
    this.needing_players[index].number++;
  }
};

MatchMaker.prototype.deadGame = function(matchid, name){
  //Happens when all players leave
};

function applyPlayerQuery = function(players, player_query) {
  return _.filter(players, player_query);
}

MatchMaker.prototype.createMatch = function(){
  var l = this.waiting_players.length;
  var ll = void(0);
  var lll = void(0);
  var i =void(0);
  var ii = void(0);
  var iii = void(0);
  var player = void(0);
  var game = void(0);
  var players = void(0);
  for(i=0;i<l;i++){
    player = this.waiting_players[i];
    ll = player.games.length;
    for(ii=0;ii<ll;ii++){
      game = player.games[ii];
      players = game.waiting;
      if(players.length < game.minplayers) continue;

      // TODO: update this to apply all players' player queries
      // this should prefer the players first in the queue, but
      // should start a new game if at all possible
      if(player.query.player){
        players = applyPlayerQuery(players, player.query.player);
        if(players.length < game.minplayers) continue;
      }

      while(players.length > game.maxplayers) players.pop();
      lll = players.length;
      for(iii=0;iii<lll;iii++){
        this.removeUser(players[iii]);
      }
      process.nextTick(this.createMatch.bind(this));
      return game.sendNewMatch(players);
    }
  }
  this.isChecking = false;
};

module.exports = MatchMaker;
