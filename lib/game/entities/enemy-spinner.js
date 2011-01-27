ig.module( 
	'game.entities.enemy-spinner' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityEnemySpinner = ig.Entity.extend({

  size: {x:24, y:32},
  halfWidth: 12,
	type: ig.Entity.TYPE.B, // Enemy, un-friendly group
	checkAgainst: ig.Entity.TYPE.A, // Check Against A - our player's group
  collides: ig.Entity.COLLIDES.LITE,

  health: 40,
  points: 300,
  groupEntity: null,
  maxVel: {x:200, y:200},


  STATE: { 
  EMERGING:0,
  ALIVE: 1,
  SPINNING: 2,
  ATTACKING: 3,
  DEAD: 4
  },

  
  animSheet: new ig.AnimationSheet( 'media/Barrel3.png', 24, 32 ),
  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );

    this.addAnim( 'down', 1, [1] );
    this.addAnim( 'left', 1, [6] );
    this.addAnim( 'right', 1, [8] );
    this.addAnim( 'spinCounterclock', 0.05, [1,0,3,6,7,8,5,2] );
    this.addAnim( 'spinClockwise', 0.05, [1,2,5,8,7,6,3,0] );

    this.attackAccel= [
                       {x: -50, y:100, spinnerAnim: this.anims.left}, 
                       {x: 0, y: 100, spinnerAnim: this.anims.down}, 
                       {x: 50, y:100, spinnerAnim: this.anims.right} 
                     ];


    this.stateSequence = [this.STATE.EMERGING, this.STATE.ALIVE, this.STATE.SPINNING, this.STATE.ATTACKING];
    this.currentStateNum = 1;
    this.emergeTimer = new ig.Timer(1.2);
  },

  nextState: function(){
    this.currentStateNum++;
    //alert("state: " + this.currentStateNum);
    switch(this.stateSequence[this.currentStateNum]){
      case this.STATE.ALIVE:
        this.vel.y = 0;
        this.accel.y = 0;
        break;
      case this.STATE.SPINNING:   
        if (this.vel.x < 0){
          this.currentAnim = this.anims.spinCounterclock;
        }
        else{
          this.currentAnim = this.anims.spinClockwise;
        }
        break;
      case this.STATE.ATTACKING:   
        var rand=Math.floor(Math.random()*2);
        //If the entity is before the midpoint of the screen then only move down or right 
        if (this.pos.x < ig.system.width/2){
          rand++;
        }
        this.accel.x = this.attackAccel[rand].x;
        this.accel.y = this.attackAccel[rand].y;
        this.currentAnim = this.attackAccel[rand].spinnerAnim;        
        break;
      default:
        break;
    }

  },

  receiveDamage: function(amount, from) {
    //Only advance state if not attacking.
    if (this.stateSequence[this.currentStateNum] != this.STATE.ATTACKING){ 
      this.nextState();
    }
    //If this enemy will be killed then spawn an explosion
    if (this.health - amount <= 0){
      ig.game.playerController.addToScore(this.points);
      //Create explosion with coordinates of center of this entity.
			ig.game.spawnEntity( EntityExplosion, this.pos.x + (this.size.x/2), this.pos.y + (this.size.y/2));
    }
    this.parent(amount, from);
  },

  update: function(){
    switch(this.stateSequence[this.currentStateNum]){
      case this.STATE.EMERGING:
        if (this.emergeTimer.delta() > 0 ){
          this.nextState();
        }
        break;
      case this.STATE.ATTACKING:            
        break;
      default:
        //Check to see if entity has reached horizontal edge of screen,
        //if so instruct the groupEntity to change direction.
        if ( (this.pos.x < 0) || (this.pos.x > 296)) {
          this.groupEntity.changeDirection();
        }
        this.vel.x = this.groupEntity.vel.x;
        this.vel.y = this.groupEntity.vel.y;
        break;
    }
    if (this.pos.y > 240){
      this.kill();
    }
    this.parent();
  },

	// This function is called when this entity overlaps anonther entity of the
	// checkAgainst group. I.e. for this entity, the player's A group.
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.receiveDamage( 10, this );
	},

  kill: function(){
    this.groupEntity.speedUp();
    this.parent();
  }

});


});




