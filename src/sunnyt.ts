import { get } from 'http'

const maxLat: number = 90
const minLat: number = -90
const maxLng: number = 180
const minLng: number = -180

/**
 * Generate a number inbetween `min` & `max`. If `min` or `max` are
 * undefined, then `minLat` and `maxLat` will be used respectively.
**/
function generateLatitude(min? :number, max? :number): number {
  if (!min) min = minLat
  if (!max) max = maxLat
  let rngLat = max - min
  return parseFloat(((Math.random() * rngLat) - maxLat).toPrecision(8))
}

/**
 * Generate a number inbetween `min` & `max`. If `min` or `max` are
 * undefined, then `minLng` and `maxLng` will be used respectively.
**/
function generateLongitude(min? :number, max? :number): number {
  if (!min) min = minLng
  if (!max) max = maxLng
  let rngLng = max - min
  return parseFloat(((Math.random() * rngLng) - maxLng).toPrecision(8))
}

/**
 * Available options in this tools configuration.
**/
export interface Config {
  datasetSize: number
  requestLimit: number
}

/**
 * SunriseSunsetData contains all results data returned by sunrise-sunset.org.
 * See sunrise-sunset.org/api for details.
**/
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

/**
 * SunriseSunset is the main class for this tool. It contians the request method
 * and all the data required to make a request to sunrise-sunset.org.
**/
export class SunriseSunset {
    readonly lat: number
    readonly lng: number 
    readonly date: Date
    data: SunriseSunsetData

  constructor(lat? :number, lng? :number, date? :Date) {
    this.lat = (!lat) ? generateLatitude() : lat
    this.lng = (!lng) ? generateLongitude() : lng
    this.date = (!date) ? new Date() : date
    this.data = undefined
  }

  /**
   * requestData returns the `Promise` of a `get` (from NodeJS' `http`). This request will be to
   * `api.sunrise-sunset.org/...` and it's returned will be parsed and written to `this.data` for
   * later access.
   * WARNING: This will overwrite any currently existing data in `this.data`.
  **/
  requestData(): Promise<void> {
    let dateFmt = `${this.date.getFullYear()}-${this.date.getMonth()+1}-${this.date.getDate()}`
    const url = `http://api.sunrise-sunset.org/json?lat=${this.lat}&lng=${this.lng}&date=${dateFmt}&formatted=0`
    
    const handleResponse = new Promise<void>((resolve, reject) => {
      get(url, (response) => {
        if (response.statusCode !== 200)
          reject(new Error(`invalid response ${response.statusCode} from ${url}`))
        
        let responseData = []
        response.on('data', (chunk) => { responseData.push(chunk) })

        response.on('error', (err) => { reject(err) })

        response.on('end', () => {
          try { // JSON.parse might throw if data is malformed
            let data = JSON.parse(Buffer.concat(responseData).toString())
            
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

            resolve()
          } catch(err) {
            reject(err)
          }
        })
      }).on('error', (err) => reject(err))
    })

    return handleResponse
  }
}

