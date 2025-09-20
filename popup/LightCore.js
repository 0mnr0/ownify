const find = function(selector) { return document.querySelector(selector) };
const findAll = function(selector) { return document.querySelectorAll(selector) };
const findById = function(selector) { return document.getElementById(selector) };
const example = find("h2");
const HTML = document.head.parentElement;
const body = document.body;
const head = document.head;
const none = "none"; const None = "none"; const NONE = "none";
const print = console.log;	
const log = console.log;	
const warn = console.warn;	
const sleep = ms => new Promise(res => setTimeout(res, ms));
const absolute = 'absolute'; const relative = 'relative'; const PRC = '100%'; const center = 'center';
const scale = 'scale'; 
const __LightCoreDebug__ = false;
const random = (min, max) => {
    min = Math.ceil(min);
    return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min;
}


const runLater = async (fun, time) => {
	if (typeof time !== 'number') {time = 1000;}
	await sleep(time);
	await sleep(time);
	fun();
}

const CreateStyle = (id, style) => {
	let styleElement = document.createElement('style');
	styleElement.textContent = style;
	styleElement.id = id;
	body.after(styleElement);
	return styleElement;
}

const RemoveStyle = (id) => {
	if (findById(id)) { findById(id).remove(); return true;} return false;
}

(function() { 
	
    HTMLElement.prototype.setAlpha = function(alpha) {
		this.style.opacity = alpha;
		return alpha;
	}
	
	HTMLElement.prototype.getAlpha = function(alpha) {
		return parseFloat(getComputedStyle(this).opacity);
	}
	
	HTMLElement.prototype.find = function(selector) {
		return this.querySelector(selector);
	}
	
	HTMLElement.prototype.findAll = function(selector) {
		return this.querySelectorAll(selector);
	}
	
	HTMLElement.prototype.onEvent = function(type, listener, useCapture) {
		return this.addEventListener(type, listener, useCapture);
	}
	
	HTMLElement.prototype.listen = function(type, listener, useCapture) {
		return this.addEventListener(type, listener, useCapture);
	}
	
	HTMLElement.prototype.addEvent = function(type, listener, useCapture) {
		return this.addEventListener(type, listener, useCapture);
	}
	
	HTMLElement.prototype.disableAnimations = async function(disableFor, unlockTime) {
		if (typeof unlockTime !== 'number') {unlockTime = 10;}
		disableElement = disableFor;
		if (!disableFor || typeof disableFor!=='string') {
			disableElement = 'all';
		}
		const transitionData = this.style.transition;
		this.style.transition += ' '+disableElement+' .0s ';
		await sleep(unlockTime);
		this.style.transition = transitionData;		
	},
	
	HTMLElement.prototype.makeZeroAnimation = async function(animation, attributesWithoutAnimations, waitTillEnableAnimation) {
			// Эта функция отключит анимации для нужных элементов анимации
			// attributesWithoutAnimations прнимает только список атрибутов у которых будет отключены анимации, пример: ["scale", "background", "color"] (или сторку: "scale background")
			// Warning: element.style.transition не должен содержать на конце ", " 
			
			// animation - Функция в которой прописана анимация, например: () => {
			//	    element.style.scale = 0.5;
			//	    element.style.background = 'red';
			// }
			
			// waitTillEnableAnimation - Подождать дополнитльно перед тем как включить анимации (в мс) 
			if (typeof attributesWithoutAnimations === 'string') {
				attributesWithoutAnimations = attributesWithoutAnimations.split(' ');
			}
			if (!waitTillEnableAnimation && waitTillEnableAnimation !== 0) {waitTillEnableAnimation = 0;}
			let OrigTransition = this.style.transition;
			let finalTransition = '';
			for (let i = 0; i < attributesWithoutAnimations.length; i++) {
				finalTransition += `${attributesWithoutAnimations[i]} .0s`
				if (i+1 !== attributesWithoutAnimations.length) {finalTransition += ', '}
			}
			if (OrigTransition.replaceAll(" ","").length !== 0) {finalTransition = ', '+finalTransition}
			this.style.transition = OrigTransition+finalTransition;
			await new Promise(resolve => setTimeout(resolve, 33));
			animation();
			await new Promise(resolve => setTimeout(resolve, 33 + waitTillEnableAnimation));
			this.style.transition = OrigTransition;
	},
	
	
	HTMLElement.prototype.animateByWords = function(animationSpeed, animationName) {
		if (!animationName) {animationName="makeItBold";}
		const words = this.innerText.split(" ");
		this.innerHTML = words.map((word, i) =>
		  `<span class="mechanicSplittedWord" style="animation-delay: ${i * 1}s; animation-duration: ${animationSpeed}s; animation-name: ${animationName}">${word}</span>`
		).join(" ");
	}
	
	HTMLElement.prototype.showByWords = function(animationSpeed = 300, fontSize, fontFamily) {
		const wrapWords = (node) => {
			if (node.nodeType === Node.TEXT_NODE) {
				const words = node.textContent.split(/(\s+)/); // сохраняем пробелы
				return words.map((w) =>
					/\s+/.test(w)
						? document.createTextNode(w)
						: Object.assign(document.createElement("span"), {
							textContent: w,
							style: "opacity: 0;",
							fontSize: (typeof fontSize==='string') ? fontSize : '',
							fontFamily: (typeof fontFamily==='string') ? fontFamily : '',
							className: "mechanicSplittedWord"
						})
				);
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const clone = node.cloneNode(false);
				node.childNodes.forEach(child => wrapWords(child).forEach(clone.appendChild.bind(clone)));
				return [clone];
			}
			return [];
		};

		const content = [...this.childNodes].flatMap(wrapWords);
		this.innerHTML = "";
		content.forEach(el => this.appendChild(el));

		this.querySelectorAll(".mechanicSplittedWord").forEach((span, i) => {
			setTimeout(() => {
				span.style.transition = `opacity .4s ease`;
				span.style.opacity = 1;
			}, i * animationSpeed);
		});
	};


    HTMLElement.prototype.splitBySymbols = function ()  {
        const text = this.textContent;
        this.textContent = ""; // очищаем

        let ElementsList = [];
        text.split("").forEach(char => {
            const charSpan = document.createElement("span");
            charSpan.textContent = char;
            this.appendChild(charSpan);
            ElementsList.push(charSpan);
        });
        return ElementsList;
    }



	
	HTMLElement.prototype.makeLater = async function(fun, time) {
		if (typeof time !== 'number') {time = 1000;}
		await sleep(time);
		fun();
	}
	
	HTMLElement.prototype.executeLater = HTMLElement.prototype.makeLater;
	
	
	let htmlattributes = body.style;
	let attributes = Object.keys(htmlattributes);
	for (let i = 0; i < attributes.length; i++) {
		try{ 
			if (HTMLElement.prototype[attributes[i]] === undefined) {
				Object.defineProperty(HTMLElement.prototype, attributes[i], {
					 get() { return this.style[attributes[i]]; },
					 set(value) { 
						this.style[attributes[i]] = value; return value
					 }
				})
			}
		} catch(e) {
			if (__LightCoreDebug__) { console.log(`Failed to add "${attributes[i]}" property into "HTMLElement.prototype", passed!`); }
		}
	}
	
	
	
	let DebugHitboxes = false;
	let DebugOutlinedHitboxes = false;
	let VideoControlsInterval = null;
	const debug = {
		outlinedHits: function() {
			if (!DebugOutlinedHitboxes) { 
				CreateStyle('dbghits2',  'html * {outline: solid 1px red !important}');
			} else {
				RemoveStyle('dbghits2');
			}
			
			DebugOutlinedHitboxes = !DebugOutlinedHitboxes;
			return DebugOutlinedHitboxes;
		},
		hits: function() {
			if (!DebugHitboxes) { 
				CreateStyle('dbghits',  'html * {border: solid 1px red !important}');
			} else {
				RemoveStyle('dbghits');
			}
			
			DebugHitboxes = !DebugHitboxes;
			return DebugHitboxes;
		},
		videoControls: function(){
			if (VideoControlsInterval === null) {
				VideoControlsInterval = setInterval(() => {
					findAll('video').forEach(v => {v.controls=true})
				}, 100);
			} else {
				clearInterval(VideoControlsInterval);
				findAll('video').forEach(v => {v.controls=false});
			}
		}
	}
	
	window.debug = debug;
})();




const createElementWith = (elementType, elementProps) => {
	let newElement = document.createElement(elementType);
	
	// elementProps example:
	// { style: "transition: all .2s; ...", scale: 2 }
	
	
	const elementPropertiesNames = Object.keys(elementProps);
	const elementPropertiesValues = Object.values(elementProps);
	for (let i = 0; i < elementPropertiesNames.length; i++) {
		const propName = elementPropertiesNames[i];
		const propValue = elementPropertiesValues[i];
		newElement.style[propName] = propValue;
	}
	newElement.into = function() {return 0}
	return newElement
}






































//      █████╗  ██████╗ ██████╗███████╗███████╗███████╗ ██████╗ ██████╗      ██████╗ ██████╗ ██████╗ ███████╗
//     ██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝██╔═══██╗██╔══██╗    ██╔════╝██╔═══██╗██╔══██╗██╔════╝
//     ███████║██║     ██║     █████╗  ███████╗███████╗██║   ██║██████╔╝    ██║     ██║   ██║██████╔╝█████╗  
//     ██╔══██║██║     ██║     ██╔══╝  ╚════██║╚════██║██║   ██║██╔══██╗    ██║     ██║   ██║██╔══██╗██╔══╝  
//     ██║  ██║╚██████╗╚██████╗███████╗███████║███████║╚██████╔╝██║  ██║    ╚██████╗╚██████╔╝██║  ██║███████╗
//     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
                                                                                                      




(function(){
	
	// Alpha object [set, get]
	Object.defineProperty(HTMLElement.prototype, 'alpha', {
	  get() {
		return parseFloat(getComputedStyle(this).opacity);
	  },
	  set(value) {
		if (typeof value === 'number' && value >= 0 && value <= 1) {
		  this.style.opacity = value;
		} else {
		  throw new Error("Alpha must be between 0 and 1");
		}
	  }
	});
	
	
	Object.defineProperty(HTMLElement.prototype, 'destroy', {
		value: function () {
			this.remove();
			return null;
		}
	})

	
	
	Object.defineProperty(HTMLElement.prototype, 'cornerRadius', {
	  get() {
		return parseFloat(getComputedStyle(this).borderRadius);
	  },
	  set(value) {
		this.borderRadius = value+'px';
	  }
	});

	Object.defineProperty(HTMLElement.prototype, 'phantom', {
	  set(value) {
          requestAnimationFrame(() => {
              if (value) {
                  this.style.position = absolute;
                  this.style.zIndex = -100;
                  this.style.opacity = 0;
                  this.style.transition = 'none';
              } else {
                  this.style.position = '';
                  this.style.zIndex = '';
                  this.style.opacity = '';
                  this.style.transition = '';
              }
          });
	  }
	});
	
	
	
	// Real width object [get]
	Object.defineProperty(HTMLElement.prototype, 'realWidth', {
	    get() { return this.scrollWidth; }
	});
	Object.defineProperty(HTMLElement.prototype, 'realHeight', {
	    get() { return this.scrollHeight; }
	});



    window.LocalStorage = {
        isKeyExists(key) {
            return Object.keys(localStorage).indexOf(key) > -1
        },
        save: function (key, value) {
            localStorage[key] = value;
            return value;
        },
        getInt: function (key) {
            let val = localStorage.getItem(key);
            if (val === null) {
                return null
            } // Because Number(null) is returning "0"
            return Number(val);
        },
        getBool: function (key) {
            let val = localStorage.getItem(key);
            if (val === undefined || val === null) {
                return val
            } // Boolean() -> false
            return val;
        },
        getString: function (key) {
            return localStorage.getItem(key);
        },
        get: (key) => {return localStorage.getItem(key)},
        getFloat: function (key) {
            return parseFloat(localStorage.getItem(key))
        },
        remove: (key) => {
            localStorage.removeItem(key);
        },
        removeKey: (key) => {
            localStorage.removeItem(key)
        }
    };
	
	
})();





// ████████╗██████╗  █████╗ ███╗   ██╗███████╗██╗      █████╗ ████████╗███████╗     ████████╗ ██████╗  ██████╗ ██╗     ███████╗
// ╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██║     ██╔══██╗╚══██╔══╝██╔════╝     ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
//    ██║   ██████╔╝███████║██╔██╗ ██║███████╗██║     ███████║   ██║   █████╗          ██║   ██║   ██║██║   ██║██║     ███████╗
//    ██║   ██╔══██╗██╔══██║██║╚██╗██║╚════██║██║     ██╔══██║   ██║   ██╔══╝          ██║   ██║   ██║██║   ██║██║     ╚════██║
//    ██║   ██║  ██║██║  ██║██║ ╚████║███████║███████╗██║  ██║   ██║   ███████╗        ██║   ╚██████╔╝╚██████╔╝███████╗███████║
//    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝        ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
//                            


(() => {
	let defaultLocale = navigator.language;
	let TrDict = {};
	const TranslateAssistant = {
		"init": function(baseLang, dict) {
			if (typeof baseLang !== 'string') {
				throw "You need to specify \"baseLang\" key (exmaple: 'en' | 'ru')"
				return;
			}
			if (typeof dict !== 'object') {
				runLater(() => {console.info("Exmaple:\n", {'en': {'hi': 'Hello!'}, 'ru': {'hi': 'Привет!'}})}, 1);
				throw "You need to specify translate \"dictionary\"!\n"
				return;
			}
			defaultLocale = baseLang;
			TrDict = dict;
			window.getString = TranslateAssistant.translate.get;
		},
		isFullyInitialited: () => {
			return (typeof baseLang !== 'string' && typeof TrDict === 'object' && Object.keys(TrDict).length > 0)
		},
		defaultLocale: function(baseLang){
			if (typeof baseLang === 'string') {
				defaultLocale = baseLang;
			}
			return defaultLocale;
		},
		dict: function(dictionary) {
			if (typeof dictionary === 'object') {
				TrDict = dictionary;
			}
			return TrDict;
		},
		
		translate: {
			get: function(key) {
				if (TrDict["NOT_TRANSLATEABLE"]?.[key] !== undefined) {
					return TrDict["NOT_TRANSLATEABLE"][key]
				}
				return TrDict[defaultLocale]?.[key] || key
			},
			all: function() {
				const elements = findAll('*[data-i18n]');
				elements.forEach(el => {
					const key = el.getAttribute("data-i18n");
					const translation = TranslateAssistant.translate.get(key);

					if (translation) {
						const textNode = [...el.childNodes].find(
							node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== ""
						);
						if (textNode) {
							textNode.nodeValue = translation;
						} else {
							el.insertBefore(document.createTextNode(translation), el.firstChild);
						}
					}
				});
			},
			key: function(key) {
				if (key === undefined) {return TrDict}
				return TranslateAssistant.translate.get(key)
			}
		}
	};
	window.TranslateAssistant = TranslateAssistant;
})();