/**
 * TODO
**/
import { get } from 'http'

const maxLat: number = 90
const minLat: number = -90
const maxLng: number = 180
const minLng: number = -180

function generateLatitude(min? :number, max? :number): number {
	if (!min) min = minLat
	if (!max) max = maxLat
	let rngLat = max - min
	return parseFloat(((Math.random() * rngLat) - maxLat).toPrecision(8))
}

function generateLongitude(min? :number, max? :number): number {
	if (!min) min = minLng
	if (!max) max = maxLng
	let rngLng = max - min
	return parseFloat(((Math.random() * rngLng) - maxLng).toPrecision(8))
}

export interface Config {
	datasetSize: number
	requestLimit: number
	verbose: boolean
}

export interface SunriseSunsetData {
    sunrise                   : Date,
    sunset                    : Date,
    solarNoon                 : Date,
    dayLength                 : Date,
    civilTwilightBegin        : Date,
    civilTwilightEnd          : Date,
    nauticalTwilightBegin     : Date,
    nauticalTwilightEnd       : Date,
    astronomicalTwilightBegin : Date,
    astronomicalTwilightEnd   : Date
}

export class SunsetSunrise {
    readonly lat: number
    readonly lng: number 
    readonly date: Date
    data: SunriseSunsetData

	constructor(lat? :number, lng? :number, date? :Date) {
		this.lat = (!lat) ? generateLatitude() : lat
		this.lng = (!lng) ? generateLongitude() : lng
		this.date = (!date) ? new Date() : date
	}

	requestData(): Promise<void> {
		const url = `http://api.sunrise-sunset.org/json?lat=${this.lat}&lng=${this.lng}&formatted=0`
		return new Promise<void>((resolve, reject) => {
			get(url, res => {
				if (res.statusCode !== 200)
					reject(new Error(`invalid http response ${res.statusCode} from ${url}`))
				let chunks = []
				res.on('data', (c) => { chunks.push(c) })
				res.on('end', () => {
					try {
						let data = JSON.parse(Buffer.concat(chunks).toString())
						if (data.status !== "OK")
							reject(new Error(`invalid status ${data.status} from ${url}`))
						this.data = {
						  sunrise                   : new Date(data.results.sunrise),
						  sunset                    : new Date(data.results.sunset),
						  solarNoon                 : new Date(data.results.solar_noon),
						  dayLength                 : new Date(data.results.day_length),
						  civilTwilightBegin        : new Date(data.results.civil_twilight_begin),
						  civilTwilightEnd          : new Date(data.results.civil_twilight_end),
						  nauticalTwilightBegin     : new Date(data.results.nautical_twilight_begin),
						  nauticalTwilightEnd       : new Date(data.results.nautical_twilight_end),
						  astronomicalTwilightBegin : new Date(data.results.astronomical_twilight_begin),
						  astronomicalTwilightEnd   : new Date(data.results.astronomical_twilight_end)
						}
						console.log(`${data.status}|${url}`)
						resolve()
					} catch(err) {
						reject(err)
					}
				}).on('error', (err) => { reject(new Error(`${url}\nfailed ${err.message}`)) })
			})
		})
	}
}

