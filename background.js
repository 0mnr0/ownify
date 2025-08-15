let __SettingsLoader__;
let __disableProxy__;
let __LaunchNeededProxy__;
let WhiteList = [];
let ExtensionList = [];
let conflictList = [];

(async () => {
let lastUrl = '';
let isFilteredProxy;
let isProxyActive;
let PROXY_CONFIG = {
    host: "",
    port: 0,
    scheme: "http",
    username: "",
    password: ""
};
let HideUserAgent = false;

async function SettingsLoader(){
	isFilteredProxy = (await chrome.storage.local.get('type')).type; if (isFilteredProxy) {isFilteredProxy = (isFilteredProxy==="whitelist")} else {isFilteredProxy = false;}
	isProxyActive = await chrome.storage.local.get('enabled').enabled;
	PROXY_CONFIG = (await chrome.storage.local.get('ServerData')).ServerData;
	WhiteList = (await chrome.storage.local.get('WhiteListed')).WhiteListed; if (WhiteList === undefined) {WhiteList = [];}
	HideUserAgent = await GetSettingBool('CHROMOMIZE');
}
__SettingsLoader__ = async () => { await SettingsLoader() };
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
	chrome.action.setBadgeText({ text: 'OFF' });
	chrome.action.setTitle({ title: '' });
    await chrome.proxy.settings.set({
        value: { mode: "system" },
        scope: "regular"
    });
    isProxyActive = false;
}
__disableProxy__ = async() => { await disableProxy() };

async function GetSettingBool(name) {
	name = "SETTING:"+name;
	let ret = (await chrome.storage.local.get(name))[name]
	return ret === true;
}


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	console.log('inMessage:',msg);
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
	
	if (msg.action === "requestConflicts") {
		(async() => {
			GetExtensions();
		})();
	}
	
	if (msg.action === "removeConflicts") {
		(async() => { 
			RemoveConflicts();
			GetExtensions();
			sendResponse({value: 'ok'})
		})();
		
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
			sendResponse({'status': 'ok'})
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
		chrome.runtime.sendMessage({ 'getUrl': lastUrl });
		return false;
	}
	if (msg.action === "reloadSite") {
		(async () => {
			await __SettingsLoader__();
			if (await GetBool('enabled')) {
				await __disableProxy__();
				await __LaunchNeededProxy__();
				chrome.tabs.reload(msg.tabId, { bypassCache: true }, () => {
					if (chrome.runtime.lastError) {
						console.error("Не удалось перезагрузить вкладку:", chrome.runtime.lastError.message);
					} else {
						console.log(`Вкладка ${msg.tabId} (${msg.url}) была перезагружена.`);
					}
				});
			}
		})();
		
		return false;
	}
	return true;

});



async function LaunchNeededProxy(){
	chrome.action.setBadgeText({ text: isFilteredProxy ? 'WH' : 'ON' });
	chrome.action.setTitle({ title: isFilteredProxy ? 'Режим "WhiteList"' : 'Режим "ON"' });
	chrome.action.setBadgeBackgroundColor({ color: '#00000000' });
	if (isFilteredProxy) {
		await enableFilteredProxy()
	} else { 
		await enableProxy()
	}
}
__LaunchNeededProxy__ = async() => { await LaunchNeededProxy(); }

async function RethinkInAppRules(){
	chrome.privacy.network.webRTCIPHandlingPolicy.set({
		 value: await GetBool('FixWEBRTC') ? "disable_non_proxied_udp" : "default"
	});
	HideUserAgent = await GetSettingBool('CHROMOMIZE');
	applyRules(HideUserAgent);
}

async function RefreshInAppWhiteList(){
	if (await GetBool('WhiteList:FromGitHub')) {
		fetcher("https://raw.githubusercontent.com/0mnr0/ownify/refs/heads/main/whitelist.json", 'GET', null).then(async (res) => {
			let NewList = (await chrome.storage.local.get('WhiteListed')).WhiteListed;
			if (typeof NewList !== 'object') {NewList = []}
			NewList = [...new Set([...NewList, ...res.values])]
			WhiteList = NewList;
			await chrome.storage.local.set({ WhiteListed: NewList });
			await SettingsLoader();
			if (await GetBool('enabled')) {
				await disableProxy();
				await LaunchNeededProxy();
			}
			
		});
	}
}

setInterval(RefreshInAppWhiteList, 1000 * 60);
RefreshInAppWhiteList();

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
	  { "header": "Accept-Language", "operation": "set", "value": "ru,en-US,en;q=0.9" }
    ]
  },
  "condition": {
    "urlFilter": "*",
    "resourceTypes": ["main_frame"]
  }
}



function applyRules(enabled) {
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

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
		lastUrl = tab.url;
  });
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



function fetcher(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (data && method.toUpperCase() !== 'GET') {
        options.body = JSON.stringify(data);
    }

    return fetch(url, options)
        .then(async(response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
			let text = await response.text();
			if (!isJson(text)) {
				return text;
			} else {
				return JSON.parse(text);
			}
        });
}


// background.js
async function openAndSend(data) {
	if ((await chrome.storage.local.get('ServerData')).ServerData && await GetBool('StuckDetector')) {
		chrome.action.openPopup(() => {
			if (chrome.runtime.lastError) {
				console.error(chrome.runtime.lastError);
				return;
			}
			chrome.runtime.sendMessage({ 'stuckData': data });
		});
	}
}



const pendingLoads = {}; // { tabId: { timer, startTime } }
const waitingTime = 3;
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId !== 0) return;

    const tabId = details.tabId;

    // Сброс предыдущего таймера (на всякий случай)
    if (pendingLoads[tabId]?.timer) {
        clearTimeout(pendingLoads[tabId].timer);
    }

    const startTime = Date.now();

    // Устанавливаем таймер
    const timer = setTimeout(() => {
        console.log(`Страница в табе ${tabId} грузится больше ${waitingTime} секунд — возможно, зависла.`);

		chrome.tabs.get(tabId, (tab) => {
			if (tab.url.indexOf("https://") < 0) {return;}
			if (chrome.runtime.lastError) {
				console.warn("Не удалось получить таб:", chrome.runtime.lastError.message);
				return;
			}

			const url = getCleanDomain(tab.url);
			if (url === null) {return;}
			if (tab.url.indexOf('t.me/') >= 0) {url="t.me";}
			
			
			console.log(`URL для таба ${tabId}: ${url} | ${tab.url}`);
			
			
			
			
			fetcher('https://www.google.com/', 'GET', null).then(res => {
				(async() => {
					if (!await GetBool('StuckDetector')) {
						return;
					}
					const WH = (await chrome.storage.local.get('WhiteListed')).WhiteListed;
					if (WH && WH.indexOf(url) < 0) {
						openAndSend({tabId: tabId, url: tab.url});
					}
				})();
			}).catch(err => {
				console.warn(err);
				console.warn('failed to ping google.com');
			})
		});

		
		
    }, waitingTime*1000);

    pendingLoads[tabId] = { timer, startTime };
});

chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId !== 0) return;

    const tabId = details.tabId;
    if (pendingLoads[tabId]) {
        clearTimeout(pendingLoads[tabId].timer);
        delete pendingLoads[tabId];
        console.log(`Страница в табе ${tabId} начала загружаться успешно (committed).`);
    }
});

function getCleanDomain(url) {
  try {
	  let checkUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
	  
      let parsed = new URL(checkUrl);
      return parsed.hostname.replace(/^www\./, '').replaceAll("/","");
  } catch (e) {
      return null;
  }
}


async function GetBool(name) {
	name = name;
	let ret = (await chrome.storage.local.get(name))[name]
	return ret === true;
}

function isJson(obj) {
    try { JSON.parse(obj); return true; } catch(e) {return false}
}



function RemoveConflicts() { 
	ExtensionList.forEach((ext) => {
		if (
		  ext.enabled &&
		  ext.permissions?.includes("proxy") &&
		  ext.id !== chrome.runtime.id
		) {
		  console.log(`Отключаю конфликтующее расширение: ${ext.name}`);

		  chrome.management.setEnabled(ext.id, false, () => {
			if (chrome.runtime.lastError) {
			  console.warn(`Не удалось отключить ${ext.name}:`, chrome.runtime.lastError.message);
			} else {
			  console.log(`${ext.name} успешно отключено`);
			}
		  });
		}
	  });
}

function GetExtensions() {
	ExtensionList = [];
	conflictList = [];
	chrome.management.getAll((extensions) => {
	  extensions.forEach((ext) => {
		  ExtensionList.push(ext);
		  if (ext.enabled && ext.permissions?.includes("proxy") && ext.id !== chrome.runtime.id) {
			  conflictList.push(ext.name);
		  }
	  });
	  if (conflictList.length >= 1) {
		    chrome.runtime.sendMessage({ 'conflictChecker': true, 'foundedConflict': true, 'value': conflictList });
	  } else {
			chrome.runtime.sendMessage({ 'conflictChecker': true, 'foundedConflict': false });
	  }
	  
	});	
}

setInterval(GetExtensions, 5000);
GetExtensions();