(async () => {
let isFilteredProxy;
let isProxyActive;
let PROXY_CONFIG = {
    host: "",
    port: 0,
    scheme: "http",
    username: "",
    password: ""
};
let WhiteList = [];
let HideUserAgent = false;

async function SettingsLoader(){
	isFilteredProxy = (await chrome.storage.local.get('type')).type; if (isFilteredProxy) {isFilteredProxy = (isFilteredProxy==="whitelist")} else {isFilteredProxy = false;}
	isProxyActive = await chrome.storage.local.get('enabled').enabled;
	PROXY_CONFIG = (await chrome.storage.local.get('ServerData')).ServerData;
	WhiteList = (await chrome.storage.local.get('WhiteListed')).WhiteListed; if (WhiteList === undefined) {WhiteList = [];}
	HideUserAgent = await GetBool('CHROMOMIZE');
}
await SettingsLoader();





function Generator() {
	return WhiteList.map(domain => `dnsDomainIs(host, "${domain}") || shExpMatch(host, "*.${domain}")`).join(" || ");
}


chrome.webRequest.onAuthRequired.addListener(
    (details, callbackFn) => {
        return {
            authCredentials: {
                username: PROXY_CONFIG.username,
                password: PROXY_CONFIG.password
            }
        };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);


async function enableProxy() {
    await chrome.proxy.settings.set({
        value: {
            mode: "fixed_servers",
            rules: {
                singleProxy: {
                    scheme: PROXY_CONFIG.scheme,
                    host: PROXY_CONFIG.host,
                    port: PROXY_CONFIG.port,
                }
            }
        },
        scope: "regular"
    });
    isProxyActive = true;
}



async function enableFilteredProxy() {
    await chrome.proxy.settings.set({
        value: {
            mode: "pac_script",
            pacScript: {
                data: `
                    function FindProxyForURL(url, host) {
                        if (${Generator()}) {
                            return "PROXY ${PROXY_CONFIG.host}:${PROXY_CONFIG.port}";
                        }
                        return "DIRECT";
                    }
                `
            }
        },
        scope: "regular"
    });
    isProxyActive = true;
}


// Выключение
async function disableProxy() {
    await chrome.proxy.settings.set({
        value: { mode: "system" },
        scope: "regular"
    });
    isProxyActive = false;
}

async function GetBool(name) {
	name = "SETTING:"+name;
	let ret = (await chrome.storage.local.get(name))[name]
	return ret === true;
}


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "toggleProxy") {
		(async() => {
			await msg.enabled ? LaunchNeededProxy() : disableProxy();
			sendResponse({enabled: msg.enabled});
		})();
        return true;
    }
	
	if (msg.action === "reloadSettings") {
		(async() => { await SettingsLoader(); })()
	}
	
	if (msg.action === "reloadInAppSettings") {
		(async() => { 
			await SettingsLoader();
			RethinkInAppRules();
		})()
	}
	
	if (msg.action === "reloadSettings:withVpnReload") {
		(async() => {
			await SettingsLoader();
			disableProxy();
			await LaunchNeededProxy();
		})()
	}
	if (msg.action === "switchConnections") {
		(async() => {
			await SettingsLoader();
			disableProxy();
			await LaunchNeededProxy();
		})()
	}
	if (msg.action === "getUrl") {
		(async() => {
			await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				sendResponse({ url: tabs[0]?.url });
			});
		})()
	}
	return true;

});



async function LaunchNeededProxy(){
	if (isFilteredProxy) {
		await enableFilteredProxy()
	} else { 
		await enableProxy()
	}
}

async function RethinkInAppRules(){
	chrome.privacy.network.webRTCIPHandlingPolicy.set({
		 value: await GetBool('FixWEBRTC') ? "disable_non_proxied_udp" : "default"
	});
	HideUserAgent = await GetBool('CHROMOMIZE');
	console.log('new value for HideUserAgent:', HideUserAgent);
	applyRules(HideUserAgent);
	
}

chrome.runtime.onInstalled.addListener(() => {
	(async () => {
		await disableProxy();
		await chrome.storage.local.set({ enabled: false });
	})();
});

chrome.runtime.onStartup.addListener(() => {
	(async () => {
		await disableProxy();
		await chrome.storage.local.set({ enabled: false });
		let { loadedFilteredProxy } = await chrome.storage.local.get('type');
		isFilteredProxy = loadedFilteredProxy;
	})();
});

chrome.windows.onRemoved.addListener(function(windowId){
  console.log("!! Exiting the Browser !!");
});



chrome.runtime.onSuspend.addListener(() => {
	chrome.storage.local.set({ enabled: false })
	disableProxy();
})


function extractDomain(url) {
  try {
    let domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch (e) {
    return ''; // если строка невалидна как URL
  }
}


function isSiteWasOpenedWithProxy(url){
	if (!isProxyActive) {return false;}
	if (typeof url === "undefined" || url.indexOf("chrome-extension://") >= 0) {return -1;}
	if (!isFilteredProxy) {return true;}
	
	for (let i = 0; i < WhiteList.length; i++) {
		if (extractDomain(url) === WhiteList[i]) {
			return true;
		}
	}
	return false
}


const HEADERS_RULE = {
  "id": 100,
  "priority": 3,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      { "header": "User-Agent", "operation": "set", "value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36" },
	  { "header": "Accept-Language", "operation": "set", "value": "en-US,en;q=0.9" }
    ]
  },
  "condition": {
    "urlFilter": "*",
    "resourceTypes": ["main_frame"]
  }
}



function applyRules(enabled) {
	console.log('enabled? :', enabled);
  if (enabled) {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [100],
      addRules: [HEADERS_RULE]
    });
  } else {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [100]
    });
  }
}

chrome.runtime.onSuspend.addListener(async() => {
	await chrome.storage.local.set({ enabled: false });
	disableProxy();
});



chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
	let BigDetector = isSiteWasOpenedWithProxy(details.initiator); if (BigDetector === -1) {return;}
	details.vpnfied = BigDetector; // "https://www.speedtest.net"
    chrome.runtime.sendMessage({ type: "network-request", details });
  },
  { urls: ["<all_urls>"] }
);

})();

