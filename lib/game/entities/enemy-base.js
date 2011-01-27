ig.module( 
	'game.entities.enemy-base' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityEnemyBase = ig.Entity.extend({

  size: {x:97, y:66},
	offset: {x: 2, y: 4},
  halfWidth: 51,
	type: ig.Entity.TYPE.B, // Enemy un-friendly group
  collides: ig.Entity.COLLIDES.PASSIVE,

  health: 300,
  points: 1000,
  groupEntity: null,

  STATE: { 
  ALIVE: 0,
  DAMAGE1: 1,
  DAMAGE2: 2,
  EXPLODING: 3
  },

  
  animSheet: new ig.AnimationSheet( 'media/base2.png', 102, 82),
  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );

    this.addAnim( 'idle', 1, [0] );
    this.addAnim( 'damage1', 1, [2] );
    this.addAnim( 'damage2', 1, [1] );
    this.addAnim( 'dead', 1, [3] );

    this.stateSequence = [this.STATE.ALIVE, this.STATE.DAMAGE1, this.STATE.DAMAGE2, this.STATE.EXPLODING];
    this.currentStateNum = 0;

    //The probabilty the enemy will fire. Becomes more probable, the more 
    //damaged it becomes. Corresponds with state number.
    this.desperation = [200, 50, 15];

    this.explosionTimer = new ig.Timer(4);
  },

  receiveDamage: function(amount, from) {
    switch(this.stateSequence[this.currentStateNum]){
      case this.STATE.ALIVE:   
          if (this.health < 150){
            this.nextState();
          }
        break;
      case this.STATE.DAMAGE1:   
          if (this.health < 80){
            this.nextState();
          }
        break;
      case this.STATE.DAMAGE2:   
          if (this.health - amount <= 0){
            //Base has been killed. Go to next state 'exploding'.
            this.nextState();
            ig.game.playerController.addToScore(this.points);
          }
        break;
      default:
        break;
    }    

		this.health -= amount;
  },

  nextState: function(){
    this.currentStateNum++;
    switch(this.stateSequence[this.currentStateNum]){
      case this.STATE.DAMAGE1:   
          this.currentAnim = this.anims.damage1;        
        break;
      case this.STATE.DAMAGE2:   
          this.currentAnim = this.anims.damage2;        
			    ig.game.spawnEntity( EntityExplosion, this.pos.x + (this.size.x/2), this.pos.y + 70);
        break;
      case this.STATE.EXPLODING:
       //Create initial explosions 
			ig.game.spawnEntity( EntityExplosion, this.pos.x + (this.size.x/2), this.pos.y + (this.size.y/2));
			ig.game.spawnEntity( EntityExplosion, (this.pos.x + 20 ), (this.pos.y));
			ig.game.spawnEntity( EntityExplosion, (this.pos.x + this.size.x - 20), (this.pos.y));
			ig.game.spawnEntity( EntityExplosion, (this.pos.x + 20 ), (this.pos.y +this.size.y -30));
			ig.game.spawnEntity( EntityExplosion, (this.pos.x + this.size.x - 20), (this.pos.y + this.size.y - 30));      
        this.collides =  ig.Entity.COLLIDES.NEVER;
		    this.checkAgainst = ig.Entity.TYPE.NONE;
        this.type = ig.Entity.TYPE.NONE;
        this.vel.x = 0;
        this.vel.y = 0;
        this.explosionTimer.reset();
        
        break;
      default:
        break;
    }

  },

  update: function(){
    switch(this.stateSequence[this.currentStateNum]){
      case this.STATE.EXPLODING:
        if (this.explosionTimer.delta() > -3.7){
          this.currentAnim = this.anims.dead;  
          if (this.explosionTimer.delta() > 0){
            this.kill();
          }
        }
        break;
      default:
        //Choose a random number to see if the entity will fire
        var randomnumber=Math.floor(Math.random()*this.desperation[this.currentStateNum]);
        if (randomnumber == 5) {
          ig.game.spawnEntity( EntityEnemyBaseFire, this.pos.x + 21, this.pos.y + 74);
          ig.game.spawnEntity( EntityEnemyBaseFire, this.pos.x + 71, this.pos.y + 74);
        }
        //Check to see if entity has reached horizontal edge of screen,
        //if so instruct the groupEntity to change direction.
        if ( (this.pos.x < -10) || (this.pos.x > 230)) {
          this.groupEntity.changeDirection();
        }
        this.vel.x = this.groupEntity.vel.x;
        this.vel.y = 0;
        break;
    }
    if (this.stateSequence[this.currentStateNum] == this.STATE.ALIVE){
      //Check to see if the base will release an enemy-spinner
      var rand=Math.floor(Math.random()*150); 
      if (rand == 5) {
        spinner = ig.game.spawnEntity( EntitySmallSpinner, this.pos.x + 50, this.pos.y + 52 ); 
        spinner.groupEntity = this.groupEntity;
      } 
    }

    this.parent();
  },

  kill: function(){
    this.parent();
  }

});

EntitySmallSpinner = ig.Entity.extend({
	size: {x: 12, y: 10},
  halfWidth: 6, 
	maxVel: {x: 200, y: 200},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A, // Check Against A - our player's group
	collides: ig.Entity.COLLIDES.LITE,

  groupEntity: null,
		
	animSheet: new ig.AnimationSheet( 'media/barrel-small.png', 12, 10),

  init: function( x, y, settings ) {
    this.parent( x - this.halfWidth, y - 5, settings );
    this.addAnim( 'idle', 1, [0] );
    this.emergeTimer = new ig.Timer(1);
  },

  update: function(){
    if (this.emergeTimer.delta() > 0){
      spinner = ig.game.spawnEntity( EntityEnemySpinner, this.pos.x - 6, this.pos.y ); 
      spinner.groupEntity = this.groupEntity;
      spinner.currentStateNum = 0;
      spinner.vel.x = 0;
      spinner.accel.y = 50;
      spinner.emergeTimer.reset();
      this.kill();
    }
    else{
      if ( (this.pos.x < 0) || (this.pos.x > 296)) {
        this.groupEntity.changeDirection();
      }
      this.vel.x = this.groupEntity.vel.x;
      this.vel.y = 0;

      this.parent();
    }
  },

	// This function is called when this entity overlaps anonther entity of the
	// checkAgainst group. I.e. for this entity, the player's A group.
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.kill();
	}	

});

EntityEnemyBaseFire = ig.Entity.extend({
	size: {x: 12, y: 12},
  halfWidth: 6, 
	maxVel: {x: 200, y: 200},

	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A, // Check Against A - our player's group
	collides: ig.Entity.COLLIDES.LITE,
		
	animSheet: new ig.AnimationSheet( 'media/Bullets-b.png', 12, 12 ),

  init: function( x, y, settings ) {
    this.parent( x - this.halfWidth, y, settings );

    this.vel.y = 100;
    this.addAnim( 'idle', 1, [1] );

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




