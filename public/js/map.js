mapboxgl.accessToken = maptoken;
const map = new mapboxgl.Map({
container: 'map', // container ID
center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
zoom: 13 // starting zoom
});

const marker = new mapboxgl.Marker({ color: "#ff385c" }) // Airbnb red
  .setLngLat(coordinates)
  .addTo(map);
