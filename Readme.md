An API to find a service (train) based on my current location, direction of travel and other information available from a smart phone. 

The aim is for the system (an App) to automatically work out which train I'm on, so it can then quickly tell me if the train is running late, what time it's expected at the next stop, etc.

```
npm update
npm run start server.js
```
(or nodemon run start server.js)

There are 2 APIs:
* localhost:3000/stations
* localhost:3000/trains

The second returns the same information as the first, plus a list of trains that you might be on.

