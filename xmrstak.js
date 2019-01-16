//@name Xmr-Stak-Ext
//@key xmrStakExt
//@version 1.0
// var response = {
//     "version":"xmr-stak/2.5.2/752fd1e/master/lin/amd-cpu/20",
//     "hashrate":{
//         "threads":[
//                    [
//                     181.5,
//                     181.6,
//                     181.5
//                     ],
//                    [
//                     13.4,
//                     13.4,
//                     13.4
//                     ],
//                    [
//                     13.1,
//                     13.1,
//                     13.1
//                     ]
//                    ],
//         "total":[
//                  208.1,
//                  208.3,
//                  208.1
//                  ],
//         "highest":208.7
//     },
//     "results":{
//         "diff_current":120001,
//         "shares_good":7,
//         "shares_total":7,
//         "avg_time":362.0,
//         "hashes_total":840007,
//         "best":[
//                 7698113,
//                 928345,
//                 918945,
//                 276921,
//                 264650,
//                 175973,
//                 171464,
//                 0,
//                 0,
//                 0
//                 ],
//         "error_log":[
        
//         ]
//     },
//     "connection":{
//         "pool":"xmr-eu1.nanopool.org:14444",
//         "uptime":2534,
//         "ping":69,
//         "error_log":[
        
//         ]
//     }
// }

var characteristics = {
    supportsOnOff : false,
    supportsTemperature : false,
    supportsFanSpeed : false,
    fanSpeedUnit : "",
    unit : "H/S",
    decimals : 0    
}

var fields = []

function initContext(context, options) {


    console.log("address " + context.address.host + " " + context.address.port)
    context.minerUrl = "http://" + context.address.host + ":" + context.address.port + "/api.json"

}

function parseXmrResponse(response) {
    var videocards = response.hashrate.threads.map(function(x) {
        return {
            hashRate : x.length > 0 ? x[0] : 0,
            temperature : -1,
            fanSpeed : -1
        }
    })
    var totalHashrate = 0
    if (response.hashrate.total.length > 0) {
        totalHashrate = response.hashrate.total[0]
    }
    var response = {
        version : response.version,
        runningTime : Math.trunc(response.connection.uptime / 60),
        totalHashrate : totalHashrate,
        totalShares : response.results.shares_good,
        videocards : videocards
    }

    return response
}

function getCurrentStatus(context) {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
       if(xhttp.status != 200) {
           context.currentStatusCallback(null, "Wrong status code " + xhttp.status + "!")
           return
       }
       try {
           var json = JSON.parse(xhttp.responseText)
           var xmrResponse = parseXmrResponse(json)
           context.currentStatusCallback(xmrResponse, null)
       } catch (e) {
           context.currentStatusCallback(null, e.message)
       }
    }
    xhttp.onerror = function(errorText) {
        context.currentStatusCallback(null, errorText)
    }
    xhttp.open("GET", context.minerUrl, true)
    xhttp.send()


}
function turnOnOffGpu(context) {
    context.onOffCallback("No error!")
}
