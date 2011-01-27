ig.module(
	'game.director.player-controller'
)
.requires(
	'impact.impact'
)
.defines(function(){

ig.PlayerController = ig.Class.extend({

  lives: 3,
  score: 0,
  extraLife: 10000,
  currentLevel: 0,
 
  playerShip: null,

  rankPoints: [0, 6000, 15000, 25000, 35000, 50000], 
  rankNames: ["Peon", "Jockey", "Cowboy", "Ranger", "Commander", "Knight"],

  init: function(){
    this.defaults = {lives: this.lives, score: this.score, currentLevel: this.currentLevel};
  },

  remainingLives: function(){
    //If player ship was recently destroyed then subtract one life
    if (this.playerShip.checkJustDied()){
      this.lives--;
      this.playerShip.lives = this.lives;
      if (this.lives < 1){
        this.lives = 0;
        this.playerShip.kill();
      }
    }
    return this.lives;
  },

  addToScore: function(points){
    if ((this.score += points) > this.extraLife){
      this.lives++;
      this.extraLife+= 10000;
    }
    
  },

  addPlayerEntity: function(playerEntity){
    this.playerShip = playerEntity;
    this.playerShip.lives = this.lives;
  },

  increaseLevel: function(){
    this.currentLevel++;
  },

  getRank: function(){
    for (i=0; i < this.rankPoints.length; i++) { 
      if (this.score < this.rankPoints[i]){
        break;
      }
    }
    return ('Space ' + this.rankNames[i-1]);
  },

  getLevel: function(){
    return(this.currentLevel);
  }
  
});

});
