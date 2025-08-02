let connectionType = undefined;
let lastVpnState = false;
let userAuthed = true;
let isEditorOpened = false;
let WhiteListSites = undefined;

let isSettingsOpened = false;
let CurrentTabUrl = '';
const SUBTITLE_TEXT = 'PROXIFY URSELF! - by ';

const MainWindow = find('div.flex.vertical.centered');
let animationBlock = document.querySelector('span.animationBlock');
let toggleButton = document.getElementById('toggle');
let spanBackground = find('span.background');
let proxySelector = find('div.proxySelector');
let TypeSelector = find('div.TypeSelector');
let ProxySelectorArrow = find('div.proxySelector img');
const proxyMode = find('div.proxySelector p#proxyMode');
const ConnectionTypes = findAll('div.TypeSelector span.Title');
const WhiteListEditor = find('div.WhiteListEditor');
const EditorWindow = find('div.ListEditorScreen');
const EditorTextField = find('div.ListEditorScreen div.topActivity input');
const EditorButton = find('div.ListEditorScreen div.topActivity button');
const subtitle = find('p.subtitle');
const SettingsIcon = find('img.openSettings');
const SettingsScreen = find('div.settingsSection');
const SettingsTopBar = find('div.settingsSection .topPane');
const SettingsList = find('div.settingsSection .SettingsList');
subtitle.textContent = SUBTITLE_TEXT;


let AuthWindow = find('div.AuthWindow');

const random = function(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function AnimateBlock(state) {
	await animationBlock.makeZeroAnimation(() => {
		animationBlock.scale = 1;
		animationBlock.opacity = 1;
		animationBlock.filter = 'brightness(1.125) ' + (state ? '' : 'hue-rotate(-115deg)')
	}, ['scale', 'background', 'filter'], 0)
	animationBlock.scale = 10;
	animationBlock.opacity = 0;	
}


function AnimateVPNButton(state, animate){
	const borderColor = (state ? '#00a800' : '#cd0000');
	const BigBoxShadow = (state ? '0 0 20px 14px #27ff00cc' : '0 0 20px 14px #ff0000cc');
	const boxShadow = (state ? '0 0 20px 2px #27ff00cc' : '0 0 20px 2px #ff0000cc');
	if (animate) {
		toggleButton.borderColor = borderColor;
		toggleButton.boxShadow = BigBoxShadow;
		spanBackground.filter=(state ? 'hue-rotate(80deg) brightness(1.2)' : '');
		runLater(() => {
			toggleButton.boxShadow = boxShadow;
		}, 150);
	} else {
		toggleButton.makeZeroAnimation(() => {
			toggleButton.borderColor = borderColor;
			toggleButton.boxShadow = boxShadow;
		}, ['border-color', 'boxShadow']);
		
		spanBackground.makeZeroAnimation(() => {
			spanBackground.filter=(state ? 'hue-rotate(80deg) brightness(1.2)' : '');
		}, ['filter']);
		
		
	}	
}


toggleButton.addEventListener('click', async () => {
	const enabled = await GetBool('enabled');
	const newState = !enabled;
	  
	await chrome.storage.local.set({ enabled: newState });
	await chrome.runtime.sendMessage({ action: "toggleProxy", enabled: newState });
	  
	toggleButton.textContent = newState ? 'Отключить VPN' : 'Запустить VPN';
	AnimateBlock(newState);
	AnimateVPNButton(newState, true);
	lastVpnState = newState;
});





let proxyfied = new Image(); proxyfied.src = 'vpn.svg';
let userfied = new Image(); userfied.src = 'ethernet.svg';

function CreateAnimation(isVpnifyed){
	  let directionSide = random(0, 1) === 0 ? "L" : "R";
	  let directionCalculated = directionSide === "L" ? 0 : 300;
	  const startRotation = random(-360, 360);
	  
	  let VectorImage = document.createElement('img');
	  const FirstAnimationDuration = 0.5;
	  
	  VectorImage.position = 'absolute';
	  VectorImage.style.width = '30px';
	  VectorImage.style.height = '30px';
	  VectorImage.zIndex = '0';
	  VectorImage.top = `200px`;
	  VectorImage.left = `150px`;
	  VectorImage.src = isVpnifyed ? proxyfied.src : userfied.src;
	  VectorImage.style.transition = `all ${FirstAnimationDuration}s cubic-bezier(0.61, 1.21, 1, 1)`;
	  runLater(() => {
		  VectorImage.left = directionCalculated+'px';
		  VectorImage.top = random(0, 160) + 'px';
		  VectorImage.rotate = startRotation+'deg';
	  }, 10)
	  
	  runLater(() => {
		  VectorImage.style.transition = 'all 1s cubic-bezier(0.49, -0.31, 0.86, 1.05), rotate 1s cubic-bezier(0.61, 1.21, 1, 1), opacity .1s';
		  VectorImage.top = 'calc(100% - 40px)';
		  VectorImage.left = (directionSide==="L" ? random(20, 120) : random(220, 280))+'px';
		  VectorImage.rotate = (startRotation/2)+'deg';
	  }, 200);
	  
	  runLater(() => {
		  VectorImage.opacity = 0;
	  }, 600);
	  
	  runLater(() => {
		  VectorImage.remove();
	  }, 800);
	  
	  
	  document.body.appendChild(VectorImage);
	  
}


let TypeSelectorHGHT = 0;
proxySelector.addEventListener('click', ()=>{
	const FutureState = Number(TypeSelector.zIndex)===1; // Will be it opened
	TypeSelector.zIndex = (FutureState ? 2 : 1);
	runLater(() => { WhiteListEditor.opacity = (FutureState ? 0 : 1); }, (FutureState ? 0 : 150));
	runLater(() => {
		TypeSelector.opacity = (FutureState ? 1 : 0);
		ProxySelectorArrow.style.rotate = (FutureState ? 180 : 0)+'deg';
		ProxySelectorArrow.style.top = (FutureState ? -2 : 0)+'px';
		TypeSelector.height = (FutureState ? TypeSelectorHGHT : 0)+'px';
		TypeSelector.gap = (FutureState ? 10 : 0)+'px';
		TypeSelector.paddingTop = (FutureState ? 10 : 0)+'px';
	}, 10);
});

TypeSelector.makeZeroAnimation(() => {
	TypeSelector.opacity = 0; TypeSelector.zIndex = -10; TypeSelector.display = "flex";
	runLater(() => {
		TypeSelectorHGHT = TypeSelector.realHeight;
		TypeSelector.maxHeight = TypeSelector.realHeight+'px'; TypeSelector.height='0px';
		TypeSelector.opacity = 0; TypeSelector.zIndex = 1; TypeSelector.display = "flex"; TypeSelector.paddingTop = 0;
	}, 10)
}, ["opacity", "zIndex", "display", "height"])

ConnectionTypes.forEach(connection => {
	connection.addEventListener('click', async () => {
		const type = connection.getAttribute('value').toLowerCase();
		await chrome.storage.local.set({ type: type })
		chrome.runtime.sendMessage({ action: "switchConnections" });	
		if (connectionType !== type) {runLater(() => proxySelector.click(), 50)}
		setActiveConnectionType(type);
	})
}) 

function UpdateWhiteList(animate){
	DisplayList.innerHTML = ``;
	console.log(WhiteListSites);
	for (let i = 0; i<WhiteListSites.length; i++) {
		let OriginalSiteName = WhiteListSites[i];
		console.log('OriginalSiteName:', OriginalSiteName[i]);
		let WhiteSite = document.createElement('div');
		WhiteSite.className = 'Rule';
		WhiteSite.innerHTML = `
			<img alt="" crossorigin="anonymous" src=${GetSiteIcon(OriginalSiteName)} class="ICONSITE">
			<input type="text" placeholder="${OriginalSiteName}" value="${OriginalSiteName}" onchange="alert()"></input>
			<button> 🗑️ </button>
		`;
		const IconSite = WhiteSite.querySelector('img');
		
		runLater(() => {
			try{ let darkImg = isDarkImage(IconSite);
			if (darkImg < 40) {  IconSite.filter = 'invert(1) hue-rotate(180deg)' } } catch(e) {}
		}, 75*i);
		
		let InputField = WhiteSite.querySelector('input');
		WhiteSite.querySelector('button').addEventListener('click', async () => {
			WhiteListSites = WhiteListSites.filter(item => item !== OriginalSiteName);
			await chrome.storage.local.set({ WhiteListed: WhiteListSites })
			chrome.runtime.sendMessage({ action: "reloadSettings:withVpnReload" });
			UpdateWhiteList(false);
		});
		
		InputField.addEventListener('input', async () => {
			if (typeof WhiteListSites === "undefined") {WhiteListSites = [];}
			WhiteListSites[WhiteListSites.indexOf(OriginalSiteName)] = WhiteSite.querySelector('input').value;
			OriginalSiteName = WhiteSite.querySelector('input').value;
			await chrome.storage.local.set({ WhiteListed: WhiteListSites });
			chrome.runtime.sendMessage({ action: "reloadSettings:withVpnReload" });
		});
		
		if (animate && i < 26) { 
			WhiteSite.opacity = 0;
			WhiteSite.left = '40px';
			runLater(() => {
				WhiteSite.opacity = 1;
				WhiteSite.left = 0;
			}, 20*i)
		}
		DisplayList.appendChild(WhiteSite);
	}
}


const DisplayList = find('div.ListEditorScreen div.RulesList');
let startLength = 0;
WhiteListEditor.addEventListener('click', async () => {
	
	if (typeof WhiteListSites !== 'undefined') {
		if (WhiteListSites.length != startLength) { await chrome.runtime.sendMessage({ action: "reloadSettings:withVpnReload" }); }
		startLength = WhiteListSites.length;
	}
	
	
	// isEditorOpened (со значением true) -> значит только будет открыт, а сейчас - false
	if (!isEditorOpened) {DisplayList.scrollTo(0,0);}
	MainWindow.left = (isEditorOpened ? 0 : -MainWindow.realWidth/2)+'px';
	MainWindow.filter = (isEditorOpened ? '' : 'blur(12px)');
	MainWindow.scale = (isEditorOpened ? 1 : 0.98);
	runLater(() => { MainWindow.opacity = (isEditorOpened ? 0 : 1); }, (isEditorOpened ? 0 : 100));
	spanBackground.opacity = (isEditorOpened ? 0.35 : 0.75); // 0.5 - Default Value
	EditorWindow.left = (isEditorOpened ? 100 : 0)+"%";
	
	
	
	if (!isEditorOpened && typeof WhiteListSites !== 'undefined') {
		UpdateWhiteList(true);
		if (WhiteListSites !== undefined && WhiteListSites.indexOf(CurrentTabUrl) < 0) {
			console.log(CurrentTabUrl);
			EditorTextField.value = CurrentTabUrl;
		}
	}
	
	isEditorOpened = !isEditorOpened;
})

EditorButton.onclick = async ()=>{
	if (EditorTextField.value.length === 0) {return;}
	if (typeof WhiteListSites === 'undefined') {
		WhiteListSites = [];
	}
	
	if (WhiteListSites.indexOf(getCleanDomain(EditorTextField.value)) >= 0) {
		const FoundedElement = DisplayList.querySelector(`div.Rule > input[value="${getCleanDomain(EditorTextField.value)}"]`).parentElement; if (FoundedElement===null) {return;}
		DisplayList.scroll({
		    top: FoundedElement.offsetTop - 10,
		    left: 0,
		    behavior: 'smooth'
		});
		for (let i = 1; i < 7; i++) {
			FoundedElement.boxShadow = (i%2==1) ? 'inset white 0px 0px 10px 4px' : 'inset transparent 0px 0px 0px 0px';
			await sleep(500);
		}
		FoundedElement.boxShadow = ''; 

		return;
	} 
	
	WhiteListSites.push(getCleanDomain(EditorTextField.value));
	await chrome.storage.local.set({ WhiteListed: WhiteListSites });
	await chrome.runtime.sendMessage({ action: "reloadSettings:withVpnReload" }); 
	UpdateWhiteList(false);
	EditorTextField.value = '';
}

find('div.ListEditorScreen div.topbar').onclick = () => {
	WhiteListEditor.click();
}
document.addEventListener('keydown', function(event) {
  if ((event.key === 'Escape' || event.key === 'Esc') && (isEditorOpened || isSettingsOpened)) {
	  if (isSettingsOpened) { SettingsIcon.click(); } else {WhiteListEditor.click();}
      event.preventDefault();
  }
});


window.addEventListener("unload", function () {
	if (typeof WhiteListSites !== 'undefined') {
		if (WhiteListSites.length != startLength) { chrome.runtime.sendMessage({ action: "reloadSettings:withVpnReload" }); }
	}
})


SettingsIcon.onclick = async () => {
	SwitchSettings();
	
	if (isSettingsOpened) {
		SettingsList.innerHTML = await GetActualSetting();
		const settingsList = SettingsList.querySelectorAll('div.setting');
		
		
		for (let i = 0; i < settingsList.length; i++) {
			const setting = settingsList[i];
			setting.right = '40px';
			setting.opacity = 0;
			
			let SettingElement;
			if (setting.querySelector('input')) {
				SettingElement = setting.querySelector('input');
				SettingElement.addEventListener('change', async() => {
					let NewSetting = {};
					const SettingElementID = SettingElement.id;
					NewSetting[SettingElementID] = (SettingElement.type ==='checkbox' ? SettingElement.checked : SettingElement.value);
					await chrome.storage.local.set( NewSetting );
					await chrome.runtime.sendMessage({ action: "reloadInAppSettings" });
				})
			}
			if (setting.querySelector('button')) {
				SettingElement = setting.querySelector('button');
				SettingElement.addEventListener('click', async() => {
					if (SettingElement.id==='authByte') {
						StartAuth(true);
					}
				})
			}
			runLater(() => {
				setting.right = '0px';
				setting.opacity = 1;
			}, 50*i)
			
		}
	}
}

async function GetActualSetting() {
	let txt = `
		<div class="setting">
			<div class="main flex">
				<label class="switch">
					<input type="checkbox" class="settingAction" id="SETTING:CHROMOMIZE" ${await GetSettingBool('CHROMOMIZE') ? 'checked' : ''}>
					<span class="slider round"></span>
				</label>
				<span onclick="document.getElementById('SETTING:CHROMOMIZE').click()"> Chrome User-Agent </span>
			</div>
			<span class="desc"> Подмена браузера на самый популярный. Уменьшает шансы на капчу </span>
		</div>
		
		<div class="setting">
			<div class="main flex">
				<label class="switch">
					<input type="checkbox" class="settingAction" id="SETTING:FixWEBRTC" ${await GetSettingBool('FixWEBRTC') ? 'checked' : ''}>
					<span class="slider round"></span>
				</label>
				<span onclick="document.getElementById('SETTING:FixWEBRTC').click()"> Отключить WebRTC </span>
			</div>
			<span class="desc"> Исправляет "Утечку" реального IP адреса, но соединение становится медленее </span>
		</div>
		
		
		<div class="setting">
			<button id="authByte"> Изменить конфигурацию </button>
		</div>
	`
	
	return txt;
}


function SwitchSettings(){
	isSettingsOpened = !isSettingsOpened;
	
	SettingsScreen.left = (isSettingsOpened ? 0 : -100)+'%';
	MainWindow.right = '';
	MainWindow.left = (isSettingsOpened ? MainWindow.realWidth/2 : 0)+'px';
	MainWindow.filter = (isSettingsOpened ? 'blur(12px)' : '');
	MainWindow.scale = (isSettingsOpened ? 0.98 : 1);
	runLater(() => { MainWindow.opacity = (isSettingsOpened ? 0 : 1); }, (isSettingsOpened ? 100 : 0));
	spanBackground.opacity = (isSettingsOpened ? 0.75 : 0.35); // 0.5 - Default Value
}

SettingsTopBar.onclick= async () => {
	SwitchSettings();
}

/////////////////////////////////////////////////////

async function GetSettingBool(name) {
	name = "SETTING:"+name;
	let ret = (await chrome.storage.local.get(name))[name]
	return ret === true;
}

async function GetBool(name) {
	let ret = (await chrome.storage.local.get(name))[name]
	return ret === true;
}

async function GetString(name) {
	let ret = (await chrome.storage.local.get(name))[name]
	return ret === true;
}



async function SubTitle_EasterEgg() {
	for (let i = 0; i < 6; i++) {
		const r = random(1,3);
		subtitle.textContent = SUBTITLE_TEXT+(r==1 ? 'Miku!' : 'dsvl0');
		await sleep(random(70, 10));
	}
	await sleep(800);
	SubTitle_EasterEgg();
}

SubTitle_EasterEgg();


function getCleanDomain(url) {
  try {
	  let checkUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
	  
      let parsed = new URL(checkUrl);
      return parsed.hostname.replace(/^www\./, '').replaceAll("/","");
  } catch (e) {
      return null;
  }
}

function isDarkImage(imgElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;

  ctx.drawImage(imgElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let totalBrightness = 0;
  let visiblePixelCount = 0;

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    // Пропускаем прозрачные пиксели
    if (a < 10) continue;

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    totalBrightness += brightness;
    visiblePixelCount++;
  }

  if (visiblePixelCount === 0) return false; // нет видимых пикселей — не считаем тёмным

  const average = totalBrightness / visiblePixelCount;
  return average;
}




const isOct24 = new Date().getMonth() === 9 && new Date().getDate() === 24;
if (isOct24 && document.getElementById('brth')) {
	document.getElementById('brth').display = 'block';
}


chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "network-request") {
	  if (isEditorOpened || !userAuthed || typeof message.details === "undefined" || typeof message.details.initiator === "undefined") {return;}
	  if (message.details.initiator.indexOf("chrome-extension://") >= 0) {return;};
	  CreateAnimation(message.details.vpnfied);
  }
  if (message.url) {
	  CurrentTabUrl = getCleanDomain(message.url);
	  console.log(CurrentTabUrl. CurrentTabUrl==="chrome");
	  if (CurrentTabUrl === null || CurrentTabUrl === "newtab" || CurrentTabUrl === "extensions" || CurrentTabUrl === "chrome" || message.url.indexOf('chrome://') >= 0) {
		  CurrentTabUrl === '';
	  }
  }
});

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function GetSiteIcon(domain) {
  return `https://www.google.com/s2/favicons?sz=256&domain=${domain}`;
}


function setActiveConnectionType(conType) {
	proxyMode.textContent = `Режим "${capitalizeFirstLetter(conType)}"`
	connectionType = conType;
	ConnectionTypes.forEach(connection => {
		(connection.getAttribute('value').toLowerCase() === conType) ? connection.classList.add('active') : connection.classList.remove('active');
	});
}

async function loadLastType() {
	const savedJson = await chrome.storage.local.get('type');
	let type = savedJson.type;
	if (type === undefined) {type = "on"}
	connectionType = type;
	setActiveConnectionType(connectionType);
}


function StartAuth(cancelable) {
		if (isSettingsOpened) {SwitchSettings();}
		if (!cancelable) { userAuthed = false; }
		AuthWindow.display = "flex";
		AuthWindow.zIndex = 10;
		AuthWindow.backdropFilter = 'blur(10px)';
		let ContinueButton = find('div.AuthWindow button.save');
		let TextField = find('div.AuthWindow input');
		ContinueButton.addEventListener('click', async () => {
			ContinueButton.disabled = true;
			try { 
				const parsedJson = JSON.parse(TextField.value);
				const FilteredJSON = {};
				FilteredJSON.host = parsedJson.host;
				FilteredJSON.scheme = parsedJson.scheme;
				FilteredJSON.port = parsedJson.PCP;
				if (parsedJson.PCN !== undefined) {
					FilteredJSON.username = AITG(parsedJson.PCN);
				}
				if (parsedJson.timeOffset !== undefined) {
					FilteredJSON.timeOffset = parsedJson.timeOffset;
				}
				if (parsedJson.PCA !== undefined) {  
					FilteredJSON.password = AITG(parsedJson.PCA);
				}
				await chrome.storage.local.set({ ServerData: FilteredJSON });
				chrome.runtime.sendMessage({ action: "reloadSettings" });
				window.location.reload();
			} catch(e) {
				alert("Неверный синтаксис");
			}
			ContinueButton.disabled = false;
		});
	if (cancelable) {
		AuthWindow.querySelector('.cancelBtn').display = 'block';
		AuthWindow.querySelector('.cancelBtn').addEventListener('click', () => {
			window.location.reload();
		}) 
	}
}

(async ()=>{	
	let isNowEnabled = await GetBool('enabled');
	lastVpnState = isNowEnabled;
	toggleButton.textContent =  isNowEnabled ? 'Отключить VPN' : 'Запустить VPN';
	AnimateBlock(isNowEnabled);
	AnimateVPNButton(isNowEnabled, false);


	chrome.runtime.sendMessage({ action: "getUrl" });
	WhiteListSites = (await chrome.storage.local.get('WhiteListed')).WhiteListed;
	if (typeof WhiteListSites !== 'undefined') {startLength = WhiteListSites.length; }
	let ServerData = (await chrome.storage.local.get('ServerData')).ServerData;
	loadLastType();
	if (typeof ServerData === "undefined") {
		StartAuth();
	}
})();


function AITG(str) {
  return [...str].map(c =>
    c >= 'B' && c <= 'Z' || c >= 'b' && c <= 'z' ? String.fromCharCode(c.charCodeAt(0) - 1) :
    c === 'A' ? 'Z' : c === 'a' ? 'z' : c
  ).join('');
}
