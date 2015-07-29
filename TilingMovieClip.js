//var core = require('../core');
var core = require('pixi.js');

/**
 * A TilingMovieClip is a simple way to display an animation depicted by a list of textures.
 * It is tiled in the same fashion as a TilingSprite.
 *
 * @class
 * @extends PIXI.TilingSprite
 * @memberof PIXI.extras
 * @param textures {Texture[]} an array of {Texture} objects that make up the animation
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
function TilingMovieClip(textures, width, height)
{
    core.extras.TilingSprite.call(this, textures[0], width, height);

    /**
     * @private
     */
    this._textures = textures;

    /**
     * The speed that the TilingMovieClip will play at. Higher is faster, lower is slower
     *
     * @member {number}
     * @default 1
     */
    this.animationSpeed = 1;

    /**
     * Whether or not the movie clip repeats after playing.
     *
     * @member {boolean}
     * @default true
     */
    this.loop = true;

    /**
     * Function to call when a TilingMovieClip finishes playing
     *
     * @method
     * @memberof TilingMovieClip#
     */
    this.onComplete = null;

    /**
     * Elapsed time since animation has been started, used internally to display current texture
     *
     * @member {number}
     * @private
     */
    this._currentTime = 0;

    /**
     * Indicates if the TilingMovieClip is currently playing
     *
     * @member {boolean}
     * @readonly
     */
    this.playing = false;
}

// constructor
TilingMovieClip.prototype = Object.create(core.extras.TilingSprite.prototype);
TilingMovieClip.prototype.constructor = TilingMovieClip;
module.exports = TilingMovieClip;

Object.defineProperties(TilingMovieClip.prototype, {
    /**
     * totalFrames is the total number of frames in the TilingMovieClip. This is the same as number of textures
     * assigned to the TilingMovieClip.
     *
     * @member {number}
     * @memberof PIXI.TilingMovieClip#
     * @default 0
     * @readonly
     */
    totalFrames: {
        get: function()
        {
            return this._textures.length;
        }
    },

    /**
     * The array of textures used for this TilingMovieClip
     *
     * @member {PIXI.Texture[]}
     * @memberof PIXI.TilingMovieClip#
     *
     */
    textures: {
        get: function ()
        {
            return this._textures;
        },
        set: function (value)
        {
            this._textures = value;

            this.texture = this._textures[Math.floor(this._currentTime) % this._textures.length];
        }
    },

    /**
    * The TilingMovieClips current frame index
    *
    * @member {number}
    * @memberof PIXI.TilingMovieClip#
    * @readonly
    */
    currentFrame: {
        get: function ()
        {
            return Math.floor(this._currentTime) % this._textures.length;
        }
    }

});

/**
 * Stops the TilingMovieClip
 *
 */
TilingMovieClip.prototype.stop = function ()
{
    if(!this.playing)
    {
        return;
    }

    this.playing = false;
    core.ticker.shared.remove(this.update, this);
};

/**
 * Plays the TilingMovieClip
 *
 */
TilingMovieClip.prototype.play = function ()
{
    if(this.playing)
    {
        return;
    }

    this.playing = true;
    core.ticker.shared.add(this.update, this);
};

/**
 * Stops the TilingMovieClip and goes to a specific frame
 *
 * @param frameNumber {number} frame index to stop at
 */
TilingMovieClip.prototype.gotoAndStop = function (frameNumber)
{
    this.stop();

    this._currentTime = frameNumber;

    var round = Math.floor(this._currentTime);
    this._texture = this._textures[round % this._textures.length];
};

/**
 * Goes to a specific frame and begins playing the TilingMovieClip
 *
 * @param frameNumber {number} frame index to start at
 */
TilingMovieClip.prototype.gotoAndPlay = function (frameNumber)
{
    this._currentTime = frameNumber;
    this.play();
};

/*
 * Updates the object transform for rendering
 * @private
 */
TilingMovieClip.prototype.update = function (deltaTime)
{

    this._currentTime += this.animationSpeed * deltaTime;

    var floor = Math.floor(this._currentTime);

    if (floor < 0)
    {
        if (this.loop)
        {
            this._texture = this._textures[this._textures.length - 1 + floor % this._textures.length];
        }
        else
        {
            this.gotoAndStop(0);

            if (this.onComplete)
            {
                this.onComplete();
            }
        }
    }
    else if (this.loop || floor < this._textures.length)
    {
        this._texture = this._textures[floor % this._textures.length];
    }
    else if (floor >= this._textures.length)
    {
        this.gotoAndStop(this.textures.length - 1);

        if (this.onComplete)
        {
            this.onComplete();
        }
    }
};

/*
 * Stops the TilingMovieClip and destroys it
 *
 */
TilingMovieClip.prototype.destroy = function ( )
{
    this.stop();
    core.extras.TilingSprite.prototype.destroy.call(this);
};

/**
 * A short hand way of creating a TilingMovieClip from an array of frame ids
 *
 * @static
 * @param frames {string[]} the array of frames ids the TilingMovieClip will use as its texture frames
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
TilingMovieClip.fromFrames = function (frames, width, height)
{
    var textures = [];

    for (var i = 0; i < frames.length; ++i)
    {
        textures.push(new core.Texture.fromFrame(frames[i]));
    }

    return new TilingMovieClip(textures, width, height);
};

/**
 * A short hand way of creating a TilingMovieClip from an array of image ids
 *
 * @static
 * @param images {string[]} the array of image urls the TilingMovieClip will use as its texture frames
 * @param width {number}  the width of the tiling sprite
 * @param height {number} the height of the tiling sprite
 */
TilingMovieClip.fromImages = function (images, width, height)
{
    var textures = [];

    for (var i = 0; i < images.length; ++i)
    {
        textures.push(new core.Texture.fromImage(images[i]));
    }

    return new TilingMovieClip(textures, width, height);
};
