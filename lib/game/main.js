ig.module( 
    'game.main' 
    )
.requires(
    'impact.game',
    'impact.timer',
    'game.levels.dorm1',
    'game.levels.dorm2',
    'game.entities.player',
    'game.entities.zombie',
    'impact.font',
    'impact.sound'
    )

.defines(function(){

    MyGame = ig.Game.extend({
        statText: new ig.Font( 'media/04b03.font.png' ),
        showStats: false,
        statMatte: new ig.Image('media/stat-matte.png'),
        levelTimer: new ig.Timer(),
        lifeSprite: new ig.Image('media/life-sprite.png'),
        levelExit: null,
        stats: {
            time: 0, 
            kills: 0, 
            deaths: 0
        },
        gravity: 300,
        lives: 3,
        instructText: new ig.Font( 'media/04b03.font.png' ),
        init: function() {
            if( ig.ua.mobile ) {
                // Disable sound for all mobile devices
                ig.Sound.enabled = false;
            }
            
            this.loadLevel( LevelDorm1 );
            // MUSIC
            ig.music.add( 'media/sounds/celldweller.*' );
            ig.music.volume = 0.5;
            ig.music.play();
            // Bind keys
            ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
            ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
            ig.input.bind( ig.KEY.X, 'jump' );
            ig.input.bind( ig.KEY.C, 'shoot' );
            ig.input.bind( ig.KEY.TAB, 'switch' );
            ig.input.bind( ig.KEY.SPACE, 'continue' );

        },
	
        update: function() {
            
            
            // screen follows the player
            var player = this.getEntitiesByType( EntityPlayer )[0];
            if( player ) {
                this.screen.x = player.pos.x - ig.system.width/2;
                this.screen.y = player.pos.y - ig.system.height/2;
                if(player.accel.x>0 && this.instructText) this.instructText=null;
            }
            // Update all entities and BackgroundMaps
            if(!this.showStats){
                this.parent();
            }else{
                if(ig.input.state('continue')){
                    this.showStats = false;
                    this.levelExit.nextLevel();
                    this.parent();
                }
            }
        },
	
        draw: function() {
            // Draw all entities and backgroundMaps
            this.parent();
            if(this.showStats){
                this.statMatte.draw(0,0);
                var x = ig.system.width/2;
                var y = ig.system.height/2 - 20;
                this. statText.draw('Level Complete', x, y, ig.Font.ALIGN.CENTER);
                this. statText.draw('Time: '+this.stats.time, x, y+30, ig.Font.ALIGN.CENTER);
                this. statText.draw('Kills: '+this.stats.kills, x, y+40, ig.Font.ALIGN.CENTER);
                this. statText.draw('Deaths: '+this.stats.deaths, x, y+50, ig.Font.ALIGN.CENTER);
                this. statText.draw('Press Spacebar to continue.', x, ig.system.height - 10,
                    ig.Font.ALIGN.CENTER);
            }
            if(this.instructText){
     
                var x = ig.system.width/2,
                y = ig.system.height - 10;
                this.instructText.draw(
                    'Left/Right Moves, X Jumps, C Fires & Tab Switches Weapons.',
                    x, y, ig.Font.ALIGN.CENTER );
            }
            
              //drawing HUD
            this.statText.draw("Lives", 5,5);
            for(var i=0; i < this.lives; i++)
                this.lifeSprite.draw(((this.lifeSprite.width + 2) * i)+5, 15);
        },
        loadLevel: function( data ) {
            this.stats = {
                time: 0, 
                kills: 0, 
                deaths: 0
            };
            this.parent(data);
            this.levelTimer.reset();
        },
        toggleStats: function(levelExit){
            this.showStats = true;
            this.stats.time = Math.round(this.levelTimer.delta());
            this.levelExit = levelExit;
        }
        
        
    });
    StartScreen = ig.Game.extend({
        mainCharacter: new ig.Image('media/screen-main-character.png'),
        title: new ig.Image('media/game-title.png'),
        instructText: new ig.Font( 'media/04b03.font.png' ),
        background: new ig.Image('media/screen-bg.png'),
        init: function() {
            ig.input.bind( ig.KEY.SPACE, 'start');
        },
        update: function() {
            if(ig.input.pressed ('start')){
                ig.system.setGame(MyGame)
            }
            this.parent();
        },
        draw: function() {
            this.parent();
            this.background.draw(0,0);
            var x = ig.system.width/2,
            y = ig.system.height - 10;
            this.background.draw(0,0);
            this.mainCharacter.draw(0,0);
            this.title.draw(ig.system.width - this.title.width, 0);
            this.instructText.draw('Press Spacebar To Start', x+40, y,
                ig.Font.ALIGN.CENTER );
        }
        
    });
    GameOverScreen = ig.Game.extend({
        instructText: new ig.Font( 'media/04b03.font.png' ),
        background: new ig.Image('media/screen-bg.png'),
        gameOver: new ig.Image('media/game-over.png'),
        stats: {},
        init: function() {
            ig.input.bind( ig.KEY.SPACE, 'start');
            this.stats = ig.finalStats;
        },
        update: function() {
            if(ig.input.pressed('start')){
                ig.system.setGame(StartScreen)
            }
            this.parent();
        },
        draw: function() {
            this.parent();
            this.background.draw(0,0);
            var x = ig.system.width/2;
            var y = ig.system.height/2 - 20;
            this.gameOver.draw(x - (this.gameOver.width * .5), y - 30);
            var score = (this.stats.kills * 100) - (this.stats.deaths * 50);
            this.instructText.draw('Total Kills: '+this.stats.kills, x, y+30,
                ig.Font.ALIGN.CENTER);
            this.instructText.draw('Total Deaths: '+this.stats.deaths, x, y+40,
                ig.Font.ALIGN.CENTER);
            this.instructText.draw('Score: '+score, x, y+50, ig.Font.ALIGN.CENTER);
            this.instructText.draw('Press Spacebar To Continue.', x, ig.system.height -
                10, ig.Font.ALIGN.CENTER);
            
          
        }
        
    });

    EntityDeathExplosion=ig.Entity.extend({
        lifetime:1,
        callBack:null,
        particles:25,
        init:function(x,y,settings){
            this.parent(x,y,settings);
            for(var i=0;i<this.particles;i++)
                ig.game.spawnEntity(EntityDeathExplosionParticle,x,y,{
                    colorOffset:settings.colorOffset?settings.colorOffset:0
                });
            this.idleTimer=new ig.Timer();
        },
        update:function(){
            if(this.idleTimer.delta()>this.lifetime){
                this.kill();
                if(this.callBack)this.callBack();
                return;
            }
        }
    });
    EntityDeathExplosionParticle=ig.Entity.extend({
        size:{
            x:2,
            y:2
        },
        maxVel:{
            x:160,
            y:200
        },
        lifetime:2,
        fadetime:1,
        bounciness:0,
        vel:{
            x:100,
            y:30
        },
        friction:{
            x:100,
            y:0
        },
        collides:ig.Entity.COLLIDES.LITE,
        colorOffset:0,
        totalColors:7,
        animSheet:new ig.AnimationSheet('media/blood.png',2,2),
        init:function(x,y,settings){
            this.parent(x,y,settings);
            var frameID=Math.round(Math.random()*this.totalColors)+(this.colorOffset*(this.totalColors+1));
            this.addAnim('idle',0.2,[frameID]);
            this.vel.x=(Math.random()*2-1)*this.vel.x;
            this.vel.y=(Math.random()*2-1)*this.vel.y;
            this.idleTimer=new ig.Timer();
        },
        update:function(){
            if(this.idleTimer.delta()>this.lifetime){
                this.kill();
                return;
            }
            this.currentAnim.alpha=this.idleTimer.delta().map(
                this.lifetime-this.fadetime,this.lifetime,1,0);
            this.parent();
        }
   
    });


    // Start the Game with 60fps, a resolution of 320x240, scaled
    // up by a factor of 2
    ig.main( '#canvas', StartScreen, 60, 320, 240, 2 );

});
