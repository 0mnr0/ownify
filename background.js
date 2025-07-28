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

async function SettingsLoader(){
	isFilteredProxy = (await chrome.storage.local.get('type')).type; if (isFilteredProxy) {isFilteredProxy = (isFilteredProxy==="whitelist")} else {isFilteredProxy = false;}
	isProxyActive = await chrome.storage.local.get('enabled').enabled;
	PROXY_CONFIG = (await chrome.storage.local.get('ServerData')).ServerData;
	WhiteList = (await chrome.storage.local.get('WhiteListed')).WhiteListed; if (WhiteList === undefined) {WhiteList = [];}
}
await SettingsLoader();





function Generator() {
	return WhiteList.map(domain => `dnsDomainIs(host, "${domain}") || shExpMatch(host, "*.${domain}")`).join(" || ");
}


chrome.webRequest.onAuthRequired.addListener(
    (details, callbackFn) => {
        if (!isProxyActive) return;
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

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.action === "toggleProxy") {
        return msg.enabled ? LaunchNeededProxy() : disableProxy();
    }
	
	if (msg.action === "reloadSettings") {
		await SettingsLoader();
	}
	if (msg.action === "reloadSettings:withVpnReload") {
		await SettingsLoader();
		disableProxy();
		await LaunchNeededProxy();
	}
	if (msg.action === "switchConnections") {
		await SettingsLoader();
		disableProxy();
		await LaunchNeededProxy();
	}
	if (msg.action === "getUrl") {
		await chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            await chrome.runtime.sendMessage({ url: tabs[0]?.url });
        });
        return true;
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


chrome.runtime.onStartup.addListener(async () => {
    const { enabled } = await chrome.storage.local.get("enabled");
    let { loadedFilteredProxy } = await chrome.storage.local.get('type');
	isFilteredProxy = loadedFilteredProxy;
    if (enabled) await LaunchNeededProxy();
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

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
	let BigDetector = isSiteWasOpenedWithProxy(details.initiator); if (BigDetector === -1) {return;}
	details.vpnfied = BigDetector; // "https://www.speedtest.net"
    chrome.runtime.sendMessage({ type: "network-request", details });
  },
  { urls: ["<all_urls>"] }
);

})();

