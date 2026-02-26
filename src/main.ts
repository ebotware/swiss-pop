import './style.css'
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createSquare } from './utils';
import "nouislider/dist/nouislider.css";

import noUiSlider from "nouislider";
(async() => {
  const range = document.getElementById("slider") as HTMLElement;
  const genderMHtmlE = document.getElementById("gender-m") as HTMLInputElement
  if (genderMHtmlE==null)return;
  const genderFHtmlE = document.getElementById("gender-f") as HTMLInputElement
  if (genderFHtmlE==null)return;

  const fromElement = document.getElementById("range-from")
  const toElement = document.getElementById("range-to")
    if (fromElement==null || toElement==null)return;

  let ageGapMin = 0;
  let ageGapMax = 0;
  let gender = "a"
  type CRD = {
    lat: number,
    lng: number,
    tot: number
  }

  class MapMamager {
    populationLayer: L.LayerGroup<any> | null = null;
    async loadMapData(agemin: number, agemax: number, gender: string) {
      if (this.populationLayer) {
        this.populationLayer.remove()
      }
      this.populationLayer = L.layerGroup().addTo(map);


      var cumulativeValue = new Map<string, CRD>()
      for (const statPopRow of statPopData) {
        if (gender !== "a" && statPopRow.gender !== gender) {
          continue;
        }

        if (Number.parseInt(statPopRow.max, 10) > agemax) {
          continue;
        }
        if (Number.parseInt(statPopRow.min, 10) < agemin) {
          continue;
        }
        if (cumulativeValue.has(statPopRow.lat + "-" + statPopRow.lng)) {

          var num = (cumulativeValue.get(statPopRow.lat + "-" + statPopRow.lng) as CRD).tot + Number(statPopRow.tot)
          cumulativeValue.set(statPopRow.lat + "-" + statPopRow.lng, { tot: num, lat: Number(statPopRow.lat), lng: Number(statPopRow.lng) })
        }
        else cumulativeValue.set(statPopRow.lat + "-" + statPopRow.lng, { tot: Number(statPopRow.tot), lat: Number(statPopRow.lat), lng: Number(statPopRow.lng) })
      }

      for (const element of cumulativeValue) {
        var pNum = element[1].tot

        if (element[1].tot == 0) continue;

        let red = 0;
        let blue = 0;
        if (gender === "a")
          red = pNum * 2
        blue = pNum * 2
        if (gender === "f") {
          red = pNum * 5
        }
        const square = createSquare(new L.LatLng(element[1].lat, element[1].lng), 100, `rgba(${red},${0},${blue})`)
        square.addTo(this.populationLayer)
        square.bindTooltip(`${element[1].tot} abitanti`, {
          permanent: false,
          direction: 'center',
          className: 'square-tooltip'
        });
      }

    }
  }


  let mapManager: MapMamager = new MapMamager();

  function updateMap() {
    let gender = "a"
    if(genderMHtmlE.checked && genderFHtmlE.checked) gender = "a";
    else if(genderMHtmlE.checked) gender = "m"
    else if(genderFHtmlE.checked) gender = "f"
    mapManager.loadMapData(ageGapMin, ageGapMax, gender)
  }


  var s = noUiSlider.create(range, {
    start: [0, 90],
    connect: true,
    range: {
      'min': [0],
      'max': [90]
    },
    step:1
  });


  s.on("update", (ageGap) => {
    ageGapMin = ageGap[0] as number;
    ageGapMax = ageGap[1] as number;
    fromElement.innerHTML = String(ageGapMin)
    toElement.innerHTML = String(ageGapMax);
  })
  //
  document.getElementById("btn-apply")?.addEventListener("click", updateMap)

  const ORIGIN: L.LatLng = new L.LatLng(45.8713, 8.9841);

  const map: L.Map = L.map('map', {
    center: ORIGIN,
    zoom: 14,
    maxZoom:15,
    minZoom:12,
    zoomSnap: 0.25,
    //preferCanvas:true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom:20,
    attribution: '&copy;<a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy;<a target="_blank" href="https://www.bfs.admin.ch/bfs/en/home.html">Federal Statistical Office</a>',
  }).addTo(map);



  async function loadData(): Promise<any> {
    const response = await fetch("/STATPOP2024.json");

    if (!response.ok) {
      throw new Error("Failed to load JSON");
    }

    const data: any = await response.json();
    return data;
  }
  const statPopData = await loadData()




 mapManager.loadMapData(ageGapMin, ageGapMax, gender)

})()
