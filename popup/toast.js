const Toast = {
	get: (id) => { return find('div.toast.id'+id) },
	find: (id) => { return find('div.toast.id'+id) },
	create: function(text, len, closeText) {
		if (len === undefined) {len = 2000;}
		if (len < 0 && typeof closeText !== 'string') {
			throw "Если длина показа бесконечная - тогда должна быть кнопка закрывающаяя Toast"
		}
		if (len < 0 && closeText.replaceAll(" ",'').length <= 0) {
			throw "Укажите текст кнопки для бесконечного Toast!"
		}
		const ToastID = random(1000, 10000);
		let newToast = document.createElement('div')
		newToast.className = 'toast id'+ToastID;
		newToast.innerHTML = `
		<span> ${text} </span>
		${typeof closeText === 'string' ? `<button> ${closeText} </button>` : ""}
		`;
		
		find('div.flex.vertical.centered').appendChild(newToast);
		if (typeof closeText === 'string') {
			newToast.addEventListener('click', () => {
				Toast.fadeOutAndRemove(ToastID);
			})
		}
		runLater(() => {
			newToast.classList.add('visible');
		}, 10)
		
		
		if (len >= 0) {
			runLater(() => {
				Toast.fadeOutAndRemove(ToastID);
			}, len)
		}
		
		return ToastID;
	},
	fadeOutAndRemove: (id) => {
		someToast = Toast.get(id);
		someToast.classList.remove('visible');
		runLater(() => {someToast.remove();}, 500);
	},
	remove: (id, force) => {
		someToast = Toast.get(id);
		force ? someToast.remove() : Toast.fadeOutAndRemove(id)
	},
}