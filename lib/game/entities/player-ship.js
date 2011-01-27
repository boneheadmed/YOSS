ig.module( 
	'game.entities.player-ship' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityPlayerShip = ig.Entity.extend({

  size: {x:24, y:24},
  halfWidth: 12,

	type: ig.Entity.TYPE.A, // Player friendly group
	checkAgainst: ig.Entity.TYPE.B,
  collides: ig.Entity.COLLIDES.PASSIVE,

  health: 10,
  bulletCount: 0,
  //Note: lives is updated by the player-controller
  lives: 3,
  justDied: false,

  STATE: { 
  ALIVE: 0,
  DEAD: 1,
  TRANSITION: 2
  },

  animSheet: new ig.AnimationSheet( 'media/Ship2.png', 24, 24),

  init: function( x, y, settings ) {
    this.parent( x, y, settings );

    this.addAnim( 'idle', 1, [0] );
    this.addAnim( 'transition', 0.1, [1,6] );
    this.addAnim( 'dead', 1, [6] );
    //Used to cause a reload delay after 3 bullets fired
    this.reloadTimer = new ig.Timer(0);
    this.recoverTimer = new ig.Timer(4);
    this.currentState = this.STATE.ALIVE;
  },

 receiveDamage: function(amount, from) {
    //If the player will be killed then spawn an explosion
    if (this.health - amount <= 0){
      this.changeState(this.STATE.DEAD);
      //Create explosion with coordinates of center of this entity.
			ig.game.spawnEntity( EntityExplosion, this.pos.x + (this.size.x/2), this.pos.y + (this.size.y/2));
    }
    //this.parent(amount, from);
  },

  checkJustDied: function(){
    //Check to see if the ship recently changed to STATE.DEAD
    if (this.justDied) {
      this.lives--;
      return !(this.justDied = false);
    }
    else{
      return false;
    }
  },

  changeState: function(newState){
    this.currentState = newState;
    switch(this.currentState){
      case this.STATE.DEAD:
        this.justDied = true;
        this.collides =  ig.Entity.COLLIDES.NEVER;
		    this.checkAgainst = ig.Entity.TYPE.NONE;
			  this.currentAnim = this.anims.dead;
        this.type = ig.Entity.TYPE.NONE;
        this.recoverTimer.reset();
        break;
      case this.STATE.TRANSITION:
        this.collides =  ig.Entity.COLLIDES.PASSIVE;
		    this.checkAgainst = ig.Entity.TYPE.NONE;
			  this.currentAnim = this.anims.transition;
        this.type = ig.Entity.TYPE.NONE;
        break;
      default:
        this.collides =  ig.Entity.COLLIDES.PASSIVE;
		    this.checkAgainst = ig.Entity.TYPE.NONE;
			  this.currentAnim = this.anims.idle;
        this.type = ig.Entity.TYPE.A;
        break;
    }
  },

	update: function() {

	  if (this.currentState != this.STATE.DEAD){
      // Movement left or right for ALIVE and TRANSITION 
      if( ig.input.state('left') ) {
        this.vel.x = -100;
      }
      else if( ig.input.state('right') ) {
        this.vel.x = 100;
      }
      else {
        this.vel.x = 0
      }
      if (this.currentState != this.STATE.TRANSITION){
        // shoot, only for ALIVE
        if( ig.input.pressed('shoot') ) {
          if (this.bulletCount < 3){
            ig.game.spawnEntity( EntityPlayerFire, this.pos.x + this.halfWidth, this.pos.y - 2 );
          this.bulletCount++;
          this.reloadTimer.set(0.4);
          }
          else{
            if (this.reloadTimer.delta() > 0){
              this.bulletCount = 0;
            }
          }
        }
      }
      else{
        //Check to see if the player has been in transition for more
        //than 2 seconds and player has remaining lives. 
        //If so revert state to ALIVE.
        if (this.recoverTimer.delta() > -1 && this.lives >= 1){
          this.changeState(this.STATE.ALIVE);
        }
      }
    }
    else{
      //Check to see if the player has been DEAD (completely inactive)
      //for more than 1 second. If so change state to TRANSITION.
      if (this.recoverTimer.delta() > -3){
        this.changeState(this.STATE.TRANSITION);
      }
    }

		this.parent();
	}

});

EntityPlayerFire = ig.Entity.extend({
	size: {x: 4, y: 5},
  halfWidth: 2, 
	offset: {x: 4, y: 4},
	maxVel: {x: 200, y: 200},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B, // Check Against B - our evil enemy group
	collides: ig.Entity.COLLIDES.LITE,
		
	animSheet: new ig.AnimationSheet( 'media/Bullets-m2.png', 13, 13 ),

  init: function( x, y, settings ) {
    this.parent( x - this.halfWidth, y, settings );

    this.vel.y = -100;
    this.addAnim( 'idle', 1, [1] );

  },

  update: function(){
    //If the bullet has gone beyond the upper visible screen then kill it.
    if (this.pos.y < 0){
      this.kill();
    }
    this.parent();
  },

	// This function is called when this entity overlaps anonther entity of the
	// checkAgainst group. I.e. for this entity, all entities in the B group.
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.kill();
	}	

});

});




