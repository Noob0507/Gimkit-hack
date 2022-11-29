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

	const stripStyles = (str) => {
		// remove all text after style=" and before "
		return str.replace(/style=".*?"/g, "");
	}

	var listenedButtons = [];
	let lastQuestion = null;
	let lastAnswer = null;
	let lastAnswerType = null;
	var newAnswers = 0;
	const selector = '.notranslate, img[alt="Answer Choice"], img[alt="Question"]';

	function pageChange() {
		// the menu was probably opened
		let items = document.querySelectorAll(selector)

		if(items.length > 0){
			if(items.length == 1 && (document.querySelector("input") == null)){
				// this is an incorrect answer
				if(!lastQuestion) return;
				newAnswers++;
				if(!answers[lastQuestion]) answers[lastQuestion] = {};
				if(lastAnswerType == "text"){
					answers[lastQuestion].textAnswer = items[0].innerHTML;
				}else{
					answers[lastQuestion].correct = items[0].parentElement.innerHTML;
				}
				save();
				console.log(`Total answers stored: ${Object.keys(answers).length}\nNew answers this session: ${newAnswers}`)
				return;
			}
			lastQuestion = stripStyles(items[0].parentElement.innerHTML);

			// if the question was already answered, highlight the correct answer
			if(lastQuestion in answers){
				let answer = answers[lastQuestion];

				if(answer.textAnswer){
					if(items[0].parentElement.querySelector(".correct-answer") != null) return;
					let answerText = answer.textAnswer;
					let answerNode = document.createElement("div");
					answerNode.innerHTML = `Correct answer: ${answerText}`;
					answerNode.classList.add("correct-answer");
					answerNode.style.fontSize = "16px";
					items[0].parentElement.append(answerNode);
					let input = document.querySelector("input");
					input.value = answerText.slice(0, -1);
					return;
				}

				// get the colors of the options
				let colors = [];
				items.forEach((item, i) => {
					if(i == 0) return;
					let parentAmount = 5;
					if(item.nodeName == "IMG") parentAmount = 1;
					let bgColor = getComputedStyle(item.nthparent(parentAmount)).background;
					colors.push(bgColor);
				})

				let correctSeen = false;
				for(let i = 1; i < items.length && answer.correct; i++){
					// color and move answers
					let item = items[i]
					let parentAmount = 3;
					if(item.nodeName == 'IMG') parentAmount = 1;
					if(stripStyles(item.parentElement.innerHTML) == stripStyles(answer.correct)){
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
						correctSeen = true;
						if(item.nodeName == "IMG") item.parentElement.style.background = colors[3];
						else item.nthparent(5).style.background = colors[3];
					}else{
						// color incorrect answers
						if(color) item.nthparent(parentAmount).style.backgroundColor = "red";
						else {
							if(correctSeen){
								console.log(colors[i-2])
								// swap the item's background color to match the one it's supposed to be
								if(item.nodeName == "IMG") item.parentElement.style.background = colors[i-2];
								else item.nthparent(5).style.background = colors[i-2];
							}
						}
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
			if(background){
				success = true;
			}

			if(success){
				newAnswers++;
				if(lastAnswerType == "text"){
					// answer was text
					if(!answers[lastQuestion]) answers[lastQuestion] = {};
					answers[lastQuestion].textAnswer = lastAnswer;
				}else{
					// answer was a button
					if(!answers[lastQuestion]) answers[lastQuestion] = {};
					answers[lastQuestion].correct = stripStyles(lastAnswer);
				}
				console.log(`Total answers stored: ${Object.keys(answers).length}\nNew answers this session: ${newAnswers}`)
				save();
			}
		}
	}

	let observer = new MutationObserver(pageChange);
	observer.observe(document.body, {subtree: true, childList: true});

	HTMLElement.prototype.nthparent = function(n) {
		let parent = this;
		while (n-- && parent) parent = parent.parentElement;
		return parent;
	}

	// check if the questions are open when the script is loaded
	pageChange();
})();