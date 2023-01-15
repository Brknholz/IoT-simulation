# IoT Web Project

***

*The origin of this project comes from IoT course from studies.*

Project shows simulation of data broadcasting from multiple sources with managment system.
The main application can be run multiple times by choosing which data source should be used.
Data sharing app gets initial configuration and user dynamic configuration from configuration server.

Project includes:
- imitation of IoT source devices, 
- heating actuator with simple decision system,
- data aggregator (last 5, 10 or 15 measurments),
- filtration server/module,
- management system including configuration changing
- live plot for heating actuator
- server for future business operations

Data shares information by HTTP or MQTT methods - method can be choosen.

***
## How to run entire project
First step is to run application.js with source number, this app can be terminated multiple times only when it has unique source number.
By default there is 4 data sources, which numbers are hardcoded (0, 1, 2, 3).

### Run apps:

`node .\server.js`
`node .\config_server.js`
`node .\aggregation_server.js`
`node .\filtration.js`
`node .\actuator.js`
`node .\applications.js "source_number"`

applications.js has a limit to 4 simultanously running apps.

![running apps](https://drive.google.com/file/d/16LCB_b0589f_yqCEJTSgMzjHY_PUno_z/view?usp=sharing)

#### Subscribed MQTT topics:
- storage/mqtt/source0
- storage/mqtt/source1
- storage/mqtt/source2
- storage/mqtt/source3
    
#### POST endpoints:
- /storage/recieve/inital
- /storage/recieve/source0
- /storage/recieve/source1
- /storage/recieve/source2
- /storage/recieve/source3
- /storage/recieve/actuator

The end server works as a message server, where listening to HTTP methods and works as a MQTT subscriber.

When it is about MQTT querying, the server from specific topic answer to publisher with success.
The same communication has HTTP method, where the end server responds with success.

Every data recieve is saved only when specific app is running.
Data sources are sample data saved in *.csv format.