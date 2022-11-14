(function(){
	// migrate from the old save/load system
	let kits = localStorage.getItem("gc_cheat_kits")
	if(kits){
		kits = JSON.parse(kits);
		let answers = {}
		for(let key of Object.keys(kits)){
			answers = {...answers, ...kits[key]}
		}
		localStorage.setItem("gc_cheat_answers", JSON.stringify(answers))
		localStorage.removeItem("gc_cheat_kits")
	}

	let answers = JSON.parse(localStorage.getItem('gc_cheat_answers') ?? "{}");

	let color = prompt("Would you like to color in the answers? (Y/n)", "Y").toLowerCase() == "y";
	
	const save = () => {
		localStorage.setItem("gc_cheat_answers", JSON.stringify(answers));
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
					// color and move answers
					let item = items[i]
					let parentAmount = 3;
					if(item.nodeName == 'IMG') parentAmount = 1;
					if(item.parentElement.innerHTML == answer.correct){
						// color in and move the correct answer to the bottom
						if(color) item.nthparent(parentAmount).style.backgroundColor = "green";
						let outer = item.nthparent(parentAmount*2);
						let buttonParent = document.querySelectorAll(selector)[2]
						if(buttonParent.nodeName == "IMG") buttonParent = buttonParent.nthparent(3);
						else buttonParent = buttonParent.nthparent(7);
						let buttons = Array.from(buttonParent.children)
						if(buttons.indexOf(outer) != buttons.length-1){
							buttonParent.append(outer);
						}
					}else if(haveCorrectAnswer || answer.incorrects?.includes(item.parentElement.innerHTML)){
						// color incorrect answers
						if(color) item.nthparent(parentAmount).style.backgroundColor = "red";
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
				save();
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
				save();
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