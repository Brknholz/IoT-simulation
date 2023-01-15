# IoT Web Project


<p float="left">
<img src="https://drive.google.com/uc?export=view&id=1lgi-5kDmeRUAlT5tpK20JEu2TMlDMZT1" style="width: 260px; max-width: 100%; height: auto; float: left" title="Click to enlarge picture" />

<img src="https://drive.google.com/uc?export=view&id=1Ezyh988HI2Uy9DfDKvC9F8ekmXHuklcm" style="width: 350px; max-width: 100%; height: auto" title="Click to enlarge picture" />

<img src="https://drive.google.com/uc?export=view&id=1M88MJGe-f3DaweMuqS9QRcg9n6ZqKPgi" style="width: 390px; max-width: 100%; height: auto" title="Click to enlarge picture" />
</p>
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

<a href="https://drive.google.com/uc?export=view&id=16LCB_b0589f_yqCEJTSgMzjHY_PUno_z"><img src="https://drive.google.com/uc?export=view&id=16LCB_b0589f_yqCEJTSgMzjHY_PUno_z" style="width: 150px; max-width: 100%; height: auto" title="Click to enlarge picture" />

<a href="https://drive.google.com/uc?export=view&id=1qIpszyFHh7G4eVImk8zGOhxYy-h3XxI6"><img src="https://drive.google.com/uc?export=view&id=1qIpszyFHh7G4eVImk8zGOhxYy-h3XxI6" style="width: 450px; max-width: 100%; height: auto" title="Click to enlarge picture" />

The end server works as a message server, where listening to HTTP methods and works as a MQTT subscriber.

When it is about MQTT querying, the server from specific topic answer to publisher with success.
The same communication has HTTP method, where the end server responds with success.

Every data recieve is saved only when specific app is running.
Data sources are sample data saved in *.csv format.

<p float="left">

<img src="https://drive.google.com/uc?export=view&id=1bCdwuaQ6zlQkroDxuY8zl379jkgj5_LP" style="max-width: 100%; height: auto" title="Click to enlarge picture" />

<img src="https://drive.google.com/uc?export=view&id=1ijaVQPjPxc8qfwWEMACC9-bX2Rc-EDH1" style="width: 210px; max-width: 100%; height: auto" title="Click to enlarge picture" />

<img src="https://drive.google.com/uc?export=view&id=1trdP1E72MAwyTq-Ozmjq9evRf90XGaQG" style="width: 450px; max-width: 100%; height: auto" title="Click to enlarge picture" />

<img src="https://drive.google.com/uc?export=view&id=1wmwJdKijI0GzG73GnUbrbhbh8hU61t1I" style="width: 450px; max-width: 100%; height: auto" title="Click to enlarge picture" />


</p>
