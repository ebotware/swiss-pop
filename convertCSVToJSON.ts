import Papa from 'papaparse';
import * as fs from 'fs';

const LV95 = "EPSG:2056";
const WGS84 = "EPSG:4326";



function main() {
    console.log("Convert")
    const fileContent = fs.readFileSync('./data/STATPOP2024.csv', 'utf8');

    var parseResult = Papa.parse(fileContent, { delimiter: "," })
    console.log(parseResult.data.length)
    var row = parseResult.data.at(0);
    if (!Array.isArray(row)) return;
    var xCol = row.findIndex((e) => e === "E_KOORD")
    var yCol = row.findIndex((e) => e === "N_KOORD")
    var totCol = row.findIndex((e) => e === "BBTOT")
    var bm01 = row.findIndex((e) => e === "BBM01") // Males 0-4
    var bm02 = row.findIndex((e) => e === "BBM02") // Males 5-9
    var bm03 = row.findIndex((e) => e === "BBM03") // Males 10-14
    var bm04 = row.findIndex((e) => e === "BBM04") // Males 15-19
    var bm05 = row.findIndex((e) => e === "BBM05") // Males 20-24
    var bm06 = row.findIndex((e) => e === "BBM06") // Males 20-24
    var bm07 = row.findIndex((e) => e === "BBM07") // Males 20-24
    var bm08 = row.findIndex((e) => e === "BBM08")
    var bm09 = row.findIndex((e) => e === "BBM09")
    var bm10 = row.findIndex((e) => e === "BBM10")
    var bm11 = row.findIndex((e) => e === "BBM11")
    var bm12 = row.findIndex((e) => e === "BBM12")
    var bm13 = row.findIndex((e) => e === "BBM13")
    var bm14 = row.findIndex((e) => e === "BBM14")
    var bm15 = row.findIndex((e) => e === "BBM15")
    var bm16 = row.findIndex((e) => e === "BBM16")
    var bm17 = row.findIndex((e) => e === "BBM17")
    var bm18 = row.findIndex((e) => e === "BBM18")

    var bw01 = row.findIndex((e) => e === "BBW01") // Males 0-4
    var bw02 = row.findIndex((e) => e === "BBW02") // Males 5-9
    var bw03 = row.findIndex((e) => e === "BBW03") // Males 10-14
    var bw04 = row.findIndex((e) => e === "BBW04") // Males 15-19
    var bw05 = row.findIndex((e) => e === "BBW05") // Males 20-24
    var bw06 = row.findIndex((e) => e === "BBW06") // Males 20-24
    var bw07 = row.findIndex((e) => e === "BBW07") // Males 20-24
    var bw08 = row.findIndex((e) => e === "BBW08")
    var bw09 = row.findIndex((e) => e === "BBW09")
    var bw10 = row.findIndex((e) => e === "BBW10")
    var bw11 = row.findIndex((e) => e === "BBW11")
    var bw12 = row.findIndex((e) => e === "BBW12")
    var bw13 = row.findIndex((e) => e === "BBW13")
    var bw14 = row.findIndex((e) => e === "BBW14")
    var bw15 = row.findIndex((e) => e === "BBW15")
    var bw16 = row.findIndex((e) => e === "BBW16")
    var bw17 = row.findIndex((e) => e === "BBW17")
    var bw18 = row.findIndex((e) => e === "BBW18")
    var data = []
    for (let i = 1; i < parseResult.data.length; i++) {
        let row = parseResult.data[i];
        if (Array.isArray(row)) {
            let x = Number.parseInt(row[xCol], 10);
            let y = Number.parseInt(row[yCol], 10);
            if (isNaN(x) || isNaN(y)) {
                console.error("Nan: ", row[xCol], row[yCol])
                continue;
            }
            const coordinates = {lat:x, lng:y}
            let mVals = []
            let fVals = []
            // Assumiamo che BBM01, BBM02, siano in fila nelle colonne
            for(let i = 0;i<19;i++){
                mVals.push(row[bm01+i])
                fVals.push(row[bw01+i])
            }
            data.push({ lat: coordinates.lat, lng: coordinates.lng, m:mVals, f:fVals })
        }
    }
    fs.writeFileSync("./public/STATPOP2024.json", JSON.stringify(data))
}
main()