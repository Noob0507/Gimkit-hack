(function(){
	let kits = JSON.parse(localStorage.getItem('gc_cheat_kits') ?? "{}");
	let id = prompt("Add an ID to save the current quiz with, or to load one you previously saved. Saved kits: " + Object.keys(kits).join(", "));
	let answers = {};
	let saveOrLoad = "none";
	if(id){
		let data = localStorage.getItem("gc_cheat_kits") ?? "{}";
		data = JSON.parse(data);
		if(data[id]){
			saveOrLoad = "load";
			answers = data[id];
		}else{
			saveOrLoad = "save";
		}
	}
	
	var listenedButtons = [];
	let lastQuestion = null;
	let lastAnswer = null;
	let lastAnswerType = null;
	const selector = '.notranslate, img[alt="Answer Choice"], img[alt="Question"]';
	
	let observer = new MutationObserver(function() {
		// the menu was probably opened
		let items = document.querySelectorAll(selector)
		// console.log(items.length)
		if(items.length > 0){
			lastQuestion = items[0].parentElement.innerHTML;

			// if the question was already answered, highlight the correct answer
			if(lastQuestion in answers){
				let answer = answers[lastQuestion];
				let haveCorrectAnswer = false;

				if(answer.correct){
					haveCorrectAnswer = true;
				}

				if(answer.textAnswer){
					if(items[0].parentElement.querySelector(".correct-answer") != null) return;
					let answerText = answer.textAnswer;
					let answerNode = document.createElement("div");
					answerNode.innerHTML = `Correct answer: ${answerText}`;
					answerNode.classList.add("correct-answer");
					items[0].parentElement.append(answerNode);
					let input = document.querySelector(".sc-RpuvT");
					input.value = answerText.slice(0, -1);
					return;
				}

				for(let i = 1; i < items.length; i++){
					let item = items[i]
					let parentAmount = 3;
					if(item.nodeName == 'IMG') parentAmount = 1;
					if(item.parentElement.innerHTML == answer.correct){
						item.nthparent(parentAmount).style.backgroundColor = "green";
						let outer = item.nthparent(parentAmount*2);
						let buttonParent = document.querySelectorAll(".notranslate.lang-en")[2].nthparent(7)
						let buttons = Array.from(buttonParent.children)
						if(buttons.indexOf(outer) != buttons.length-1){
							buttonParent.append(outer);
						}
					}else if(haveCorrectAnswer || answer.incorrects?.includes(item.parentElement.innerHTML)){
						item.nthparent(parentAmount).style.backgroundColor = "red";
					}
				}
			}

			// check if the question is a text input
			let input = document.querySelector(".sc-RpuvT");
			if(input != null){
				lastAnswerType = "text";
				input.addEventListener("input", (e) => {
					lastAnswer = e.target.value;
				})
				return;
			}

			lastAnswerType = "button";
			for(let i = 1; i < items.length; i++){
				let button = items[i].nthparent(6);
				if(items[i].nodeName == "IMG") button = items[i].nthparent(2);

				if(listenedButtons.indexOf(button) == -1){
					listenedButtons.push(button);
				}

				button.addEventListener("click", function(){
					lastAnswer = this.querySelector(selector).parentElement.innerHTML;
				})
			}
		}else{
			if(answers[lastQuestion]?.correct != undefined) return;
			let success = false;
			// figure out whether it was right or not
			let background = document.querySelector(".sc-lhGUXL");
			let incorrectBg = document.querySelector(".sc-Kgodr");
			if(background){
				success = true;
			}
			if(incorrectBg){
				if(!answers[lastQuestion]) answers[lastQuestion] = {}; 
				if(!answers[lastQuestion].incorrects) answers[lastQuestion].incorrects = [];
				answers[lastQuestion].incorrects.push(lastAnswer);
				if(saveOrLoad == "save"){
					let currentData = localStorage.getItem("gc_cheat_kits") ?? "{}";
					currentData = JSON.parse(currentData);
					currentData[id] = answers;
					localStorage.setItem("gc_cheat_kits", JSON.stringify(currentData));
				}
			}

			if(success){
				if(lastAnswerType == "text"){
					// answer was text
					if(!answers[lastQuestion]) answers[lastQuestion] = {};
					answers[lastQuestion].textAnswer = lastAnswer;
				}else{
					// answer was a button
					if(!answers[lastQuestion]) answers[lastQuestion] = {};
					answers[lastQuestion].correct = lastAnswer;
					console.log(answers)
				}
				if(saveOrLoad == "save"){
					let currentData = localStorage.getItem("gc_cheat_kits") ?? "{}";
					currentData = JSON.parse(currentData);
					currentData[id] = answers;
					localStorage.setItem("gc_cheat_kits", JSON.stringify(currentData));
				}
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