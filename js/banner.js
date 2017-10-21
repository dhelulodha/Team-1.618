(function () {

	'use strict';

    /*---------------*/

    if (!window.requestAnimationFrame) {
	    window.requestAnimationFrame = (function() {
	        return window.webkitRequestAnimationFrame ||
	            window.mozRequestAnimationFrame ||
	        	window.oRequestAnimationFrame ||
	            window.msRequestAnimationFrame ||
	            function(callback, element) {
	                window.setTimeout(callback, 1000 / 60);
	        	};
	    })();
	}

	// from http://stackoverflow.com/a/6466243/2011404
	function pad (str, max) {
	  	str = str.toString();
	  	return str.length < max ? pad("0" + str, max) : str;
	}

	function css(element, property) {
		var _property = window.getComputedStyle(element, null).getPropertyValue(property);
		if(_property.indexOf('px') != -1) { return parseInt(_property); }
		else { return _property; }
	}

	function Slice (elements) {
		return Array.prototype.slice.call(elements);
	}

	TweenLite.defaultEase = Expo.easeOut;

	/*---------------*/

	function TSlider () {
		console.log('fine!');
		this._init();
	}


	TSlider.prototype = {

		_init: function() {

			this.isFF = !!navigator.userAgent.match(/firefox/i);
			// Check if it's mobile or click
			this.evttype = 'click';
			// Slider global element
			this.Slider = document.getElementById('slider');
			// Images total count
			this.imagesCount = new Slice(this.Slider.querySelectorAll('img')).length;
			// Slideshow interval
			this.sldInterval = 6000;
			// Control if it's animating
			this.isAnimating = false;
			// Current slide
			this.current = 0;
			// Minimum scale
			this.minScale = 0.7;

			/* Let's do the magic! */
			this._createSlider();

		},

		/* --------------- */

		_createSlider: function () {

			var self = this;

			this.originalImgsEl = new Slice(this.Slider.querySelectorAll('img'));
			this.images = [];

			/* Creating 'mainImages' element to receive the copy of all images */
			var _mainImagesEl = document.createElement('div');
			classie.addClass(_mainImagesEl, 'mainImages');
			this.Slider.appendChild(_mainImagesEl);

			/* Creating 'backgroundImages' element to receive the copy of all images */
			var _backgroundImagesEl = document.createElement('div');
			classie.addClass(_backgroundImagesEl, 'backgroundImages');
			this.Slider.appendChild(_backgroundImagesEl);

			/* Creating 'navigation' element */
			var _navigationEl = document.createElement('div');
			classie.addClass(_navigationEl, 'navigation');
			this.Slider.appendChild(_navigationEl);
			
			/* Final main elements */
			this.mainImages = this.Slider.querySelector('.mainImages');
			this.backgroundImages = this.Slider.querySelector('.backgroundImages');
			this.navigation = this.Slider.querySelector('.navigation');

			this.navigation.innerHTML = '<ul></ul>';

			/* Copying the images attributes */
			this.originalImgsEl.forEach(function (el, i) {

				var src = el.attributes.src.nodeValue;
				var alt = el.attributes.alt.nodeValue;
				var dataUrl = el.dataset.url;

				self.images.push({
					src: src, alt: alt, url: dataUrl, index: i
				});

				self.Slider.removeChild(el);

			});

			/* Creating the 'mainImages' elements */

			for( var i=0; i < this.images.length; i++ ) {

				var obj = this.images[i];
				this._createNewImgs(obj);
				this._createNavigation(obj);

			}

			this.sld = new Slice(this.Slider.querySelectorAll('.mi__img'));
			this.bgSld = new Slice(this.Slider.querySelectorAll('.bi__imgCont'));
			this.navItens = new Slice(this.navigation.querySelectorAll('li'));

			/* Positioning all slides */
			this._firstPosition();

		},

		_createNewImgs: function (obj) {

			var _miImgEl = document.createElement('div');
			var _biContImgEl = document.createElement('div');

			classie.addClass(_miImgEl, 'mi__img');
			classie.addClass(_biContImgEl, 'bi__imgCont');

			_miImgEl.style.background = 'url('+ obj.src +') no-repeat center center';
			_miImgEl.style.backgroundSize = 'cover';
			_miImgEl.style.zIndex = (this.imagesCount - (obj.index + 1));
			_biContImgEl.innerHTML = '<div class="bi__imgCont-img bi-'+ obj.index +'" />';

			this.mainImages.appendChild(_miImgEl);
			this.backgroundImages.appendChild(_biContImgEl);

			var bgImageSrc = obj.src.split('.jpg')[0];
			var bi = this.backgroundImages.querySelector('.bi__imgCont .bi-' + obj.index);
			
			bi.style.background = 'url('+ bgImageSrc +'-blur.jpg) no-repeat center top';
			bi.style.backgroundSize = 'cover';
			this.backgroundImages.style.display = "none";

			//classie(this.Slider.querySelectorAll('.mi__img')[this.current], 'active-slide');

		},

		_createNavigation: function (obj) {

			var ul = this.navigation.querySelector('ul');
			var _li = document.createElement('li');
			var a, liInfo, mask;
			
			// Putting zero before number
			var number = pad((obj.index+1), 2);
			
			// For each item...
			classie.addClass(_li, 'navItem-' + obj.index);
			_li.innerHTML = '<a href="#0"></a><div class="li__info"></div><div class="li__info-mask"><div class="mask__infoContainer"></div></div><div class="li__hoverLine"><div class="l"></div></div>';
			ul.appendChild(_li);

			// New elements
			a = ul.querySelector('.navItem-' + obj.index + ' a');
			liInfo = ul.querySelector('.navItem-' + obj.index + ' .li__info');
			mask = ul.querySelector('.navItem-' + obj.index + ' .mask__infoContainer');

			// Setting links href attr
			a.setAttribute('href', obj.url);
			
			// Inner texts
			var info = '<h5>'+number+'</h5><h4>'+obj.alt+'</h4>'; 
			liInfo.innerHTML = info;
			mask.innerHTML = info;

			// Setting width for mask according to 'li' size.
			// This the the final computed style of li
			mask.style.width = css(_li, 'width') + "px";
			if(this.isFF) {
				mask.style.width = (css(_li, 'width')+5) + "px";
			}

		},

		_firstPosition: function () {

			var self = this;

			TweenMax.set(this.navigation, { opacity: 0, y: 25 });

			// Front images
			this.sld.forEach(function (el, i) {
				classie.addClass(el, 'sld-' + i);
				if( i===0 ) {
					// The first image will have the 'fade-in' animation
					TweenMax.set(el, { scale: 1.3, opacity: 0 });
				}
				else {
					// Other images will have the default position
					TweenMax.set(el, { scale: self.minScale, y: -window.innerHeight });
				}
			});	

			// Blur images (background)
			this.bgSld.forEach(function (el, i) {
				
				classie.addClass(el, 'bg-' + i);
				TweenMax.set(el.querySelector('.bi__imgCont-img'), { scale: 1.35, y: 80 });
				el.style.zIndex = 0;

				if( i === self.current ) {
					TweenMax.set(el.querySelector('.bi__imgCont-img'), { scale: 1.5, y: 0 });
					el.style.zIndex = (self.current + 2);
				}

				if( i === (self.current + 1)) {
					el.style.zIndex = (self.current + 1);
				}

			});

			/*classie.addClass(self.sld[self.current], 'active-slide');
			classie.addClass(self.navItens[self.current], 'active');*/

			// Must wait everything in their right place before start
			setTimeout(function () { self._enterAnimation(); } , 1200);

		},

		_enterAnimation: function () {

			var self = this;
			var t = new TimelineMax({ 
				paused: true,
				onComplete: function () {
					self._startSlider();
					self.backgroundImages.style.display = "block";
				}
			});

			t.to(self.sld[self.current], 2.5, { scale: 1, opacity: 1 });
			t.to(self.navigation, 1.2, { opacity: 1, y: 0 }, 0.8);

			t.restart();

		},

		/* --------------- */
		/*
		
			Lógica:
			1) Primeiro slide aparece.
			2) Apareceu? Começou contagem.
			3) Acabou contagem, transiciona.
			4) Acabou transição? Aparece novo slide.

		*/

		_startSlider: function() {

			var self = this;
			var currSlide = this.sld[this.current];
			var currNavItem = this.navItens[this.current];
			var currBgSlide = this.bgSld[this.current];
			var currBgSldImage = currBgSlide.querySelector('.bi__imgCont-img');

			console.log('Começa contagem do slide ' + this.current + '.');

			animateCurrNavItem(currNavItem);
			classie.addClass(currSlide, 'active-slide');

			/*++++*/

			function animateCurrNavItem (el) {
				
				classie.addClass(el, 'active');
				el.querySelector('.li__info').style.opacity = 0.3;
				el.querySelector('.li__info-mask').style.opacity = 1;

				TweenMax.to(el.querySelector('.li__info-mask'), self.sldInterval/1000, {
					width: '100%', ease: Linear.easeNone,
					onComplete: function () {
						console.log('Agora, aciona as transições.');
						slidesTransitions();
					}
				});

			}

			function slidesTransitions () {

				var nextIndex = self.current < self.imagesCount - 1 ? ++self.current : 0;
				
				classie.removeClass(currSlide, 'active-slide');
				classie.removeClass(currNavItem, 'active');

				TweenMax.set(currBgSlide, { top: 0, bottom: 'inherit' });

				// Reset navigation item
				currNavItem.querySelector('.li__info').style.opacity = 0.7;
				TweenMax.to(currNavItem.querySelector('.li__info-mask'), 0.5, {
					opacity: 0,
					onComplete: function () {
						currNavItem.querySelector('.li__info-mask').style.width = "0%";
					}
				});

				// Move images
				var tm = new TimelineMax({ 
					onComplete: function () {
						
						console.log('Transição de slides terminado.');
						TweenMax.killTweensOf(currSlide, currBgSlide);

						// Moving up the last image
						TweenMax.set(currSlide, { scale: self.minScale, y: -window.innerHeight });

						// Reseting last background image
						TweenMax.set(currBgSlide, { height: '100%', top: 'inherit', bottom: 0 });
						TweenMax.set(currBgSldImage, { scale: 1.35, y: 80 });
						currBgSlide.style.zIndex = 0;

						// New z-index value for next background images
						self.bgSld[nextIndex].style.zIndex = 2;
						
						if((nextIndex+1) >= self.imagesCount) { self.bgSld[0].style.zIndex = 1; }
						else { self.bgSld[nextIndex+1].style.zIndex = 1; }
						//console.log(self.bgSld[nextIndex+1], ' : ', nextIndex+1);

						// Reinitialize the slider
						self.current = nextIndex;
						self._startSlider();

					}
				});

				// Current elements animations
				tm.to(currSlide, 1.5, { scale: 0.8 });
				tm.to(currBgSldImage, 1.2, { scale: 1.35 }, 0.15);
				tm.to(currSlide, 1.2, { y: window.innerHeight }, 0.8);
				tm.to(currBgSlide, 1.2, { height: '0%' }, 0.8);

				// Next elements animations
				tm.to(self.sld[nextIndex], 1.2, { y: 0 }, 0.8);
				tm.to(self.sld[nextIndex], 1.5, { scale: 1 }, 1.8);
				tm.to(self.bgSld[nextIndex].querySelector('.bi__imgCont-img'), 1.5, { y: 0 }, 1);
				tm.to(self.bgSld[nextIndex].querySelector('.bi__imgCont-img'), 1.5, { scale: 1.5 }, 1.8);

			}

		}

	};


	/*---------------*/

	var s = new TSlider();

})();