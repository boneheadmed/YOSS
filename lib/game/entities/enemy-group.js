ig.module( 
	'game.entities.enemy-group' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityEnemyGroup = ig.Entity.extend({
  size: {x: 8, y: 8},
  checkAgainst: ig.Entity.TYPE.NONE,
  
  _wmScalable: true,
  _wmDrawBox: true,
  _wmBoxColor: 'rgba(196, 255, 0, 0.7)',

  changeDirection: function() {
    if (this.timer.delta() >= 0){
      this.timer.set(1);
      this.vel.x = this.vel.x * -1;
    }
  },

  speedUp: function() {
    amount = 2;
    if (this.vel.x < 0) {
      amount = amount * - 1;
    }
    this.vel.x = this.vel.x + amount;
  },

  init: function( x, y, settings ) {
    this.parent( x, y, settings );
    this.timer = new ig.Timer(0);
    this.vel.x = -30;
    this.vel.y = 0;

  },

 update: function(){
    if (this.timer.delta() < -0.7){
      this.vel.y = 20;
    }
    else{
      this.vel.y =0;
    }
    //Choose a random number to see if a new enemy-blink will be generated 
    var randomnumber=Math.floor(Math.random()*250);
    if (randomnumber == 5) {
	    ig.game.spawnEntity( EntityEnemyBlink, ig.system.width, 0);
    }

    this.parent();
  }

});

});
