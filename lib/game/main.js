ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',

  'game.entities.player-ship',
  'game.entities.enemy-basic',
  'game.entities.enemy-blink',
  'game.entities.enemy-wide',
  'game.entities.enemy-spinner',
  'game.entities.enemy-group',
  'game.entities.enemy-base',
  'game.entities.explosion',

  'game.levels.title',
  'game.levels.main',
  'game.levels.level2',
  'game.levels.level3',
  'game.levels.level4',
  'game.levels.level5',

  'game.director.director',
  'game.director.player-controller'

)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),

  name: "YOSS",

  STATE: { 
    GAMEOVER: 0,
    GAMEPLAYING: 1,
    PLAYERELIMINATED: 2,
    LEVELTRANSITION: 3
  },

	
	init: function() {
    ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
    ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.Z, 'shoot' );
		ig.input.bind( ig.KEY.ENTER, 'ok' );

    //this.myDirector = new ig.Director(this, [LevelTitle,   LevelLevel5]);
    this.myDirector = new ig.Director(this, [LevelTitle, LevelMain,  LevelLevel2, LevelLevel3, LevelLevel4, LevelLevel5]);
    //Timer used to check level every second to see if all enemies (type B) have been destroyed.
    this.timer = new ig.Timer(1);
    this.eliminatedTimer = new ig.Timer(5);
    this.transitionTimer = new ig.Timer(3);

    this.currentState = this.STATE.GAMEOVER;
    this.drawCoordinates = {
      lives: {x: ig.system.width-30, y: ig.system.height-10 },
      score: {x: ig.system.width-50, y: 0 },
      gameover: {x: ig.system.width/2, y: ig.system.height/2 },
      title: {x: ig.system.width/2, y: ig.system.height/2 - 30 }
    } 

	},

  drawBackground: function(){
    //Draw the background of the level only and
    //not the entitities. Used when transitioning to a new level.
		ig.system.clear( this.clearColor );
		
		for( var i = 0; i < this.backgroundMaps.length; i++ ) {
			this.backgroundMaps[i].draw();
		}
  },

  addGroup: function(group){
    //Get the group entity named 'grouping' and insert into each
    //enemy that is controlled by group movement behavior.
    var egroups = [EntityEnemyBasic, EntityEnemyWide, EntityEnemySpinner, EntityEnemyBase];
    if (group){
      for (en=0; en < egroups.length; en++) {
        var enemy = this.getEntitiesByType( egroups[en] );
        for(i=0; i < enemy.length; i++) {
          enemy[i].groupEntity = group;
        }
      }
    }
  },

  getPlayerShip: function(){
    return (this.getEntityByName( "player-ship" ));
  },

  isLevelCompleted: function(){
    enemyTypes = [EntityEnemyBasic, EntityEnemyBlink, EntityEnemyWide, EntityEnemySpinner, EntityEnemyBase];
    for (en=0; en < enemyTypes.length; en++) {
      var enemy = this.getEntitiesByType( enemyTypes[en] );
      if (enemy.length >0){
        return false; 
      }
    }
    return true;
  },

  changeState: function(newState){
    this.currentState = newState;
    switch(this.currentState){
      case this.STATE.GAMEPLAYING:
        this.timer.reset();
        break;
      case this.STATE.LEVELTRANSITION:
        //Advance to next level. If false then we are at the
        //end of the levels and need to go back to the first 
        //playing level.
        if (!this.myDirector.nextLevel()){
          this.myDirector.jumpTo(LevelMain);
        }
        var group = this.getEntityByName('grouping');
        this.addGroup(group);
        this.playerController.addPlayerEntity(this.getPlayerShip());
        this.playerController.increaseLevel();
        this.transitionTimer.reset();
        break;
      case this.STATE.PLAYERELIMINATED:
        this.eliminatedTimer.reset();
        break;
      default:
        this.myDirector.jumpTo(LevelTitle);
        break;
    }
  },
	
	update: function() {
		// Update all entities and backgroundMaps
    switch(this.currentState){
      case this.STATE.GAMEPLAYING:
        // Check to see if all enemies have been destroyed, every 1 second.
        // If they have then transition to the next level. Also check to see
        // if the player is out of lives. If so change to player eliminated 
        // game state.
        if (this.timer.delta() > 0){
          if (this.playerController.remainingLives() < 1){
            this.changeState(this.STATE.PLAYERELIMINATED);
          }
          if (this.isLevelCompleted()){
            this.changeState(this.STATE.LEVELTRANSITION);
          }
          this.timer.reset();
        }
        break;
      case this.STATE.PLAYERELIMINATED:
        if (this.eliminatedTimer.delta() > 0){
          this.changeState(this.STATE.GAMEOVER);
        }
        break;
      case this.STATE.LEVELTRANSITION:
        if (this.transitionTimer.delta() > 0){
          this.changeState(this.STATE.GAMEPLAYING);
        }
        break;
      default:
        //STATE.GAME.OVER displays title screen. Pressing enter starts game.
		    if( ig.input.pressed('ok') ) {
          //Create new player controller every time a new game is started.
          this.playerController = new ig.PlayerController();
			    this.changeState(this.STATE.LEVELTRANSITION);
		    }
        break;
    }

    //Call ig.game.update function unless in level transition.
    //In level transition only the background is drawn and nothing
    //is updated.
    if (this.currentState != this.STATE.LEVELTRANSITION){
      this.parent();
    }
		
		// Add your own, additional update code here

	},
	
	draw: function() {

    if (this.currentState != this.STATE.LEVELTRANSITION){
		  // Draw all entities and backgroundMaps
		  this.parent();
    }
    else{
      //In a level transition, therefore draw only the background
      this.drawBackground();
    }
		
		// Add your own drawing code here
    
    switch(this.currentState){
      case this.STATE.GAMEPLAYING:
        this.font.draw( 'Score ' + (this.playerController.score), this.drawCoordinates.score.x, this.drawCoordinates.score.y, ig.Font.ALIGN.CENTER );
        this.font.draw( 'Lives: ' + (this.playerController.lives-1), this.drawCoordinates.lives.x, this.drawCoordinates.lives.y, ig.Font.ALIGN.CENTER );
        break;
      case this.STATE.PLAYERELIMINATED:
        this.font.draw( 'Score ' + (this.playerController.score), this.drawCoordinates.score.x, this.drawCoordinates.score.y, ig.Font.ALIGN.CENTER );
        this.font.draw( 'Lives: 0', this.drawCoordinates.lives.x, this.drawCoordinates.lives.y, ig.Font.ALIGN.CENTER );
        this.font.draw( 'GAME OVER!', this.drawCoordinates.gameover.x, this.drawCoordinates.gameover.y, ig.Font.ALIGN.CENTER );
        this.font.draw( 'Final Rank: ' + this.playerController.getRank(), this.drawCoordinates.gameover.x, this.drawCoordinates.gameover.y + 15, ig.Font.ALIGN.CENTER );
        break;
      case this.STATE.LEVELTRANSITION:
        this.font.draw( 'Level ' + this.playerController.getLevel(), this.drawCoordinates.gameover.x, this.drawCoordinates.gameover.y, ig.Font.ALIGN.CENTER );
        this.font.draw( 'Rank: ' + this.playerController.getRank(), this.drawCoordinates.gameover.x, this.drawCoordinates.gameover.y + 20, ig.Font.ALIGN.CENTER );
        break;
      default:
        this.font.draw( 'YOSS', this.drawCoordinates.title.x, this.drawCoordinates.title.y - 10, ig.Font.ALIGN.CENTER );
        this.font.draw( '(Ye Old Space Shooter)', this.drawCoordinates.title.x, this.drawCoordinates.title.y + 5, ig.Font.ALIGN.CENTER );
        this.font.draw( 'Press \'ENTER\' to begin.', this.drawCoordinates.gameover.x, this.drawCoordinates.gameover.y + 15, ig.Font.ALIGN.CENTER );
        this.font.draw( 'Directions: Right and Left arrows', this.drawCoordinates.gameover.x, this.drawCoordinates.gameover.y + 35, ig.Font.ALIGN.CENTER );
        this.font.draw( 'to move. \'z\' to fire.', this.drawCoordinates.gameover.x, this.drawCoordinates.gameover.y + 45, ig.Font.ALIGN.CENTER );
        this.font.draw( 'Extra ship every 10,000 pts.', this.drawCoordinates.gameover.x, this.drawCoordinates.gameover.y + 65, ig.Font.ALIGN.CENTER );
        break;
        break;
    }
	 
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 320, 240, 2 );

});
