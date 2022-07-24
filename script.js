function lifespan(dob, lifespan = 85) {
	// dob      = Date of Birth
	// lifespan = years of expected lifespan
	//            defaults to 85 years

	var area          = document.getElementById('js--lifespan--area')
	var text          = document.getElementById('js--lifespan--text')
	var areaHTML      = ''
	var textHTML      = ''
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

	if ( days_lived > 0 ) {
		areaHTML += '<div class="lifespan--day lifespan--day--lived"></div>'.repeat(days_lived)
	}
	if ( days_unlived > 0 ) {
		areaHTML += '<div class="lifespan--day lifespan--day--unlived"></div>'.repeat(days_unlived)
	}
	if ( days_deceased > 0 ) {
		areaHTML += '<div class="lifespan--day lifespan--day--deceased"></div>'.repeat(days_deceased)
	}

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

	area.innerHTML = areaHTML
	text.innerHTML = textHTML

}
