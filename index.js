const http = require('http')

const maxLat = 90, minLat = -90
const rngLat = maxLat - minLat
const maxLng = 180, minLng = -180
const rngLng = maxLng - minLng

const nReqs = 10
var reqs = []
for (let i = 0; i < nReqs; i++) {
	let lat = (Math.random() * rngLat) - maxLat
	let lng = (Math.random() * rngLng) - maxLng
	reqs.push(fetchData(lat, lng).catch(console.warn))
}

makeRequests(reqs, (dataset) => {
	if (dataset.length > 0) {
		let earliest = 0
		console.log('SUNRISE TIMES')
		for (let i = 0; i < dataset.length; i++) {
			console.log(`\t${i} = ${dataset[i].sunrise}`)
			if (Date.parse(dataset[earliest].sunrise) > Date.parse(dataset[i].sunrise))
				earliest = i
		}
		console.log(`EARLIEST ${earliest}
		sunrise: ${dataset[earliest].sunrise}
		day length: ${dataset[earliest].day_length}`)
	} else {
		console.warn('dataset is empty!')
	}
})

function fetchData(lat, lng, date) {
	if (lat == undefined || lng == undefined)
		throw new Error(`invalid lat/lng params passed to fetchData(${lat}, ${lng}, ...)`)
	if (date == undefined) date = new Date()
	const url = `http://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`
	return new Promise((resolve, reject) => {
		http.get(url, res => {
			console.log(`${res.statusCode}|${url}`)
			if ((res.statusCode) !== 200)
				reject(new Error(`invalid http status code (${res.statusCode}) from ${url}`))
			let chunks = []
			res.on('data', (c) => { chunks.push(c) })	
			res.on('end', () => {
				try {
					let data = JSON.parse(Buffer.concat(chunks).toString())
					if (data.status !== "OK")
						reject(new Error(`invalid status (${data.status}) from ${url}`))
					resolve(data.results)
				} catch (err) {
					reject(err)
				}
			})
		}).on('error', (err) => { reject(Error(`${url}\nfailed ${err.message}`)) })
	})
}

function makeRequests(requests, callback) {
	return new Promise(async (resolve) => {
		const maxActive = 5
		var dataset = []
		for (let i = 0; i < requests.length; i += maxActive) {
			let j = (i + maxActive > requests.length) ? requests.length : i + maxActive
			let data = await Promise.all(requests.slice(i, j)).catch(console.error)
			for (d in data) dataset.push(data[d])
			console.log('')
		}
		callback(dataset)
	})
}
