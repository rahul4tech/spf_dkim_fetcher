const args = process.argv
const csv = require('csvtojson')
const axios = require("axios")
const validator = require("validator")
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const results = [];
if (args.length !== 3) return console.log("Missing Webmin String File")
const fileName = args[2]
const filePath = "files/"

const finalResults = []

const csvWriter = createCsvWriter({
    path: 'outputs/results.csv',
    header: [
        {id: 'domain', title: 'Domain'},
        {id: 'spf', title: 'SPF'},
        {id: 'dkim', title: 'DKIM'}

    ]
});

const fetchData = async (url) => {
    if (url) {
        try {

            const data = await axios.get(url)
            const thisData = data.data.split("\n")
            const totalDataLengthIndex = thisData.length - 1
            let spfKey
            let dkimKeyInital
            let dkimArray = []
            // console.log(thisData)
            thisData.map((val, ind) => {
                if (validator.contains(val, "    Value: v=spf1")) {
                    spfKey = ind
                }
            })
            thisData.map((val, ind) => {
                if (validator.contains(val, "    Value: v=spf1")) {
                    spfKey = ind
                }
            })

            thisData.map((val, ind) => {
                if (validator.contains(val, "    Value: v=DKIM1")) {
                    dkimKeyInital = ind
                }
            })

            for (var i = dkimKeyInital; i < totalDataLengthIndex; i++) {
                // console.log(thisData[i]);
                if (thisData[i]) {
                    if (thisData[i] !== "Exit status: 0") {
                        dkimArray.push(thisData[i].replace("Value: ", "").trim())
                    }

                }
                // console.log(dkimArray)
            }

            // console.log(dkimArray)
            finalResults.push({
                domain: thisData[0].slice(0, -1).trim(),
                spf: thisData[spfKey].replace("Value: ", "").trim(),
                dkim: dkimArray.join(""),

            })

        } catch (error) {
            // console.log(error)
            // console.log("Error: "+ url.split("&")[1].split("=")[1] + " - Unable To Connect");
            finalResults.push({
                domain: url.split("&")[1].split("=")[1],
                spf: "Unable To Connect To Server",
                dkim: "Unable To Connect To Server"

            })
        }

    }

}


const getData = async (fileName) => {
    console.log("Running With "+ fileName)
    try {
        const extension = fileName.split(".")
        const finalExtension = extension[extension.length - 1]

        if (finalExtension !== "csv") {
            throw Error("Wrong File Type Provided")
        }

        const csvFilePath = filePath + fileName
        const dnsLookupArray = await csv().fromFile(csvFilePath);

        await Promise.all(dnsLookupArray.map(async (i) => {
            await fetchData(i.dns_lookup)
        }));

        await csvWriter.writeRecords(finalResults)
        return finalResults

    } catch (error) {
        console.log(error.message)

    }

}
// getData(fileName).then(results => console.log('results: ', results))
getData(fileName).then(results => console.log('Process Completed'))