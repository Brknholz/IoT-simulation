# IoT Symulacja

***

*Jest to projekt realizowany na potrzeby kursu Systemy IoT.*

Symulacja przesyłu źródeł danych do serwera za pomocą wybranej metody MQTT lub HTTP.
Projekt zawiera aplikację, umożliwiającą jej kilkukrotne uruchomienie z konkretnym źródłem danych.
Aplikacja wysyłająca dane pobiera konfigurację początkową z serwera konfiguracyjnego, z któego również otrzymuje dynamicznie zmienianą przez użytkownika konfigurację

***

## Aby uruchomić aplikację z wybranym źródłem danych i metodą przesyłu:

`node applications.js (numer źródła)`

numery źródeł: (0, 1, 2, 3) - numer odpowiada indexowi nazwy pliku ze zbioru:

`['Array_of_Things_Locations.csv', 'Beach_Weather_Stations_-_Automated_Sensors.csv', 'private_mobile_devices.csv', 'private_static_devices.csv']`

### subskrybowane tematy MQTT:
- storage/mqtt/source0
- storage/mqtt/source1
- storage/mqtt/source2
- storage/mqtt/source3
    
### endpointy POST:
- /storage/recieve/inital
- /storage/recieve/source0
- /storage/recieve/source1
- /storage/recieve/source2
- /storage/recieve/source3

Aplikacja serwera działa jako serwer HTTP nasłuchujący żądań POST na ww. lokalizacjach
oraz pełni rolę subskrybenta MQTT tematów przez które przechodzą informacje z uruchomionych źródeł.

W przypadku odbioru informacji z MQTT z zadanego tematu, serwer odpowiada publisherowi komunikatem o odbiorze informacji.
W przypadku odbioru żądania HTTP POST serwer również odpowiada aplikacji źródłowej o otrzymaniu żądania

Każde otrzymanie danych na serwer nie jest zapisywane, a wyświetlane są odpowiednie komunikaty wraz z odebranymi danymi.

źródła danych to przykładowe dane w formacie *.csv 
