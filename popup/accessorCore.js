
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
	
	
	
	// Real width object [get]
	Object.defineProperty(HTMLElement.prototype, 'realWidth', {
	    get() { return this.scrollWidth; }
	});
	Object.defineProperty(HTMLElement.prototype, 'realHeight', {
	    get() { return this.scrollHeight; }
	});
	Object.defineProperty(HTMLElement.prototype, 'cycleAnimation', {
	    get() { return Number(this.getAttribute("cycledAnimationId")); }
	})
	
	
})();