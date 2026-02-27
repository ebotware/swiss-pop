import OLMap from 'ol/Map';

import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Style } from 'ol/style';
import type { StatPopRowType } from './StatPopRowType';

type CRD = {
  lat: number,
  lng: number,
  tot: number
}
export class MapMamager {
  vectorLayer: VectorLayer | null = null;
  map: OLMap;
  constructor(map: OLMap) {
    this.map = map;
  }
  async loadMapData(statPopData: StatPopRowType[], agemin: number, agemax: number, gender: string, transparence: number) {

    var cumulativeValue = new Map<string, CRD>()
    let lowerColLimit = Math.trunc(agemin / 5)
    let upperColLimit = Math.trunc(agemax / 5)

    var total = 0;
    console.log("slice: ", lowerColLimit, upperColLimit)
    let max = 0;
    for (const statPopRow of statPopData) {
      if (gender == "m" || gender == "a")
        total = statPopRow.m.slice(lowerColLimit, upperColLimit).reduce((v, i) => v + i, 0)
      if (gender == "f" || gender == "a")
        total = statPopRow.f.slice(lowerColLimit, upperColLimit).reduce((v, i) => v + i, 0)
      if (total > max) max = total;
      cumulativeValue.set(statPopRow.lat + "-" + statPopRow.lng, { lat: statPopRow.lat, lng: statPopRow.lng, tot: total })
    }
    console.log(max)
    var features: Feature[] = []
    for (const element of cumulativeValue) {
      var pNum = element[1].tot

      if (element[1].tot == 0) continue;

      let red = 0;
      let blue = 0;
      if (gender === "a") {
        red = pNum * 2
        blue = pNum * 2
      }
      if (gender === "f") {
        red = pNum * 4
      }
      if (gender === "m") {
        red = pNum * 4
      }
      const halfSize = 50; // 100m square
      let centerX = element[1].lat;
      let centerY = element[1].lng;
      const square = new Polygon([[
        [centerX - halfSize, centerY - halfSize],
        [centerX + halfSize, centerY - halfSize],
        [centerX + halfSize, centerY + halfSize],
        [centerX - halfSize, centerY + halfSize],
        [centerX - halfSize, centerY - halfSize],
      ]]);
      let feature = new Feature({ geometry: square, info: pNum });
      feature.set("color", `rgba(${red},10,${blue},${transparence})`)

      features.push(feature);
      //const square = createSquare(new L.LatLng(element[1].lat, element[1].lng), 100, `rgba(${red},${0},${blue})`)
      //square.addTo(this.populationLayer)
      /*square.bindTooltip(`${element[1].tot} abitanti`, {
        permanent: false,
        direction: 'center',
        className: 'square-tooltip'
      });*/
    }
    if (this.vectorLayer)
      this.map.removeLayer(this.vectorLayer)
    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: features,
      }),
      style: (feature) => {
        let color = feature.get("color");
        //console.log(color)
        let s = new Style({
          fill: new Fill({
            color: color,
          }),
        })
        return s;
      },
    });

    this.map.addLayer(this.vectorLayer)
  }
}