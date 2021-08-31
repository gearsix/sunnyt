import { Config, SunsetSunrise } from './sunnyt'

const cfg: Config = require('./config.json')

requestData(cfg, initDataset(cfg)).then((dataset: SunsetSunrise[]) => {
	if (dataset.length === 0) {
		console.error('empty dataset!')
		return
	}

	console.log('SUNRISE TIMES')
	let earliest = -1
	for (let i = 0; i < dataset.length; i++) {
		if (dataset[i].data.sunrise.getFullYear() == 1970) {
			console.log(`\t${i} = ${dataset[i].data.sunrise} - void date`)
			continue
		} else {
			console.log(`\t${i} = ${dataset[i].data.sunrise}`)
		}
		if (earliest === -1)
			earliest = i
		if (dataset[earliest].data.sunrise > dataset[i].data.sunrise)
			earliest = i
	}
	if (earliest === -1)
		console.log("not enough valid data retrieved")
	else {
		console.log(`EARLIEST ${earliest}
	sunrise: ${dataset[earliest].data.sunrise}
	day length: ${dataset[earliest].data.dayLength}`)
	}
})

function initDataset(cfg: Config): SunsetSunrise[] {
	let ds: SunsetSunrise[] = []
	for (let i = 0; i < cfg.datasetSize; i++)
		ds.push(new SunsetSunrise())
	return ds
}

function requestData(cfg: Config, dataset: SunsetSunrise[]): Promise<SunsetSunrise[]> {
    return new Promise<SunsetSunrise[]>(async(resolve) => {
		for (let i = 0; i < dataset.length; i += cfg.requestLimit) {
			let j = (i + cfg.requestLimit > dataset.length) ? dataset.length : i + cfg.requestLimit
			
			let reqs: Promise<void>[] = []
			for (let r = i; r < j; r++)
				reqs.push(dataset[r].requestData())

			console.log(`${i+cfg.requestLimit}/${dataset.length} requests...`)
			await Promise.all(reqs).catch(console.error)
			console.log('')
		}
		resolve(dataset)
	})
}
