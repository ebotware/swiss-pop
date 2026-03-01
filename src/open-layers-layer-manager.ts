import OLMap from 'ol/Map';

import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import type { GetFeaturesParams, PolygonData, WorkerRequest, WorkerResponse } from './geodata-worker.types';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { intersects } from 'ol/extent';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';

export type CRD = {
  lat: number,
  lng: number,
  tot: number
}


export class OpenLayersLayerManager {
  vectorLayer: VectorLayer | null = null;
  map: OLMap;
  worker;
  onPercentUpdate: (percent: number) => void

  constructor(map: OLMap, onPercentUpdate: (percent: number) => void) {
    this.map = map;
    this.onPercentUpdate = onPercentUpdate;
    this.worker = new Worker(
      new URL("./geodata.worker.ts", import.meta.url),
      { type: "module" }
    );
    const selectClick = new Select({
      condition: click,
      style: (feature, resolution) => {
        if (!this.vectorLayer) return;
        const originalStyle = this.vectorLayer.getStyle();

        const resolved =
          typeof originalStyle === 'function'
            ? originalStyle(feature, resolution)
            : originalStyle;

        const style = (Array.isArray(resolved)
          ? resolved[0]
          : resolved) as Style;

        style?.setStroke(
          new Stroke({
            color: 'yellow',
            width: 2,
          })
        );

        return style ?? [];
      }
    });
    map.addInteraction(selectClick);
  }

  async getFeatures(params: GetFeaturesParams): Promise<PolygonData[]> {
    return new Promise((resolve) => {
      const message: WorkerRequest = {
        type: "get-features",
        payload: params
      };
      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data.result);
      }
      console.log("Posting massage")
      this.worker.postMessage(message);
    })
  }

  buildFeaturesInChunks(
    data: PolygonData[],
    source: VectorSource,
    chunkSize = 1000
  ): Promise<void> {
    return new Promise((resolve) => {

      let index = 0;

      const processChunk = () => {
        this.onPercentUpdate(index / data.length * 100)
        const end = Math.min(index + chunkSize, data.length);
        const chunkFeatures: Feature[] = [];

        for (; index < end; index++) {
          const polygon = data[index];

          const square = new Polygon([polygon.poligonCoordinate]);

          const feature = new Feature({
            geometry: square,
            info: polygon.pNum
          });

          feature.set("color", polygon.color);
          chunkFeatures.push(feature);
        }

        source.addFeatures(chunkFeatures);

        if (index < data.length) {
          requestAnimationFrame(processChunk);
        } else {
          resolve();
        }
      };

      processChunk();
    });
  }
  async loadMapData(agemin: number, agemax: number, gender: string, transparence: number) {
    if (isNaN(agemin)) throw ("agemin NaN")
    if (isNaN(agemax)) throw ("agemax NaN")

    let lowerColLimit = Math.trunc(agemin / 5)
    let upperColLimit = Math.trunc(agemax / 5)

    let polygonData = await this.getFeatures({ lowerColLimit, upperColLimit, gender, transparence })


    const startTime = performance.now()
    // let vectorSource: VectorSource = new VectorSource()
    // await this.buildFeaturesInChunks(polygonData, vectorSource)
    let vectorSource = new VectorSource({
      strategy: bboxStrategy,
      loader: async (extent) => {
        // TODO:
        const visiblePolygons = polygonData.filter(polygon => {
          return intersects(extent, polygon.extent);
        });
        const remainingPoligon = polygonData.filter(polygon => {
          return !intersects(extent, polygon.extent);
        });
        polygonData = remainingPoligon

        const features = visiblePolygons.map(polygon => {
          const square = new Polygon([polygon.poligonCoordinate]);

          const feature = new Feature({
            geometry: square,
            info: polygon.pNum
          });

          feature.set("color", polygon.color);

          return feature;
        });

        vectorSource.addFeatures(features);
      }
    })

    const endTime = performance.now()
    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)



    if (this.vectorLayer)
      this.map.removeLayer(this.vectorLayer)
    this.vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        let color = feature.get("color");
        
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