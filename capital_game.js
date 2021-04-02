// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.

$(document).ready(function () {
	var country_capital_pairs = pairs;

	var userAnswers = [];

	const emptyList = () => {
		var emptyArrayRow = document.createElement('tr');
		emptyArrayRow.id = 'emptyList';
		emptyArrayRow.className = 'row';
		var emptyCell = document.createElement('td');
		emptyCell.setAttribute('colspan', '3');
		var emptyText = document.createTextNode('The list is empty');
		emptyCell.appendChild(emptyText);
		emptyCell.setAttribute('style', 'text-align: center;');
		emptyArrayRow.appendChild(emptyCell);
		$('.table-body').append(emptyArrayRow);
	};

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

	const submitAnswer = () => {
		var country = $('#pr2__country').text();
		var correctCapital = getCorrectCapital(country);
		console.log(correctCapital);
		var inputCapital = $('#pr2__capital').val();
		var formattedInputCapital = formattedString(inputCapital);
		console.log(inputCapital);
		var isCorrect = formattedInputCapital === correctCapital.toLowerCase();

		userAnswers.push({
			country,
			capital: correctCapital,
			input: inputCapital,
			isCorrect
		});

		// row create
		var newRow = document.createElement('tr');
		newRow.className = `row ${isCorrect ? 'correct' : 'wrong'}`;

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

		// finally display to a user
		newRow.appendChild(countryCell);
		newRow.appendChild(capitalCell);
		newRow.appendChild(answerCell);
		$('.table-body').append(newRow);
	};

	emptyList();

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
	$('#pr2__button').click(function () {
		if ($('#pr2__capital').val() !== '') {
			if (userAnswers.length === 0) {
				$('#emptyList').remove();
			}
			submitAnswer();
			setNewEntry();
		}
	});
	$(document).keydown(function (event) {
		if (event.which === 13) {
			$('#pr2__button').trigger('click');
		}
	});
	// var row = document.createElement('tr');
	// row.className = 'row';
	// var question = document.createElement('td');
	// question.className = 'cell';
});
