ig.module( 
	'game.entities.enemy-basic' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityEnemyBasic = ig.Entity.extend({

  size: {x:24, y:24},
  halfWidth: 12,
	type: ig.Entity.TYPE.B, // Enemy un-friendly group
  collides: ig.Entity.COLLIDES.PASSIVE,

  health: 10,
  points: 100,
  groupEntity: null,

  
  animSheet: new ig.AnimationSheet( 'media/enemy1.png', 24, 24 ),
  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );

    this.addAnim( 'idle', 1, [2] );
    
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
    var randomnumber=Math.floor(Math.random()*400);
    if (randomnumber == 5) {
	    ig.game.spawnEntity( EntityEnemyFire, this.pos.x + this.halfWidth, this.pos.y + 12 );
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

EntityEnemyFire = ig.Entity.extend({
	size: {x: 7, y: 11},
  halfWidth: 3, 
	maxVel: {x: 200, y: 200},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A, // Check Against A - our player's group
	collides: ig.Entity.COLLIDES.NONE,
		
	animSheet: new ig.AnimationSheet( 'media/Enemy-bullet.png', 7, 11 ),

  init: function( x, y, settings ) {
    this.parent( x - this.halfWidth, y, settings );

    this.vel.y = 100;
    this.addAnim( 'idle', 1, [0] );

  },

  update: function(){
    //If the bullet has gone beyond the lower visible screen then kill it.
    if ((this.pos.y > 240) || (this.vel.y == 0)){
      this.kill();
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




