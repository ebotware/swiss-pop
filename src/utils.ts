import * as L from "leaflet";

const borderThickness      = 2; 

function metersToDegreesAtLatitude(lat:number, meters:number) {
  // 1 grado di latitudine sono ca. 111.320 metri
  const metersPerDegreeLat = 111320;                    
  const metersPerDegreeLon = 111320 * Math.cos(lat * Math.PI / 180); // calcolo longitudine in base alla latitudine
  
  const deltaLat = meters / metersPerDegreeLat;
  const deltaLon = meters / metersPerDegreeLon;
  
  return { deltaLat, deltaLon };
}

export function createSquare(latLgn:L.LatLng, sizeMeters:number, color:string) {
  const { deltaLat, deltaLon } = metersToDegreesAtLatitude(latLgn.lat, sizeMeters / 2);
  
  const bounds:L.LatLngBoundsExpression = [
    [latLgn.lat - deltaLat, latLgn.lng - deltaLon],   // southwest
    [latLgn.lat + deltaLat, latLgn.lng + deltaLon]    // northeast
  ];
  
  return L.rectangle(bounds, {
    color:       color,
    weight:      borderThickness,
    opacity:     0,
    fillColor:   color,
    fillOpacity: 0.5,
  });
}