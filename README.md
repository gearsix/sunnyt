
ssrt
====

_Sun Set & Rise Times_

A simple tool to that generates a set of coordinates and makes requests to
[sunrise-sunset.org](https://sunrise-sunset.org/) to fetch data about those
coordinates sunrise and sunset times and find out which one has the earliest
sunrise.

<img alt="xkcd Coordinate Precision" src=https://imgs.xkcd.com/comics/coordinate_precision.png
  height="500" style="float: right;" />

Usage
-----

- `npm start` - build & run the tool
- `npm build` - build the tool
- `npm run` - skip building the tool and just run it.
This will fail if the tool hasn't already been built.

Configuration
-------------

The tool is configured through a _./config.json_ file. This file is required to run the tool.

- **datasetSize** = The number of coordinates to generate and fetch data for
- **requestLimit** = The maximum number of requests to make to sunrise-sunset.org

**Important:** Setting the _requestLimit_ too high might cause sunrise-sunset.org to block your IP and cause
any future requests to get a ECONNREFUSED response. If this happens, you'll have to wait 24hrs or proxy through
another IP to make future requests.

Notes
-----

- **Results have "void date"?** - This happens when generated coordinates are not in one of the countries [supported by SunriseSunset](https://sunrise-sunset.org/explore).
When this happens their API returns epoch, which this tool will just ignore.
- This was my first project using Typescript, let me know if I'm doing anything weird.

Future
------

- (should) Implement reverse geocoding to get the name of the location for the coordinates generated:
[Google Reverse Geocoding](https://developers.google.com/maps/documentation/javascript/geocoding#ReverseGeocoding)
- (could) Add a web interface to let users pick coordinates using a map.

Authors
-------

- Alex Collins (alexander-collins@outlook.com)

