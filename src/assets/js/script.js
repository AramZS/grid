// client-side js, loaded by index.html
// run by the browser each time the page is loaded

console.log("hello world :o");

Array.prototype.move = function (from, to) {
	this.splice(to, 0, this.splice(from, 1)[0]);
};

function fwdClick(e) {
	var box = e.parentElement.parentElement;
	var boxInner = box.getElementsByClassName("data-box-collection");
	var boxes = box.getElementsByClassName("data-box");
	var boxesArray = Array.prototype.slice.call(boxes);
	var boxSet = document.createDocumentFragment();
	boxesArray.move(0, boxesArray.length - 1);
	boxesArray.forEach(function (item, i) {
		item.classList.remove("bkwd");
		item.classList.add("fwd");
		boxSet.appendChild(item);
	});
	boxInner[0].innerHTML = null;
	boxInner[0].appendChild(boxSet);
}

function bkClick(e) {
	var box = e.parentElement.parentElement;
	var boxInner = box.getElementsByClassName("data-box-collection");
	var boxes = box.getElementsByClassName("data-box");
	var boxesArray = Array.prototype.slice.call(boxes);
	var boxSet = document.createDocumentFragment();
	boxesArray.move(boxesArray.length - 1, 0);
	boxesArray.forEach(function (item, i) {
		item.classList.add("fwd");
		if (i === 0) {
			item.classList.add("bkwd");
		}
		boxSet.appendChild(item);
	});
	boxInner[0].innerHTML = null;
	boxInner[0].appendChild(boxSet);
}

window.modalCtrl = {
	returnContainer: null,
	modalDatabox: (event) => {
		event.stopPropagation();
		console.log("window.modalCtrl.modalDatabox");
		console.log(event.target.classList);
		if (event.target.classList.contains("magnify")) {
			return true;
		} else {
			window.modalCtrl.returnContainer = event.target.closest(
				".data-box-collection",
			);
			document.querySelectorAll(".data-box").forEach(function (e) {
				e.classList.remove("magnify");
			});
			var targetDiv = event.target.closest("div.data-box");
			targetDiv.classList.add("magnify");
			document.getElementById("grid-container").prepend(targetDiv);
			document.body.style.overflow = "hidden";
			document.body.classList.add("fadeout");
			targetDiv.removeEventListener(
				"click",
				window.modalCtrl.modalDatabox,
				true,
			);
			event.stopImmediatePropagation();
			return false;
		}
	},
	prependIt: function (el) {
		console.log(el, window.modalCtrl.returnContainer);
		window.modalCtrl.returnContainer.prepend(el);
	},
};

window.glitchify = function (el) {
	el.classList.add("glitch");
};

window.deglitchify = function (el) {
	el.classList.remove("glitch");
};

window.onload = function () {
	document.querySelectorAll(".data-box").forEach(function (databox) {
		console.log("Attach listener to databox", databox);
		databox.addEventListener("click", window.modalCtrl.modalDatabox);
		databox.dataset.clickStatus = "true";
	});
	document.querySelectorAll(".data-box > .close").forEach(function (databox) {
		databox.addEventListener("click", (event) => {
			console.log("close", event.target.parentElement);
			if (event.target.parentElement.classList.contains("magnify")) {
				document.body.style.overflow = "auto";
				document.body.classList.remove("fadeout");
				event.target.parentElement.classList.remove("magnify");
				window.modalCtrl.prependIt(event.target.parentElement);
				event.target.parentElement.addEventListener(
					"click",
					window.modalCtrl.modalDatabox,
					true,
				);
				event.stopImmediatePropagation();
				return false;
			}
		});
	}, true);
};
