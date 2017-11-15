/**
 * @author denim2x <https://github.com/denim2x>
 *
 * This file is a fork of jQuery.downBoy.auto for Vanilla JS
 */

/*global downBoy*/

(function (exports, augment, $) {
	'use strict'
	augment(Array, ['forEach'])

	/**
	 * This function is exactly the same as in
	 * jQuery.downBoy
	 */
	exports.downBoy = function (footer) {
		footer = footer || 'footer'
		$(footer).css('position', '').css('bottom', '')
		if ($(window).height() > $('body').height()) {
			$(footer).css('position', 'absolute').css('bottom', '0')
		}
	}

	// When the page has loaded
	$(window).on('DOMContentLoaded', function () {
		var resizeTimeout
		downBoy() // Run the function

		// And every time the window is resized
		$(window).on('resize', function () {
			if (resizeTimeout) return

		// Will execute at a rate of 15fps
			resizeTimeout = setTimeout(function() {
				resizeTimeout = null
				downBoy() // Run again
			}, 66)
		})
	})

})(window,
/**
 * Augment Class with some of its prototype
 */
function augment (Class, keys) {
	'use strict'
	var slice = Array.prototype.slice
	keys.forEach(function (key) {
		var method = Class.prototype[key]
		Class[key] = function () {
			var args = slice.call(arguments, 1)
			method.apply(arguments[0], args)
		}
	})
}, window.jQuery ||
/**
 * Here comes a teeny-tiny jQuery shim (just because
 * it seemed more convenient to have one handy instead
 * of having to fiddle with the raw thing).
 * PS: It could also be moved in a separate script and
 * included before this one.
 */
function jQuery (sel, ctx) {
	'use strict'
	switch (typeof sel) {
		case 'string':
			ctx = ctx || document
			sel = ctx.querySelectorAll(sel)
			return {
				css: function (key, val) {
					Array.forEach(sel, function each (item) {
						item.style[key] = val
					})
					return this
				},
				height: function () {
					var style = getComputedStyle(sel[0])
					var val = style.getPropertyValue('height')
					return parseFloat(val)
				},
			}

		case 'object':
			if (sel == null) {
				throw "Bad usage of $ - the first argument is null"
			}

			var html = document.documentElement
			return {
				height: function () {
					if (sel instanceof Window) {
						return html.clientHeight
					}
					var style = getComputedStyle(sel[0])
					var val = style.getPropertyValue('height')
					return parseFloat(val)
				},
				on: function (event, handler) {
					sel.addEventListener(event, handler)
					return this
				},
			}

		case 'undefined':
			throw "Bad usage of $ - nothing given as first argument"

		default:
			throw "$ doesn't currently work on a " + (typeof sel)
	}
})
