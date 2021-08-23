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
	reqs.push(fetchData(lat, lng).catch((err) => {
		console.warn(err)
	}))
}

makeRequests(reqs).then((dataset) => {
	if (dataset.length > 0) {
		let earliest = 0
		for (let i = 1; i < dataset.length; i++) {
			if (Date.parse(dataset[earliest].sunrise) < Date.parse(dataset[i].sunrise))
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
		}).on('error', (err) => { reject(Error(`${url}\nfailed ${err.message}`)) }).end()
	})
}

async function makeRequests(requests) {
	const maxActive = 5
	var dataset = []
	for (let i = 0; i < maxActive; i += maxActive) {
		data = await Promise.all(reqs.slice(i, i + maxActive)).catch(console.error)
		dataset.concat(data)
	}
	return dataset
}
