import TileLayer from 'ol/layer/Tile';
import OLOSM from 'ol/source/OSM';
import View from 'ol/View';
import { Projection } from 'ol/proj';
import OLMap from 'ol/Map';


export default class OpenLayersUtils {
    static initAndRegisterMap(targetId: string, centerX: number, centerY: number, projection: Projection | null) {
        const osmLayer = new TileLayer({
            source: new OLOSM({
                attributions: `&copy;<a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy;<a target="_blank" href="https://www.bfs.admin.ch/bfs/en/home.html">Federal Statistical Office</a>`
            })
        })
        return new OLMap({
            target: targetId,
            layers: [osmLayer],
            view: new View({
                projection: projection!,
                center: [centerX, centerY],
                zoom: 13,
                minZoom: 12
            }),

        });
    }
}
