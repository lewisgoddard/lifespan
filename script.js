function lifespan(dob, lifespan = 100) {
	// dob      = Date of Birth
	// lifespan = years of expected lifespan
	//            defaults to 100 years

	var area          = document.getElementById('js--lifespan--area')
	var text          = document.getElementById('js--lifespan--text')
	var html          = ''
	var current_date  = new Date()
	var lifespan      = parseFloat(lifespan)
	dob               = new Date(dob)

	var end_of_life   = new Date(dob)
	end_of_life.setFullYear(end_of_life.getFullYear() + lifespan)

	var days_lifespan = Math.round(
		( end_of_life.getTime() - dob.getTime() )
		/
		( 1000 * 60 * 60 * 24 )
	)

	var days_lived    = Math.round(
		// Get time stamps in milliseconds
		( current_date.getTime() - dob.getTime() )
		/
		// Milliseconds * Second * Minutes * Hours
		( 1000 * 60 * 60 * 24 )
	)

	var days_unlived  = ( days_lifespan - days_lived )
	var days_deceased = ( days_lived - days_lifespan )

	console.log('Date of Birth: '    + dob)
	console.log('End of Life: '      + end_of_life)
	console.log('Days in Lifespan: ' + days_lifespan)
	console.log('Days Lived: '       + days_lived)
	console.log('Days Unlived: '     + days_unlived)
	console.log('Days Deceased: '    + days_deceased)

	html += '<div class="lifespan--day lifespan--day--lived"></div>'.repeat(days_lived)
	if ( days_unlived > 0 ) {
		html += '<div class="lifespan--day lifespan--day--unlived"></div>'.repeat(days_unlived)
	} else {
		html += '<div class="lifespan--day lifespan--day--deceased"></div>'.repeat(days_deceased)
	}

	area.innerHTML = html
	text.innerHTML = '<p>' +
	                 '<span>Estimated days in lifespan: ' + days_lifespan.toLocaleString() + '</span>' +
	                 '<span>Days lived: '                 + days_lived.toLocaleString()    + '</span>' +
	                 '<span>Estimated days remaining: '   + days_unlived.toLocaleString()  + '</span>' +
	                 '<span>Completion: ' + ( ( days_lived / days_lifespan ) * 100 ).toLocaleString() + ' %</span>' +
	                 '</p>'

}
