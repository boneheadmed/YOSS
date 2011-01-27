ig.module( 
	'game.entities.enemy-wide' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityEnemyWide = ig.Entity.extend({

  size: {x:48, y:48},
  halfWidth: 24,
	type: ig.Entity.TYPE.B, // Enemy un-friendly group
  collides: ig.Entity.COLLIDES.PASSIVE,

  health: 30,
  points: 300,
  groupEntity: null,

  
  animSheet: new ig.AnimationSheet( 'media/ship6.png', 48, 48),
  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );

    this.addAnim( 'idle', 0.2, [0,1,2,2,1,0] );
    
  },

  receiveDamage: function(amount, from) {
    //If this enemy will be killed then spawn an explosion
    if (this.health - amount <= 0){
      ig.game.playerController.addToScore(this.points);
      //Create explosion with coordinates of center of this entity.
			ig.game.spawnEntity( EntityExplosion, this.pos.x + (this.size.x/2), this.pos.y + (this.size.y/2));
    }
    this.parent(amount, from);
  },

  update: function(){
    //Choose a random number to see if the entity will fire
    var randomnumber=Math.floor(Math.random()*200);
    if (randomnumber == 5) {
	    ig.game.spawnEntity( EntityEnemyWideFire, this.pos.x + this.halfWidth, this.pos.y + 22 );
    }
    //Check to see if entity has reached horizontal edge of screen,
    //if so instruct the groupEntity to change direction.
    if ( (this.pos.x < 0) || (this.pos.x > 296)) {
      this.groupEntity.changeDirection();
    }
    this.vel.x = this.groupEntity.vel.x;
    this.vel.y = this.groupEntity.vel.y;
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

EntityEnemyWideFire = ig.Entity.extend({
	size: {x: 24, y: 24},
  halfWidth: 12, 
	maxVel: {x: 200, y: 200},


	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A, // Check Against A - our player's group
	collides: ig.Entity.COLLIDES.LITE,
		
	animSheet: new ig.AnimationSheet( 'media/MissleMod.png', 24, 24),

  health: 10,
  points: 50,

  init: function( x, y, settings ) {
    this.parent( x - this.halfWidth, y, settings );

    //Every 1 second, check for direction change of the missle
    this.addAnim( 'left', 1, [0] );
    this.addAnim( 'down', 1, [1] );
    this.addAnim( 'right', 1, [2] );
    this.direction = [
                       {x: -50, y:0, missleAnim: this.anims.left}, 
                       {x: 0, y: 50, missleAnim: this.anims.down}, 
                       {x: 50, y:0, missleAnim: this.anims.right} 
                     ];
    this.vel.y = this.direction[1].y;
    this.currentAnim = this.direction[1].missleAnim;
    //Check about changing direction every 1 second
    this.directionTimer = new ig.Timer(1);
  },

  receiveDamage: function(amount, from) {
    //If this enemy will be killed then spawn an explosion
    if (this.health - amount <= 0){
      ig.game.playerController.addToScore(this.points);
      //Create explosion with coordinates of center of this entity.
			ig.game.spawnEntity( EntityExplosion, this.pos.x + (this.size.x/2), this.pos.y + (this.size.y/2));
    }
    this.parent(amount, from);
  },

  update: function(){
    //If the bullet has gone beyond the lower visible screen then kill it.
    if (this.pos.y > 240){
      this.kill();
    }
    if (this.directionTimer.delta() > 0){
      var randomnumber=Math.floor(Math.random()*3);
      this.vel.x = this.direction[randomnumber].x;
      this.vel.y = this.direction[randomnumber].y;
      this.currentAnim = this.direction[randomnumber].missleAnim;
      this.directionTimer.reset();
    }
    this.parent();
  },

	// This function is called when this entity overlaps anonther entity of the
	// checkAgainst group. I.e. for this entity, the player's A group.
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.kill();
	}	

});

});




