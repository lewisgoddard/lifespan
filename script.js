// Day states. Each state has a normal and an alternate-month variant, the
// latter being the former at brightness(0.9) as the old CSS filter did.
var LIFESPAN_COLOURS = [
	'#c6262e', '#b22229', // lived
	'#68b723', '#5ea520', // unlived
	'#7a0000', '#6e0000', // deceased
	'#f5a623', '#dd9520', // birthday
	'#3689e6', '#317bcf'  // new year
]

var LIFESPAN_CELL   = 6 // row pitch, in CSS pixels
var LIFESPAN_MIN    = 5 // narrowest a column may get before we drop columns
var LIFESPAN_PER_ROW = 365

var lifespanState = null

function lifespanDaysInMonth(year, month) {
	if ( month === 1 ) {
		return ( year % 4 === 0 && year % 100 !== 0 ) || year % 400 === 0 ? 29 : 28
	}
	return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
}

function lifespan(dob, lifespan = 85) {
	// dob      = Date of Birth
	// lifespan = years of expected lifespan
	//            defaults to 85 years

	var area          = document.getElementById('js--lifespan--area')
	var text          = document.getElementById('js--lifespan--text')
	var textHTML      = ''
	var current_date  = new Date()
	var lifespan      = parseFloat(lifespan)
	dob               = new Date(dob)

	if ( isNaN(dob.getTime()) || isNaN(lifespan) ) {
		return
	}

	var end_of_life   = new Date(dob)
	end_of_life.setFullYear(end_of_life.getFullYear() + lifespan)

	var days_lifespan = Math.round(
		( end_of_life.getTime() - dob.getTime() )
		/
		( 1000 * 60 * 60 * 24 )
	)

	var days_lived    = Math.round(
		( current_date.getTime() - dob.getTime() )
		/
		( 1000 * 60 * 60 * 24 )
	)
	if ( days_lived < 0 ) {
		days_lived = 0
	}

	var days_unlived  = ( days_lifespan - days_lived )
	var days_deceased = ( days_lived - days_lifespan )
	var completion    = ( days_lived / days_lifespan ) * 100
	if ( days_deceased > 0 ) {
		var days_lived = ( days_lived - days_deceased )
	}

	console.log('Date of Birth: '    + dob)
	console.log('End of Life: '      + end_of_life)
	console.log('Days in Lifespan: ' + days_lifespan)
	console.log('Days Lived: '       + days_lived)
	console.log('Days Unlived: '     + days_unlived)
	console.log('Days Deceased: '    + days_deceased)
	console.log('Completion: '       + completion)

	// One byte per day indexing into LIFESPAN_COLOURS, walked as a calendar so
	// we never allocate a Date per day.
	var states     = new Uint8Array(days_lifespan)
	var birth_day   = dob.getUTCDate()
	var birth_month = dob.getUTCMonth()
	var year        = dob.getUTCFullYear()
	var month       = birth_month
	var day         = birth_day

	for ( var i = 0; i < days_lifespan; i++ ) {
		var state

		if ( i > 0 && day === birth_day && month === birth_month ) {
			state = 3 // birthday
		} else if ( day === 1 && month === 0 ) {
			state = 4 // new year
		} else if ( i < days_lived ) {
			state = 0 // lived
		} else if ( days_deceased > 0 ) {
			state = 2 // deceased
		} else {
			state = 1 // unlived
		}

		// New Year's Day wins over a birthday, matching the old rule order.
		if ( state === 3 && day === 1 && month === 0 ) {
			state = 4
		}

		states[i] = state * 2 + ( month % 2 )

		day++
		if ( day > lifespanDaysInMonth(year, month) ) {
			day = 1
			month++
			if ( month > 11 ) {
				month = 0
				year++
			}
		}
	}

	lifespanState = {
		dob:    dob,
		states: states,
		hover:  -1,
		cols:   0,
		pitch:  0
	}

	lifespanRender()

	textHTML += '<p>' + '<span>Estimated days in lifespan: ' + days_lifespan.toLocaleString() + '</span>'
	if ( days_lived > 0 ) {
		textHTML += '<span>Days lived: '               + days_lived.toLocaleString()    + '</span>'
	}
	if ( days_unlived > 0 ) {
		textHTML += '<span>Estimated days remaining: ' + days_unlived.toLocaleString()  + '</span>'
	}
	if ( days_deceased > 0 ) {
		textHTML += '<span>Estimated days deceased: '  + days_deceased.toLocaleString() + '</span>'
	}
	if ( completion < 100 && completion > 0 ) {
		textHTML += '<span>Completion: '               + completion.toLocaleString()    + ' %</span>'
	}
	textHTML += '</p>'

	text.innerHTML = textHTML
}

function lifespanCanvas() {
	var area   = document.getElementById('js--lifespan--area')
	var canvas = document.getElementById('js--lifespan--canvas')

	if ( !canvas ) {
		canvas = document.createElement('canvas')
		canvas.id = 'js--lifespan--canvas'
		canvas.setAttribute('role', 'img')
		area.appendChild(canvas)
	}

	return canvas
}

function lifespanRender() {
	if ( !lifespanState ) {
		return
	}

	var area    = document.getElementById('js--lifespan--area')
	var canvas  = lifespanCanvas()
	var states  = lifespanState.states
	var total   = states.length
	var width   = area.clientWidth
	if ( width < LIFESPAN_MIN ) {
		return
	}

	var pitch   = Math.max(LIFESPAN_MIN, width / LIFESPAN_PER_ROW)
	var cols    = Math.max(1, Math.floor(width / pitch))
	var rows    = Math.ceil(total / cols)
	var height  = rows * LIFESPAN_CELL
	var ratio   = window.devicePixelRatio || 1

	lifespanState.cols  = cols
	lifespanState.pitch = pitch
	lifespanState.hover = -1

	canvas.width         = Math.round(width * ratio)
	canvas.height        = Math.round(height * ratio)
	canvas.style.width   = width + 'px'
	canvas.style.height  = height + 'px'
	canvas.setAttribute('aria-label', total.toLocaleString() + ' days, one square per day')

	var ctx = canvas.getContext('2d')
	ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
	ctx.clearRect(0, 0, width, height)

	// Batch by colour so we issue ten fill passes rather than one per day.
	for ( var colour = 0; colour < LIFESPAN_COLOURS.length; colour++ ) {
		ctx.fillStyle = LIFESPAN_COLOURS[colour]
		ctx.beginPath()

		for ( var i = 0; i < total; i++ ) {
			if ( states[i] !== colour ) {
				continue
			}

			var col = i % cols
			var x   = Math.round(col * pitch)
			var w   = Math.round((col + 1) * pitch) - x - 1

			ctx.rect(x, ((i - col) / cols) * LIFESPAN_CELL, w, LIFESPAN_CELL - 1)
		}

		ctx.fill()
	}
}

function lifespanCellAt(event) {
	if ( !lifespanState || !lifespanState.cols ) {
		return -1
	}

	var rect = lifespanCanvas().getBoundingClientRect()
	var col  = Math.floor((event.clientX - rect.left) / lifespanState.pitch)
	var row  = Math.floor((event.clientY - rect.top) / LIFESPAN_CELL)

	if ( col < 0 || col >= lifespanState.cols || row < 0 ) {
		return -1
	}

	var index = row * lifespanState.cols + col
	return index < lifespanState.states.length ? index : -1
}

function lifespanCellRect(index) {
	var col = index % lifespanState.cols
	var x   = Math.round(col * lifespanState.pitch)

	return {
		x: x,
		y: ((index - col) / lifespanState.cols) * LIFESPAN_CELL,
		w: Math.round((col + 1) * lifespanState.pitch) - x - 1,
		h: LIFESPAN_CELL - 1
	}
}

function lifespanPaintCell(ctx, index, outlined) {
	var box = lifespanCellRect(index)

	ctx.fillStyle = LIFESPAN_COLOURS[lifespanState.states[index]]
	ctx.fillRect(box.x, box.y, box.w, box.h)

	if ( outlined ) {
		ctx.strokeStyle = '#333333'
		ctx.lineWidth   = 1
		ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1)
	}
}

function lifespanLabel(index) {
	var day = new Date(lifespanState.dob.getTime() + index * 86400000)

	var label = day.toLocaleDateString( undefined, {
		weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
	} )

	var state = Math.floor(lifespanState.states[index] / 2)
	if ( state === 3 ) {
		label += ' — Birthday'
	} else if ( state === 4 ) {
		label += ' — New Year'
	}

	return label
}

function lifespanTooltip() {
	var tip = document.getElementById('js--lifespan--tooltip')

	if ( !tip ) {
		tip = document.createElement('div')
		tip.id = 'js--lifespan--tooltip'
		tip.setAttribute('role', 'tooltip')
		document.body.appendChild(tip)
	}

	return tip
}

function lifespanHover(event) {
	if ( !lifespanState ) {
		return
	}

	var index = lifespanCellAt(event)
	var tip   = lifespanTooltip()

	if ( index !== lifespanState.hover ) {
		var ctx = lifespanCanvas().getContext('2d')

		if ( lifespanState.hover >= 0 ) {
			lifespanPaintCell(ctx, lifespanState.hover, false)
		}
		if ( index >= 0 ) {
			lifespanPaintCell(ctx, index, true)
			tip.textContent = lifespanLabel(index)
		}

		lifespanState.hover = index
	}

	if ( index < 0 ) {
		tip.style.display = 'none'
		return
	}

	tip.style.display = 'block'

	var x = event.clientX + 12
	var y = event.clientY + 16
	if ( x + tip.offsetWidth > window.innerWidth - 8 ) {
		x = event.clientX - tip.offsetWidth - 12
	}
	if ( y + tip.offsetHeight > window.innerHeight - 8 ) {
		y = event.clientY - tip.offsetHeight - 16
	}

	tip.style.left = x + 'px'
	tip.style.top  = y + 'px'
}

function lifespanLeave() {
	if ( !lifespanState ) {
		return
	}

	if ( lifespanState.hover >= 0 ) {
		lifespanPaintCell(lifespanCanvas().getContext('2d'), lifespanState.hover, false)
		lifespanState.hover = -1
	}

	lifespanTooltip().style.display = 'none'
}

document.addEventListener('DOMContentLoaded', function() {
	var area    = document.getElementById('js--lifespan--area')
	var pending = 0

	area.addEventListener('mousemove', lifespanHover)
	area.addEventListener('mouseleave', lifespanLeave)

	// Coalesce resize work into a single frame; a redraw is a full repaint.
	new ResizeObserver(function() {
		if ( pending ) {
			return
		}
		pending = requestAnimationFrame(function() {
			pending = 0
			lifespanRender()
		})
	}).observe(area)
})
