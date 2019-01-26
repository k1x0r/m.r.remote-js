
## M.R.Remote / Mining Rig Remote / Mister Remote
### Create custom mining protocol written in JavaScript for M.R.Remote iOS application

![Alt text](Icon.png "")


### What is M.R.Remote

M.R.Remote is an iOS application which allows to monitor and control mining software, asics and mining clouds, or we use "endpoint" as a generalization term.

Our app tends to cover as many endpoint protocols as possible with the support of the community. Right now there're implemented following protocols:

- Claymore Ethereum
- Claymore XMR
- XMR Stak
- SRB Miner 

We tend to cover every endpoint protocol that is the most popular and common. There're so many different software, hardware and clouds, so we need to determine what to implement first depend on your feedback. And if you have some developer skills, you're able to implement it yourself by writing a simple JavaScript parser! 

Right now only endpoints which work by HTTP/HTTPs are supported. To do this you need to create a JavaScript like in the example and read the description below. 

And a single JS file should be in the end. If the project has become very complicated it's recommended to use NodeJS 'bundler' to compile it to one file.

And if your endpoint protocol is different than HTTP/HTTPs, we can work out the way to add support for your mining software/hardware.

- make changes to the core of the app
- implement the protocol natively in the app

And technically this application can be used in other areas, which could be useful for monitoring and controlling mining: smart switches, temperature sensors, voltage sensors, etc...

### Table of Contents  
   * [M.R.Remote / Mining Rig Remote / Mister Remote](#mrremote--mining-rig-remote--mister-remote)
     * [What is M.R.Remote](#what-is-mrremote)
     * [Installing a new plugin:](#installing-a-new-plugin)
     * [Getting started:](#getting-started)
     * [What IDE is needed?](#what-ide-is-needed)
     * [What are the changes in comparison to standard JS/JSCore](#what-are-the-changes-in-comparison-to-standard-jsjscore)
     * [Looking into logs / errors in M.R.Remote within the app](#looking-into-logs--errors-in-mrremote-within-the-app)
     * [First steps](#first-steps)
     * [Must-be implemented functions](#must-be-implemented-functions)


### Installing a new plugin:

There're a few ways possible to install a mining plugin:
- Through App
  - Go to: Settings -> Add Miner -> "Miner: ..." -> Add JavaScript based protocol
  - Paste url of JS file into
- Via iTunes. Copy your file to M.R.Remote via iTunes and select it through "Local file" dialog which is located in previous figure.w
- Use our share extension and share URL from any application 

### Getting started:

Before you start you need to be familiar with JavaScript debugging in web browser.

### What IDE is needed?

Only text editor and web browser. Preferably Safari for Mac, because it's implemented on the same engine as JavaScriptCore on iOS. But Google Chrome or FireFox also should do it.

You probably need to disable CORS, but only for the development of plugin. It's a critical vulnerability for web browser usage, so it's recommended to use only for development of plugin.

https://www.thepolyglotdeveloper.com/2014/08/bypass-cors-errors-testing-apis-locally/
 
When everything is set up you can open "unittest.html" and start developing the new plugin.

### What are the changes in comparison to standard JS/JSCore

"XMLHttpRequest". Since JavaScriptCore doesn't have a standard XMLHttpRequest a custom one was used. If you're interested you could take a look at source code.  https://github.com/Lukas-Stuehrk/XMLHTTPRequest

"console.log" (levels log, debug, error, info, warn) works within M.R.Remote app. This should make simpler for third-party developers to develop custom miner support.

"window" is still a global object. This was done for compatibility with with web-browser.

### Looking into logs / errors in M.R.Remote within the app

A great guide is written here:
https://www.hexnode.com/mobile-device-management/help/obtain-ios-device-logs-using-mac-and-windows/

All you need is to filter logs by M.R.Remote tag 

### First steps
The first thing which is needed is header in format `//@key value` By this header M.R.Remote identifies the mining protocol.  
```
//@name Srb Miner
//@key srbMinerkExt
//@version 1.0
```
The required values are:

| Name | Description |
| --------- | ----- |
| name | Name of the miner which is will be displayed in M.R.Remote |
| key | Unique key by which mining protocol is identified by M.R.Remote |
| version | Version of the miner. |

Then you need to define characteristics for your protocol:
```javascript
var characteristics = {
    supportsOnOff : false,    
    supportsTemperature : false,
    supportsFanSpeed : false,
    fanSpeedUnit : "",
    unit : "H/S",
    decimals : 0   
} 
```
There parameters must be the type as in the table. Before running this extension in M.R.Remote it's better to run unit test to check if all the requirements are satisfied.

| Name | Type | Description |
| --- | --- | --- |
| supportsOnOff | Bool | Is it possible to turn on/off a video card through API |
| supportsTemperature | Bool | Will your implementation provide temperature |
| supportsFanSpeed | Bool | Will your implementation provide fan speed |
| fanSpeedUnit | String | Fan speed unit. "RPM" or "%" |
| unit | String | Unit of of miner. "H/S", "MH/S", "GH/s", "Sol/s" |
| decimals | Int | Number of decimals that should be shown after coma. For  hashrate "1.12345678": 1 means "1.1", 2 - "1.12", 3 - "1.123" etc... |

Although Javascript is dynamically-typed language, it's important that the type of the parameter must be the same as in description in the end.
 
The second important parameter is additional options of the miner. They are intended to be configured fully dynamically for the needs of a specific miner. They can be of three types: Text Input `textInput`, Switch `switch`, Choice Switch `choice`. They're defined by providing an object with `type` and `item` fields. An example with each type is shown below:

```javascript
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
  type : "bool",
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
```
Important highlights:
The main field of the item is "key". It's the key by which value will be retrieved in "initContext" method. An example is in that section. This field is the same for all the types.

It's possible to localize all the strings. The locale should be retrieved from "window.currentLocale" (only in M.R.Remote app). It's IETF language tag (https://en.wikipedia.org/wiki/IETF_language_tag). It's up to the developer of the plugin whether he decides to localize or not his plugin and what tools to use.

The default value type is based on a type of field. So it's Bool for Switch, String for Text Input, Int for Choice.

TextInput: 

| Name | Type | Description |
| --- | --- | --- |
| key | String | Key by which value is retrieved from "initContext" method  |
| isSecure | Bool | Is text entry secure |
| localizedPlaceholder | String | A placeholder which is shown to user in "Add Miner" dialog. Should be localized |
| defaultValue | String | Default value with which the field will be filled in "Add Miner" dialog |

Switch

| Name | Type | Description |
| --- | --- | --- |
| key | String | Key by which value is retrieved from "initContext" method  |
| localizedPlaceholder | String | A placeholder which is shown to user in "Add Miner" dialog. Should be localized |
| defaultValue | Bool | Default value to which the switch will be set in "Add Miner" dialog |

Choice

| Name | Type | Description |
| --- | --- | --- |
| key | String | Key by which value is retrieved from "initContext" method  |
| title | String | A title which is shown to user in "Add Miner" dialog. Should be localized the same as "localizedPlaceholder" |
| options | Array of Strings | All the options. Should be localized. |
| defaultValue | Int | Index of 'options' array to which the switch will be set in "Add Miner" dialog |


### Must-be implemented functions

Key Concept:
Context defines client context. In it, all the variables concerning the client should be stored and operated.

Method 'initContext' is meant for initialization of the new client context. In it, all client-related variables should be placed in context. The second parameter is options which provide values of additional options.

```javascript
function initContext(context, options) {
    console.log("address " + context.address.host + " " + context.address.port)
    minerUrl = "http://" + context.address.host + ":" + context.address.port + "/api.json"
}
```

Context has the following parameters

| Name | Type | Description | 
| --- | --- | --- |
| address | "JavaScript Object <br/> { <br/> host : String <br/> port : Int <br/> } | Address of the miner |
| currentStatusCallback | JavaScript function. <br/>(status: MiningStatus?, error: String?) -> () | Either status or error must be not null. If successful response is received then MiningStatus object should be provided, otherwise error description needs to be provided. |
| onOffCallback | JavaScript function. (error: String?) -> () | Callback for turnOnOffGpu method. If an error has occurred then error description should be provided otherwise should be null. |


Method 'getCurrentStatus' is intended to make an HTTP request to get current status from the server. When the response is received it should be converted to M.R.Remote format and then the callback should be called either with successfully parsed response or with an error.

 context.currentStatusCallback(xmrResponse, null)   

```javascript
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
    xhttp.open("GET", minerUrl, true)
    xhttp.send()
}

After a successful response it should return a successful "MiningStatus" object with following structure

| Name | Type | Description |
| --- | --- | --- |
| version | String | Version of mining software/hardware |
| runningTime | Int | Running time of miner in minutes |
| totalHashrate | Double | Total hashrate of target rig. The value will be displayed in main screen of the app. |
| totalShares | Int | Total number of shares of your rig |
| videocards | Array of [Videocard] | Array of videocards / mining units hashrates |

Videocard

| Name | Type | Description |
| --- | --- | --- |
| hashrate | Double | Hashrate of videocard / mining unit. The value will be displayed in main screen of the app. |
| temperature | Int | Temperature of video card. Must be provided in °C. |
| totalHashrate | Int | Fan speed of video card. The value will be displayed in main screen of the app. |

```
An example of parsing the response from XMR Stack is shown below. It's put to a separate method in order to show the logic more clearly.

```javascript
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
        videoCards : videocards
    }

    return response
}
```

Method 'turnOnOffGpu' is intended to make an HTTP request to turn on or off GPU. If the request is successful, the callback should be called with 'null'. In the other case string with an error, a description should be provided to the callback.

```javascript
function turnOnOffGpu(context) {
    context.onOffCallback("No error!")
} 
```
