;(function($){
	$.fn.pureSlider = function(options) {

		var pureSlider = function(container, options) {

			// container with slides
			this.container = container;

			// setTimeout/setInterval handle
			this.loop = false;
			this.options = options;

			// current slide
			this.currentIndex = 0;

			// duration of slide interval + slide transition
			this.trueSlideDuration = 0;

			// First slide needs just the slide duration without transition.
			this.firstRun = true;
			this.defaultOptions = {

				//animDuration:  1,
				slideDuration:  2000,
				slideNode: 'div.slide',
				nextButton: '.next',
				prevButton: '.prev',
				activeClass: 'active',
				altActiveClass: 'activated',
				inactiveClass: 'deactivated',

				/**
				 * Show "Left", "Right" navigation?
				 * Well, actually this somewhat collides with nextButton/prevButton,
				 * which just slaps events on top of already placed buttons. So do we actually need this?
				 * Maybe it shoud be changed to "generatePrevNext" or smth?
				 *
				 showNavigation: false,
				 */

				/**
				 * Show slide switches? TODO - needs implementing, currently does nothing
				 */
				//showSlideButtons: true,

				/**
				 *  Autostart sliding? TODO - needs implementing, currently does nothing
				 */
				//autorun: true,

				/**
				 *  Random start? TODO - needs implementing, currently does nothing
				 */
				//randomStart: false
			}

			this.options = $.extend(this.defaultOptions, this.options);
			this.elements = container.querySelectorAll( this.options.slideNode );

			this.start = function() {

				// Don't crash when there are no slides on stage.
				if( this.elements.length < 1 )
					return;

				this.elements[0].classList.add( this.options.activeClass );
				this.trueSlideDuration = this.options.slideDuration + this.getTransitionDuration( this.elements[0] );
				this.runLoop();

				/* easy iterate over all elements
				var current = this.elements.shift();
				this.elements.each( function(i) {
					$(this);
				})*/
			}

			this.getTransitionDuration = function(element){
				var duration, longest = 0;

				// Get transition property from css of element.
				durStrings = getComputedStyle(element)['transition-duration'];

				if(durStrings !== undefined)
				{
					// Remove spaces, text-transform to lowercase and split several values to array.
					durStrings = durStrings.replace(/\s/g, '').toLowerCase().split(',');

					// If there was a single value, transform to array anyway for easier processing.
					if(durStrings.constructor !== Array)
						durStrings = [durStrings];

					for(var i = 0; i < durStrings.length; i++)
					{
						// Check if defined as miliseconds.
						// Get numerical part from string. Parse numerical string to number.
						// If number was not defined as miliseconds, then convert it to miliseconds.
						duration = (durStrings[i].indexOf("ms")>-1) ? parseFloat(durStrings[i]) : parseFloat(durStrings[i])*1000;

						// As transition may have many durations, we care only for the longest one.
						longest = duration > longest ? duration : longest;
					}
				}

				return longest;
			};

			/*
			this.runLoop = function() {
				self = this;
				this.loop = setInterval( function() {
					self.next();
				}, this.options.slideDuration )
			}
			*/

			this.runLoop = function() {
				self = this;

				if(this.firstRun){
					this.loop = setTimeout( function() {
						self.next();
						self.runLoop();
					}, this.options.slideDuration );
					this.firstRun = false;
				}
				else {
					this.loop = setInterval( function() {
					self.next();
					}, this.trueSlideDuration );
				}
			}


			this.animate = function(current, next, activated) {
				//next.css('z-index', this.elements.length )
				//current.css('z-index', 1);
				activated = activated === true ? true : false;

				if(activated)
				{
					for( var i = 0; i < this.elements.length; i++ )
					{
						this.elements[i].classList.add( this.options.inactiveClass );
					}
					next.classList.add( this.options.altActiveClass );
					next.classList.remove( this.options.inactiveClass );
				}
				else
				{
					for( var i = 0; i < this.elements.length; i++ )
					{
						this.elements[i].classList.remove( this.options.inactiveClass );
					}
					next.classList.add( this.options.activeClass );
				}
				current.classList.remove( this.options.activeClass );
				current.classList.remove( this.options.altActiveClass );

				/*
				setTimeout(function() {
					current.removeClass('active');
				}, this.options.animDuration);
				*/
			};


			this.next = function(activated) {
				var next 	= null;
				var current = null;

				if(this.elements[this.currentIndex + 1])
				{
					next 	= this.elements[this.currentIndex + 1];
					current = this.elements[this.currentIndex];
					this.currentIndex++;
				}
				else
				{
					next 	= this.elements[0];
					current = this.elements[this.currentIndex];
					this.currentIndex = 0;
				}

				this.animate(current, next, activated);
			}

			this.prev = function(activated) {
				var next 	= null;
				var current = null;

				if(this.elements[this.currentIndex - 1])
				{
					next 	= this.elements[this.currentIndex - 1];
					current = this.elements[this.currentIndex];
					this.currentIndex--;
				}
				else
				{
					next 	= this.elements[this.elements.length - 1];
					current = this.elements[this.currentIndex];
					this.currentIndex = this.elements.length - 1;
				}

				this.animate(current, next, activated);
			}


			this.stopLoop = function(){
				clearInterval(this.loop);
				clearTimeout(this.loop);
				this.firstRun = true;
			}


			/* Events do happen in here. */
			var self = this;

			this.container.querySelector( this.options.nextButton ).addEventListener('click', function(e){
				e.preventDefault();
				self.stopLoop();
				self.next(true);
				self.runLoop();
			});

			this.container.querySelector( this.options.prevButton ).addEventListener('click', function(e){
				e.preventDefault();
				self.stopLoop();
				self.prev(true);
				self.runLoop();
			});
		};


		return this.toArray().forEach(function(elt) {
			var main = new pureSlider( elt, options );
			main.start();
		});
	}
})(this.jQuery || this.Zepto || this.jBone);