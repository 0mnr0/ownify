const find = function(selector) { return document.querySelector(selector) };
const findAll = function(selector) { return document.querySelectorAll(selector) };
const findById = function(selector) { return document.getElementById(selector) };
const example = find("h2");
const body = document.body;
const head = document.head;
const none = "none"; const None = "none"; const NONE = "none";
const print = console.log;	
const sleep = ms => new Promise(res => setTimeout(res, ms));
const absolute = 'absolute'; const relative = 'relative'; const PRC = '100%'; const center = 'center';
const scale = 'scale'; 


async function runLater(fun, time) {
	if (typeof time !== 'number') {time = 1000;}
	await sleep(time);
	await sleep(time);
	fun();
}

function CreateStyle(id, style) {
	let styleElement = document.createElement('style');
	styleElement.textContent = style;
	styleElement.id = id;
	body.after(styleElement);
	return styleElement;
}

function RemoveStyle(id) {
	if (findById(id)) { findById(id).remove(); return 1;} return 0;
}

(function() { 
	
    HTMLElement.prototype.setAlpha = function(alpha) {
		this.style.opacity = alpha;
		return alpha;
	}
	
	HTMLElement.prototype.getAlpha = function(alpha) {
		return parseFloat(getComputedStyle(this).opacity);
	}
	
	HTMLElement.prototype.setCycleAnimation = function(fun, pauseTime, timesCalling, isInterval) {
		if (isInterval) {
			const intId = setInterval(fun, pauseTime);
			this.setAttribute("cycledAnimationId", intId);
			return intId;
		} else {
			for (let i = 0; i<timesCalling; i++) {
				setTimeout(fun, (pauseTime * (1+i)));
			}
			return 0;
		}
	}
	
	HTMLElement.prototype.removeCycleAnimation = function() {
		clearInterval(Number(this.getAttribute("cycledAnimationId")));
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
		} catch(e) {console.log(`Failed to add "${attributes[i]}" property into "HTMLElement.prototype", passed!`);}
	}
	
	
	
	let DebugHitboxes = false;
	let VideoControlsInterval = null;
	const debug = {
		outlinedHits: function() {
			if (!DebugHitboxes) { 
				CreateStyle('dbghits2',  'html * {outline: solid 1px red !important}');
			} else {
				RemoveStyle('dbghits2');
			}
			
			DebugHitboxes = !DebugHitboxes;
		},
		hits: function() {
			if (!DebugHitboxes) { 
				CreateStyle('dbghits',  'html * {border: solid 1px red !important}');
			} else {
				RemoveStyle('dbghits');
			}
			
			DebugHitboxes = !DebugHitboxes;
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




const createElement = function(elementType, elementProps) {
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