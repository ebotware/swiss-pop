import './style.css'
import "nouislider/dist/nouislider.css";

import 'ol/ol.css';
import OpenLayersMap from 'ol/Map';
import noUiSlider from "nouislider";

import type { StatPopRowType } from './StatPopRowType';
import { MapMamager } from './MapMamager';
import OpenLayersUtils from './OpenLayersUtils'
import { defineAndRegisterLv95 } from './utils';
import type { Feature } from 'ol';
import type { FeatureLike } from 'ol/Feature';


const CENTER_X = 2717400;
const CENTER_Y = 1095200;

type HtmlElements = {
  range: HTMLElement;
  genderFHtmlE: HTMLInputElement;
  genderMHtmlE: HTMLInputElement;
  toElement: HTMLElement;
  fromElement: HTMLElement;
  transparenceSliderElement: HTMLElement;
  applyButtons: NodeListOf<Element>;
  popDisplayDiv: HtmlElement;
}

function initHtmlElements(): HtmlElements | string {
  let rangeId = "slider";
  const range = document.getElementById(rangeId);
  if (range == null) {
    return " "
  }

  let genderM = "#gender-m"
  const genderMHtmlE = document.querySelector<HTMLInputElement>(genderM)
  if (genderMHtmlE == null) {
    return `${genderM} note defined`
  }

  const genderFHtmlE = document.getElementById("gender-f") as HTMLInputElement
  if (genderFHtmlE == null) {
    return `gender-f not defined`
  }

  const fromElement = document.getElementById("range-from")
  const toElement = document.getElementById("range-to")
  if (fromElement == null || toElement == null) return "";

  const transparenceSliderElement = document.getElementById("transparence-slider");
  if (!transparenceSliderElement) return "";

  const applyButtons = document.querySelectorAll("[data-target='apply']")
  const tooltip = document.getElementById('tooltip') as HTMLElement;

  return { range, genderFHtmlE, genderMHtmlE, toElement, fromElement, transparenceSliderElement, applyButtons, popDisplayDiv: tooltip }
}

async function loadStatPopJSONData(): Promise<StatPopRowType[]> {
  const response = await fetch("/STATPOP2024.json");

  if (!response.ok) {
    throw new Error("Failed to load JSON");
  }

  const data: any = await response.json();
  var sanitizedData: StatPopRowType[] = []
  for (const rowData of data) {
    sanitizedData.push({ lat: Number(rowData.lat as string), lng: Number(rowData.lng as string), m: (rowData.m as string[]).map(Number), f: (rowData.f as string[]).map(Number) })
  }
  return sanitizedData;
}
async function main() {
  let ageGapMin = 0;
  let ageGapMax = 0;
  let gender = "a"

  let htmlElements = initHtmlElements()

  if (typeof htmlElements == "string") {
    console.error(htmlElements)
    return
  }

  const lv95 = defineAndRegisterLv95()


  // Define and register open layers map
  const map: OpenLayersMap = OpenLayersUtils.initAndRegisterMap("map", CENTER_X, CENTER_Y, lv95);
  let clickedFeature: undefined | null | FeatureLike = null
  map.on('click', (evt) => {
    if (evt.dragging) {
      htmlElements.popDisplayDiv.style.display = 'none';
      return;
    }

    const pixel = map.getEventPixel(evt.originalEvent);
    const feature = map.forEachFeatureAtPixel(pixel, (f) => f, {
      hitTolerance: 6
    });

    if (feature !== clickedFeature) {
      if (feature) {
        const name = feature.get('name') || 'Numero abitanti';
        const extra = feature.get('info') ? `<small>${feature.get('info')}</small>` : '';
        htmlElements.popDisplayDiv.innerHTML = `<bold class="font-bold">${name}</bold> ${extra}`;
        htmlElements.popDisplayDiv.style.display = 'block';
      } else {
        htmlElements.popDisplayDiv.style.display = 'none';
      }
      clickedFeature = feature;
    }
  });

  // Create a map manager to update our layers
  let mapManager: MapMamager = new MapMamager(map);


  // Init nouislider age slider and bind events
  var ageSlider = noUiSlider.create(htmlElements.range, {
    start: [0, 90],
    connect: true,
    range: {
      'min': [0],
      'max': [90]
    },
    step: 1
  });

  ageSlider.on("update", (ageGap) => {
    ageGapMin = ageGap[0] as number;
    ageGapMax = ageGap[1] as number;
    htmlElements.fromElement.innerHTML = String(ageGapMin)
    htmlElements.toElement.innerHTML = String(ageGapMax);
  })

  // Init nouislider transparance slider
  let transparenceSlider = noUiSlider.create(htmlElements.transparenceSliderElement, {
    start: [90],
    connect: true,
    range: {
      'min': [0],
      'max': [100]
    },
    step: 1
  });


  for (const element of htmlElements.applyButtons) {
    element.addEventListener("click", () => updateMap(htmlElements.genderMHtmlE, htmlElements.genderFHtmlE))
  }


  const statPopData = await loadStatPopJSONData()

  function updateMap(genderMHtmlE: HTMLInputElement, genderFHtmlE: HTMLInputElement) {
    let gender = "a"
    if (genderMHtmlE.checked && genderFHtmlE.checked) gender = "a";
    else if (genderMHtmlE.checked) gender = "m"
    else if (genderFHtmlE.checked) gender = "f"
    mapManager.loadMapData(statPopData, ageGapMin, ageGapMax, gender, transparenceSlider.getPositions()[0] / 100)
  }

  let filterBtn = document.querySelector("[data-action='filter']");
  let filters = document.getElementById("filters");
  let aspects = document.getElementById("aspects")
  document.querySelector("[data-action='filter']")?.addEventListener("click",()=>{
filterBtn?.classList.replace("bg-white","bg-gray-100")
    filterBtn?.classList.replace("border-gray-200","border-transparent")
    aspectBtn?.classList.replace("bg-gray-100","bg-white")
    aspectBtn?.classList.replace("border-transparent","border-gray-200")
    filters?.classList.replace("hidden","block")
    aspects?.classList.replace("block","hidden")
  })
  let aspectBtn = document.querySelector("[data-action='aspect']");
 document.querySelector("[data-action='aspect']")?.addEventListener("click",()=>{
    aspectBtn?.classList.replace("bg-white","bg-gray-100")
    aspectBtn?.classList.replace("border-gray-200","border-transparent")
    filterBtn?.classList.replace("bg-gray-100","bg-white")
    filterBtn?.classList.replace("border-transparent","border-gray-200")

    aspects?.classList.replace("hidden","block")
    filters?.classList.replace("block","hidden")
  })
  // First load
  updateMap(htmlElements.genderMHtmlE, htmlElements.genderFHtmlE)


}
main()
