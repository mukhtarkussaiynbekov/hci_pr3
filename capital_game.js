// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.

const ALL = 'all';
const CORRECT = 'correct';
const WRONG = 'wrong';
const EMPTY_LIST = 'emptyList';

$(document).ready(() => {
	var country_capital_pairs = pairs;
	var capitals = [];
	country_capital_pairs.forEach(pair => capitals.push(pair.capital));
	var userAnswers = [];

	const displayEmptyList = () => {
		var emptyArrayRow = document.createElement('tr');
		emptyArrayRow.id = EMPTY_LIST;
		emptyArrayRow.className = 'row';
		var emptyCell = document.createElement('td');
		emptyCell.setAttribute('colspan', '3');
		var emptyText = document.createTextNode('The list is empty');
		emptyCell.appendChild(emptyText);
		emptyCell.setAttribute('style', 'text-align: center;');
		emptyArrayRow.appendChild(emptyCell);
		$('.table-body').append(emptyArrayRow);
	};
	displayEmptyList();

	const getCorrectCapital = country => {
		for (var pair of country_capital_pairs) {
			if (pair.country === country) {
				return pair.capital;
			}
		}
	};

	const formattedString = string => {
		// referenced following links:
		// https://www.benchresources.net/remove-leading-and-trailing-whitespace-from-javascript-string/
		// https://stackoverflow.com/a/1026087
		var trimmedString = string.trim();
		return trimmedString.toLowerCase();
	};

	const getRandomPair = () => {
		const random = Math.floor(Math.random() * country_capital_pairs.length);
		return country_capital_pairs[random];
	};
	const setNewEntry = () => {
		var pair = getRandomPair();
		$('#pr2__country').text(pair.country);
		$('#pr2__capital').val('').focus();
	};

	setNewEntry();

	const clearTable = () => {
		userAnswers.forEach((entry, idx) => {
			// referenced https://www.w3schools.com/jquery/jquery_dom_remove.asp
			$(`#${idx}`).remove();
		});
	};

	const displayAnswer = (
		id,
		country,
		isCorrect,
		correctCapital,
		inputCapital
	) => {
		// row create
		var newRow = document.createElement('tr');
		newRow.id = id;
		newRow.className = `row ${isCorrect ? CORRECT : WRONG}`;

		// country cell with its text
		var countryCell = document.createElement('td');
		countryCell.className = 'cell';
		var countryText = document.createTextNode(country);
		countryCell.appendChild(countryText);

		// capital cell with its text
		var capitalCell = document.createElement('td');
		capitalCell.className = `cell ${isCorrect ? '' : 'strikethrough'}`;
		var capitalText = document.createTextNode(
			isCorrect ? correctCapital : inputCapital
		);
		capitalCell.appendChild(capitalText);

		// answer cell with its text or icon
		var answerCell = document.createElement('td');
		if (isCorrect) {
			var icon = document.createElement('i');
			icon.className = 'fas fa-circle';
			answerCell.appendChild(icon);
		} else {
			var correctAnswerText = document.createTextNode(correctCapital);
			answerCell.appendChild(correctAnswerText);
		}
		var removeButton = document.createElement('button');
		removeButton.className = 'removeButton';
		removeButton.setAttribute('type', 'button');
		removeButton.innerHTML = 'Remove';

		// referenced https://www.codegrepper.com/code-examples/javascript/javascript+create+button+onclick
		removeButton.onclick = () => {
			clearTable();
			// referenced https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
			userAnswers.splice(id, 1);
			$('#selection').change();
		};
		answerCell.appendChild(removeButton);

		// finally display to a user
		newRow.appendChild(countryCell);
		newRow.appendChild(capitalCell);
		newRow.appendChild(answerCell);
		$('.table-body').append(newRow);
	};

	// referenced https://www.tutorialrepublic.com/faq/how-to-get-the-value-of-selected-option-in-a-select-box-using-jquery.php#:~:text=Answer%3A%20Use%20the%20jQuery%20%3Aselected,select%20box%20or%20dropdown%20list.
	$('#selection').change(() => {
		var selectedOption = $('#selection').children('option:selected').val();
		clearTable();
		var isEmpty = true;
		userAnswers.forEach(({ country, capital, input, isCorrect }, idx) => {
			if (
				selectedOption === ALL ||
				(selectedOption === CORRECT && isCorrect) ||
				(selectedOption === WRONG && !isCorrect)
			) {
				isEmpty = false;
				displayAnswer(idx, country, isCorrect, capital, input);
			}
		});
		// referenced https://mkyong.com/jquery/how-to-check-if-an-element-is-exists-in-jquery/#:~:text=In%20jQuery%2C%20you%20can%20use,number%20of%20the%20matched%20elements.&text=To%20check%20if%20an%20element%20which,id%20of%20%E2%80%9Cdiv1%E2%80%9D%20exists.
		while ($(`#${EMPTY_LIST}`).length !== 0) {
			$(`#${EMPTY_LIST}`).remove();
		}
		if (isEmpty) {
			displayEmptyList();
		}
	});

	const submitAnswer = inputCapital => {
		var country = $('#pr2__country').text();
		var correctCapital = getCorrectCapital(country);
		var formattedInputCapital = formattedString(inputCapital);
		var isCorrect = formattedInputCapital === correctCapital.toLowerCase();

		// save entry
		userAnswers.push({
			country,
			capital: correctCapital,
			input: inputCapital,
			isCorrect
		});

		var selectedOption = $('#selection').children('option:selected').val();
		if (
			(selectedOption === WRONG && isCorrect) ||
			(selectedOption === CORRECT && !isCorrect)
		) {
			// referenced https://stackoverflow.com/a/12797914
			$('#selection').val(ALL).change();
		}
	};

	$('#pr2__capital')
		.autocomplete({
			source: (request, response) => {
				response(
					$.map(capitals, value => {
						var capital = formattedString(value);
						var input = formattedString(request.term);
						return capital.startsWith(input) ? value : null;
					})
				);
			},
			minLength: 2,
			select: (event, ui) => {
				if (userAnswers.length === 0) {
					$(`#${EMPTY_LIST}`).remove();
				}
				submitAnswer(ui.item.value);
				ui.item.value = '';
				$('#selection').change();
				setNewEntry();
			}
		})
		.keyup(e => {
			if (e.which === 13) {
				// referenced https://stackoverflow.com/a/9602462
				$('.ui-menu').hide();
				$('#pr2__button').trigger('click');
			}
		});

	$('#pr2__button').click(() => {
		if ($('#pr2__capital').hasClass('ui-autocomplete')) {
			$('#pr2__capital').blur();
			$('#pr2__capital').autocomplete('close');
			$('#pr2__capital').autocomplete('disable');
			$('#pr2__capital').autocomplete('enable');
		}
		if ($('#pr2__capital').val() !== '') {
			submitAnswer($('#pr2__capital').val());
			$('#selection').change();
			setNewEntry();
		}
	});
	$(document).keydown(event => {
		if (event.which === 13) {
			$('#pr2__button').trigger('click');
		}
	});
});
