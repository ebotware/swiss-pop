import './style.css'
import "nouislider/dist/nouislider.css";

import 'ol/ol.css';
import noUiSlider from "nouislider";

import { OpenLayersLayerManager } from './open-layers-layer-manager';
import OpenLayersUtils from './OpenLayersUtils'
import { defineAndRegisterLv95 } from './utils';
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
  popDisplayDiv: HTMLInputElement;
}



class Main {
  htmlElements: HtmlElements;
  layerManager: OpenLayersLayerManager

  ageGapMin: number = 0;
  ageGapMax: number = 0;
  transparance: number = 0
  static async main() {
    Main.handleFiltersAspectTabs();

    let htmlElements = Main.findHtmlElements();
    if (typeof htmlElements == "string") throw (htmlElements)

    new Main(htmlElements).init()
    
  }

  constructor(htmlElements: HtmlElements) {
    this.htmlElements = htmlElements;

    const lv95 = defineAndRegisterLv95()

    // Create layermanager, useful to update features data
    // =======================================================

    const openLayersMap = OpenLayersUtils.initAndRegisterMap("map", CENTER_X, CENTER_Y, lv95);
    this.layerManager = new OpenLayersLayerManager(openLayersMap);

    // Init Sliders
    // =======================================================

    let transparenceSlider = noUiSlider.create(htmlElements.transparenceSliderElement, {
      start: [90],
      connect: true,
      range: {
        'min': [0],
        'max': [100]
      },
      step: 1
    });
    transparenceSlider.on("update", (ageGap) => {
      this.transparance = ageGap[0] as number;
    })

    const ageSlider = noUiSlider.create(htmlElements.range, {
      start: [0, 90],
      connect: true,
      range: {
        'min': [0],
        'max': [90]
      },
      step: 1
    });

    ageSlider.on("update", (ageGap) => {
      this.ageGapMin = ageGap[0] as number;
      this.ageGapMax = ageGap[1] as number;
      htmlElements.fromElement.innerHTML = String(this.ageGapMin)
      htmlElements.toElement.innerHTML = String(this.ageGapMax);
    })

    // Handle feature click event
    // =======================================================

    let clickedFeature: undefined | null | FeatureLike = null
    openLayersMap.on('click', (evt) => {
      if (evt.dragging) {
        htmlElements.popDisplayDiv.style.display = 'none';
        return;
      }

      const pixel = openLayersMap.getEventPixel(evt.originalEvent);
      const feature = openLayersMap.forEachFeatureAtPixel(pixel, (f) => f, {
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

    // Handle apply click event
    // =======================================================

    for (const element of htmlElements.applyButtons) {
      element.addEventListener("click", () => this.onApplyBtnPressed())
    }

    // Render map features on load
    // ======================================================
  }

  async init() {
    await this.updateMap()
    let courtainHtmlElement = document.getElementById("courtain")
    courtainHtmlElement?.classList.add("transition-all", "transition-discrete", "duration-500")
    courtainHtmlElement?.classList.replace("opacity-100", "opacity-0")
    courtainHtmlElement?.addEventListener("transitionend", () => {
      courtainHtmlElement.classList.add("hidden")
    }, { once: true })
  }

  onApplyBtnPressed() {
    async function apply(self: Main) {
      for (const applyBtn of self.htmlElements.applyButtons) {
        (applyBtn as HTMLButtonElement).disabled = true;
        applyBtn.querySelector('[data-action="apply"]')?.classList.add("hidden")
        applyBtn.querySelector('[data-action="loading"]')?.classList.remove("hidden")
      }
      await self.updateMap()
      for (const applyBtn of self.htmlElements.applyButtons) {
        (applyBtn as HTMLButtonElement).disabled = false;
        applyBtn.querySelector('[data-action="apply"]')?.classList.remove("hidden")
        applyBtn.querySelector('[data-action="loading"]')?.classList.add("hidden")
      }
    }
    apply(this)
  }

  async updateMap() {
    let gender = "a"
    if (this.htmlElements.genderMHtmlE.checked && this.htmlElements.genderFHtmlE.checked) gender = "a";
    else if (this.htmlElements.genderMHtmlE.checked) gender = "m"
    else if (this.htmlElements.genderFHtmlE.checked) gender = "f"
    await this.layerManager.loadMapData(this.ageGapMin, this.ageGapMax, gender, this.transparance / 100)
  }


  // UTILS FUNCTIONS
  // ===============
  static findHtmlElements(): HtmlElements | string {
    const notFound = "not found";

    let rangeId = "slider";
    const range = document.getElementById(rangeId);
    if (range == null) {
      return rangeId + " " + notFound
    }

    let genderM = "#gender-m"
    const genderMHtmlE = document.querySelector<HTMLInputElement>(genderM)
    if (genderMHtmlE == null) {
      return `${genderM}` + notFound
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

    const tooltip = document.querySelector<HTMLInputElement>('#tooltip');
    if (!tooltip) return "tooltip not found";

    return { range, genderFHtmlE, genderMHtmlE, toElement, fromElement, transparenceSliderElement, applyButtons, popDisplayDiv: tooltip }
  }

  static handleFiltersAspectTabs() {
    // TABS
    let filters = document.getElementById("filters");
    let aspects = document.getElementById("aspects")

    let filterBtn = document.querySelector("[data-action='filter']");
    filterBtn?.addEventListener("click", () => {
      filterBtn?.classList.replace("bg-white", "bg-gray-100")
      filterBtn?.classList.replace("border-gray-200", "border-transparent")
      aspectBtn?.classList.replace("bg-gray-100", "bg-white")
      aspectBtn?.classList.replace("border-transparent", "border-gray-200")
      filters?.classList.replace("hidden", "block")
      aspects?.classList.replace("block", "hidden")
    })

    let aspectBtn = document.querySelector("[data-action='aspect']");
    aspectBtn?.addEventListener("click", () => {
      aspectBtn?.classList.replace("bg-white", "bg-gray-100")
      aspectBtn?.classList.replace("border-gray-200", "border-transparent")
      filterBtn?.classList.replace("bg-gray-100", "bg-white")
      filterBtn?.classList.replace("border-transparent", "border-gray-200")

      aspects?.classList.replace("hidden", "block")
      filters?.classList.replace("block", "hidden")
    })
  }
}


Main.main()
