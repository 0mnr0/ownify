let connectionType = undefined;
let lastVpnState = false;
let userAuthed = true;
let isEditorOpened = false;
let WhiteListSites = undefined;

let CurrentTabUrl = '';

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
	const { enabled } = await chrome.storage.local.get('enabled');
	const newState = !enabled;
	  
	await chrome.storage.local.set({ enabled: newState });
	await chrome.runtime.sendMessage({ action: "toggleProxy", enabled: newState });
	  
	toggleButton.textContent = newState ? 'Отключить VPN' : 'Запустить VPN';
	AnimateBlock(newState);
	AnimateVPNButton(newState, true);
	lastVpnState = newState;
});


chrome.storage.local.get('enabled', (data) => {
	lastVpnState = data.enabled
	toggleButton.textContent =  data.enabled ? 'Отключить VPN' : 'Запустить VPN';
	AnimateBlock(data.enabled);
	AnimateVPNButton(data.enabled, false);
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
		setActiveConnectionType(type);
	})
}) 

function UpdateWhiteList(animate){
	DisplayList.innerHTML = ``;
	for (let i = 0; i<WhiteListSites.length; i++) {
		let OriginalSiteName = WhiteListSites[i];
		let WhiteSite = document.createElement('div');
		WhiteSite.className = 'Rule';
		WhiteSite.innerHTML = `
			<input type="text" placeholder="${OriginalSiteName}" value="${OriginalSiteName}" onchange="alert()"></input>
			<button> 🗑️ </button>
		`;
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
		
		if (animate && i < 25) { 
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


const MainWindow = find('div.flex.vertical.centered');
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
	spanBackground.opacity = (isEditorOpened ? 0.35 : 0.5); // 0.5 - Default Value
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
		const ElementInput = FoundedElement.querySelector('input');
		DisplayList.scroll({
		    top: FoundedElement.offsetTop - 10,
		    left: 0,
		    behavior: 'smooth'
		});
		ElementInput.border = 'solid 2px';
		for (let i = 1; i < 5; i++) {
			ElementInput.boxShadow = (i%2==0) ? 'white 0px 0px 10px 0px' : 'white 0px 0px 0px 0px';
			await sleep(500);
		}
		ElementInput.border = ''; 
		ElementInput.boxShadow = ''; 

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
  if ((event.key === 'Escape' || event.key === 'Esc') && isEditorOpened) {
	  WhiteListEditor.click();
      event.preventDefault();
  }
});


window.addEventListener("unload", function () {
	if (typeof WhiteListSites !== 'undefined') {
		if (WhiteListSites.length != startLength) { chrome.runtime.sendMessage({ action: "reloadSettings:withVpnReload" }); }
	}
})


find('img.resetUniqKey').onclick = () => {
	StartAuth();
}

/////////////////////////////////////////////////////


function getCleanDomain(url) {
  try {
	  let checkUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
	  
      let parsed = new URL(checkUrl);
      return parsed.hostname.replace(/^www\./, '').replaceAll("/","");
  } catch (e) {
      return null;
  }
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
	  if (CurrentTabUrl === null || CurrentTabUrl === "newtab" || CurrentTabUrl === "extensions" || message.url.indexOf('chrome://') >= 0) {
		  CurrentTabUrl === '';
	  }
  }
});

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}


function setActiveConnectionType(conType) {
	proxyMode.textContent = `Режим "${capitalizeFirstLetter(conType)}"`
	ConnectionTypes.forEach(connection => {
		(connection.getAttribute('value').toLowerCase() === conType) ? connection.classList.add('active') : connection.classList.remove('active');
	})
}

async function loadLastType() {
	const savedJson = await chrome.storage.local.get('type');
	let type = savedJson.type;
	if (type === undefined) {type = "on"}
	connectionType = type;
	setActiveConnectionType(connectionType);
}


function StartAuth() {
		userAuthed = false;
		AuthWindow.display = "flex";
		AuthWindow.zIndex = 10;
		AuthWindow.backdropFilter = 'blur(10px)';
		let ContinueButton = find('div.AuthWindow button');
		let TextField = find('div.AuthWindow input');
		ContinueButton.addEventListener('click', async () => {
			ContinueButton.disabled = true;
			try { 
				const parsedJson = JSON.parse(TextField.value);
				const FilteredJSON = {};
				FilteredJSON.host = parsedJson.host;
				FilteredJSON.scheme = parsedJson.scheme;
				FilteredJSON.port = parsedJson.UserExtensionId;
				FilteredJSON.username = AITG(parsedJson.ServerAuth_UN);
				FilteredJSON.password = AITG(parsedJson.ServerAuth_UP);
				await chrome.storage.local.set({ ServerData: FilteredJSON });
				await chrome.runtime.sendMessage({ action: "reloadSettings" });
				toggleButton.click();
				AuthWindow.filter = '';
				AuthWindow.opacity = 0;
				AuthWindow.zIndex = -10;
				runLater(() => {AuthWindow.display = 'none';}, 500);
			} catch(e) {
				alert("Неверный синтаксис");
			}
			ContinueButton.disabled = false;
		});	
}

(async ()=>{
	await chrome.runtime.sendMessage({ action: "getUrl" });
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
