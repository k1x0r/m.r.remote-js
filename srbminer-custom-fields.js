//@name Srb Miner-Ext
//@key srbMinerkExt
//@version 1.0
// var response = {
//     "rig_name": "rig",
//     "cryptonight_type": "normalv8",
//     "miner_version": "1.6.9",
//     "driver_version": "24.20.13019.1008",
//     "mining_time": 54,
//     "total_devices": 1,
//     "total_threads": 2,
//     "hashrate_total_now": 570,
//     "hashrate_total_1min": 0,
//     "hashrate_total_5min": 0,
//     "hashrate_total_30min": 0,
//     "hashrate_total_max": 573,
//     "pool": {
//         "pool": "xmr-eu1.nanopool.org:14444",
//         "difficulty": 120001,
//         "time_connected": "2018-10-28 21:24:33",
//         "uptime": 54,
//         "latency": 0,
//         "last_job_received": 49
//     },
//     "shares": {
//         "total": 0,
//         "accepted": 0,
//         "accepted_stale": 0,
//         "rejected": 0,
//         "avg_find_time": 0
//     },
//     "devices": [
//         {
//             "device": "GPU0",
//             "device_id": 0,
//             "model": "Radeon RX 580 Series",
//             "bus_id": 1,
//             "kernel_id": 1,
//             "hashrate": 570,
//             "core_clock": 1216,
//             "memory_clock": 2000,
//             "temperature": 63,
//             "fan_speed_rpm": 2435
//         }
//     ]
// }

var characteristics = {
    supportsOnOff : false,
    supportsTemperature : true,
    supportsFanSpeed : false,
    fanSpeedUnit : "",
    unit : "H/S",
    decimals : 0
}

var fields = [{
  type : "textInput",
  item : { 
    key : "password",
    isSecure : true,
    localizedPlaceholder : "Password",
    defaultValue : "blah"
  }
},
{
  type : "switch",
  item : { 
    key : "onOff",
    title : "On or Off smth",
    defaultValue : false
  }
},
{
  type : "choice",
  item : { 
    key : "onOff",
    title : "On or Off smth",
    options : [ "First", "Second", "Third" ],
    defaultValue : 0
  }
}
]

function initContext(context, options) {
    console.log("address " + context.address.host + " " + context.address.host)
    context.minerUrl = "http://" + context.address.host + ":" + context.address.port + "/"
    
}

function parseSrbResponse(response) {
    var videocards = response.devices.map(function(x) {
        return {
            hashRate : x.hashrate,
            temperature : x.temperature,
            fanSpeed : x.fan_speed_rpm
        }
    })

    return {
        "version" : response.miner_version,
        "runningTime" : Math.trunc(response.mining_time / 60),
        "totalHashrate" : response.hashrate_total_now,
        "totalShares" : response.shares.total,
        "videoCards" : videocards
    }
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
           var srbResponse = parseSrbResponse(json)
           context.currentStatusCallback(srbResponse, null)
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
    context.onOffCallback("Not supported!")
}
