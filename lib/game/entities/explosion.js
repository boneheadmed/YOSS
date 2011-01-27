ig.module( 
	'game.entities.explosion' 
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityExplosion = ig.Entity.extend({
	size: {x: 48, y: 48},

	type: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,
		
	animSheet: new ig.AnimationSheet( 'media/Explode5-m.png', 48, 48),

  init: function( x, y, settings ) {
    //Received the coordinates of the center of the creating entity.
    //Subtract half of the size of the explosion from these numbers
    //in order to center the explosion on top of the entity.
    x = x - (this.size.x/2);
    y = y - (this.size.y/2);
    this.parent( x, y, settings );

    //We only want the explosion animation to loop once so stop is true.
    this.addAnim( 'idle', 0.05, [0,1,2,3,4,5,6,7], true );
    //Start timer so this entity can be killed after 0.5 seconds.
    this.timer = new ig.Timer(0.5);

  },

  update: function(){
    //If it has been more than 0.5 seconds then kill this explosion entity.
    if (this.timer.delta() > 0) {
      this.kill();
    }
    this.parent();
  },

});

});
