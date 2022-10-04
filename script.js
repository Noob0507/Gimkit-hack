(function(){
	alert("Gimkit Script Enabled");
	
	var listenedButtons = [];
	let answers = {};
	let lastQuestion = null;
	let lastClickedAnswer = null;
	const selector = '.notranslate, img[alt="Answer Choice"]';
	
	let observer = new MutationObserver(function() {
		// the menu was probably opened
		let items = document.querySelectorAll(selector)
		// console.log(items.length)
		if(items.length > 0){
			lastQuestion = items[0].innerHTML;

			// if the question was already answered, highlight the correct answer
			if(lastQuestion in answers){
				let answer = answers[lastQuestion];
				for(let i = 1; i < items.length; i++){
					let item = items[i]
					let parentAmount = 3;
					if(item.nodeName == 'IMG') parentAmount = 1;
					if(item.parentElement.innerHTML == answer){
						item.nthparent(parentAmount).style.backgroundColor = "green";
						let outer = item.nthparent(parentAmount*2);
						let buttons = Array.from(document.querySelector(".sc-bvZOhf.fTllCc").children)
						if(buttons.indexOf(outer) != buttons.length-1){
							document.querySelector(".sc-bvZOhf.fTllCc").append(outer);
						}
					}else{
						item.nthparent(parentAmount).style.backgroundColor = "red";
					}
				}
			}

			for(let i = 1; i < items.length; i++){
				let button = items[i].nthparent(6);
				if(items[i].nodeName == "IMG") button = items[i].nthparent(2);

				if(listenedButtons.indexOf(button) == -1){
					listenedButtons.push(button);
				}

				button.addEventListener("click", function(){
					lastClickedAnswer = this.querySelector(selector).parentElement.innerHTML;
				})
			}
		}else{
			let success = false;
			// figure out whether it was right or not
			let background = document.querySelector(".sc-kxYOAa");
			if(background){
				if(getComputedStyle(background).backgroundColor == "rgb(56, 142, 60)") success = true;
			}

			if(success){
				answers[lastQuestion] = lastClickedAnswer;
				console.log(answers);
			}
		}
	});
	observer.observe(document.body, {subtree: true, childList: true});

	HTMLElement.prototype.nthparent = function(n) {
		let parent = this;
		while (n-- && parent) parent = parent.parentElement;
		return parent;
	}
})();