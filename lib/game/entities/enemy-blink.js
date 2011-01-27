ig.module( 
	'game.entities.enemy-blink' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityEnemyBlink = ig.Entity.extend({

  size: {x:24, y:24},
  halfWidth: 12,
	type: ig.Entity.TYPE.B, // Enemy un-friendly group
  collides: ig.Entity.COLLIDES.PASSIVE,

  health: 10,
  points: 200,
  groupEntity: null,

  
  animSheet: new ig.AnimationSheet( 'media/ship3a.png', 24, 24 ),
  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );
    this.vel.x = -50;
    //Random number to determine from which side the enemy will enter.
    //Default is right.
    var randomnumber=Math.floor(Math.random()*2);
    if (randomnumber == 1) {
      this.pos.x = -24;
      this.vel.x = 50;
    }

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
    var randomnumber=Math.floor(Math.random()*50);
    if (randomnumber == 5) {
	    ig.game.spawnEntity( EntityEnemyBlinkFire, this.pos.x + this.halfWidth, this.pos.y + 12 );
    }
    //Check to see if entity has reached horizontal edge of screen,
    //if so instruct the groupEntity to change direction.
    if ( (this.pos.x < -24) || (this.pos.x > 320)) {
      this.kill();
    }
    this.parent();
  },

  kill: function(){
    this.parent();
  }

});

EntityEnemyBlinkFire = ig.Entity.extend({
	size: {x: 12, y: 12},
  halfWidth: 6, 
	maxVel: {x: 200, y: 200},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A, // Check Against A - our player's group
	collides: ig.Entity.COLLIDES.NONE,
		
	animSheet: new ig.AnimationSheet( 'media/Bullets-b.png', 12, 12 ),

  init: function( x, y, settings ) {
    this.parent( x - this.halfWidth, y, settings );
    randomnumber = Math.floor(Math.random()*3);
    this.addAnim( 'idle', 1, [randomnumber] )
    this.direction = [-50, 0, 50];
    this.vel.x = this.direction[randomnumber];
    this.vel.y = 100;
 

  },

  update: function(){
    //If the bullet has gone beyond the lower visible screen then kill it.
    if ((this.pos.y > 240) || (this.vel.y == 0)) {
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




