// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.
const ALL = 'all';
const CORRECT = 'correct';
const WRONG = 'wrong';
const EMPTY_LIST = 'emptyList';

var capitals = [];
var userAnswers = [];
const dbRef = database.ref();

$(document).ready(() => {
	// referenced https://stackoverflow.com/a/7431565
	$.ajax({
		type: 'GET',
		url:
			'https://cs374.s3.ap-northeast-2.amazonaws.com/country_capital_geo.csv',
		dataType: 'text',
		success: data => runWeb(data)
	});
});

const fetchData = data => {
	var lines = data.split(/\r\n|\n/);
	pairs = [];
	coordinates = [];

	for (var i = 1; i < lines.length - 1; i++) {
		// first line is header and last line is empty string
		// referenced https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
		let country, capital, lng, lat;
		[country, capital, lng, lat] = lines[i].split(',');
		pairs.push({ country, capital });
		coordinates.push({ country, coordinates: [lng, lat] });
	}

	window.pairs = pairs;
	window.coordinates = coordinates;
};

const runWeb = data => {
	fetchData(data);
	var country_capital_pairs = window.pairs;
	country_capital_pairs.forEach(pair => capitals.push(pair.capital));
	var historySize = 0;

	async function readDatabase() {
		await dbRef
			.child('filter')
			.get()
			.then(snapshot => {
				if (snapshot.exists()) {
					var filterOption = snapshot.val();
					$('#selection').val(filterOption).change();
				}
			});

		await dbRef
			.child('entries')
			.get()
			.then(snapshot => {
				if (snapshot.exists()) {
					userAnswers = snapshot.val();
					refreshTable();
				}
			});
	}

	async function writeEntries() {
		await dbRef.child('entries').set(userAnswers);
	}

	async function getHistorySize() {
		await dbRef
			.child('history')
			.once('value')
			.then(snapshot => {
				let history = snapshot.val();
				historySize = history ? Object.keys(history).length : 0;
			});
	}

	function undoHistory() {
		if (historySize === 0) {
			alert('Nothing to undo');
		} else {
			let historyElement = dbRef.child('history').child(`${historySize}`);
			historySize--;
			historyElement.once('value').then(snapshot => {
				clearTable();
				let object = snapshot.val();
				userAnswers = object.length === 0 ? [] : object.userAnswers;
				writeEntries();
				historyElement.remove();
				refreshTable();
			});
		}
	}

	async function addToHistory() {
		historySize++;
		await dbRef
			.child('history')
			.child(`${historySize}`)
			.set({
				length: userAnswers.length === 0 ? 0 : userAnswers.length,
				userAnswers
			});
	}

	const writeFilter = () => {
		var selectedOption = $('#selection').children('option:selected').val();
		dbRef.child('filter').set(selectedOption);
	};

	const clearTable = () => {
		// referenced https://mkyong.com/jquery/how-to-check-if-an-element-is-exists-in-jquery/#:~:text=In%20jQuery%2C%20you%20can%20use,number%20of%20the%20matched%20elements.&text=To%20check%20if%20an%20element%20which,id%20of%20%E2%80%9Cdiv1%E2%80%9D%20exists.
		while ($(`#${EMPTY_LIST}`).length !== 0) {
			$(`#${EMPTY_LIST}`).remove();
		}
		userAnswers.forEach((_, idx) => {
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
		var countryTextElement = document.createElement('span');
		countryTextElement.className = 'country';
		countryTextElement.appendChild(countryText);
		countryCell.appendChild(countryTextElement);

		countryTextElement.onmouseover = () => {
			while ($('#map').hasClass('country-selected')) {
				$('#map').removeClass('country-selected');
			}
			$(`#${id}`).addClass('light-gray');
			window.mytimeout = setTimeout(() => {
				mapLocateCountry(country);
				$('#map').addClass('country-selected');
			}, 500);
		};

		countryTextElement.onmouseleave = () => {
			$(`#${id}`).removeClass('light-gray');
			clearTimeout(window.mytimeout);
			while ($('#map').hasClass('country-selected')) {
				$('#map').removeClass('country-selected');
			}
		};

		countryCell.onmouseover = () => {
			window.mytimeout = setTimeout(() => {
				map.setZoom(4);
			}, 500);
		};

		countryCell.onmouseleave = () => {
			clearTimeout(window.mytimeout);
		};

		// capital cell with its text
		var capitalCell = document.createElement('td');
		capitalCell.className = `cell ${isCorrect ? '' : 'strikethrough'}`;
		var capitalText = document.createTextNode(
			isCorrect ? correctCapital : inputCapital
		);
		capitalCell.appendChild(capitalText);

		// answer cell with its text or icon
		var answerCell = document.createElement('td');
		var correctAnswerText = document.createTextNode(correctCapital);
		var answerTextElement = document.createElement('span');
		answerTextElement.className = 'answer';
		answerTextElement.appendChild(correctAnswerText);
		answerCell.appendChild(answerTextElement);

		answerTextElement.onmouseover = () => {
			while ($('#map').hasClass('capital-selected')) {
				$('#map').removeClass('capital-selected');
			}
			$(`#${id}`).addClass('light-gray');
			window.mytimeout = setTimeout(() => {
				mapLocateCountry(country);
				$('#map').addClass('capital-selected');
				map.setStyle('mapbox://styles/mapbox/dark-v10');
				map.setZoom(6);
			}, 500);
		};

		answerTextElement.onmouseleave = () => {
			$(`#${id}`).removeClass('light-gray');
			clearTimeout(window.mytimeout);
			while ($('#map').hasClass('capital-selected')) {
				$('#map').removeClass('capital-selected');
			}
			map.setStyle('mapbox://styles/mapbox/satellite-streets-v11');
		};

		var removeButton = document.createElement('button');
		removeButton.className = 'removeButton';
		removeButton.setAttribute('type', 'button');
		removeButton.innerHTML = 'Remove';

		// referenced https://www.codegrepper.com/code-examples/javascript/javascript+create+button+onclick
		removeButton.onclick = () => {
			addToHistory();
			clearTable();
			// referenced https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
			userAnswers.splice(id, 1);
			writeEntries();
			$('#selection').change();
		};
		answerCell.appendChild(removeButton);

		// finally display to a user
		newRow.appendChild(countryCell);
		newRow.appendChild(capitalCell);
		newRow.appendChild(answerCell);
		$('.table-body').append(newRow);
	};

	const refreshTable = () => {
		clearTable();
		var selectedOption = $('#selection').children('option:selected').val();
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
		if (isEmpty) {
			displayEmptyList();
		}
	};

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
	const mapLocateCountry = country => {
		for (var countryCoordinates of window.coordinates) {
			if (countryCoordinates.country === country) {
				map.setCenter(countryCoordinates.coordinates);
			}
		}
	};
	const setNewEntry = () => {
		var pair = getRandomPair();
		$('#pr2__country').text(pair.country);
		$('#pr2__capital').val('').focus();
		mapLocateCountry(pair.country);
	};

	// referenced https://www.tutorialrepublic.com/faq/how-to-get-the-value-of-selected-option-in-a-select-box-using-jquery.php#:~:text=Answer%3A%20Use%20the%20jQuery%20%3Aselected,select%20box%20or%20dropdown%20list.
	$('#selection').change(() => {
		writeFilter();
		refreshTable();
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

		writeEntries();
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
			addToHistory();
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

	const clearDatabase = () => {
		clearTable();
		displayEmptyList();
		userAnswers = [];
		writeEntries();
	};

	$('#pr2__country').hover(
		// referenced https://stackoverflow.com/a/14818451
		event => {
			while ($('#map').hasClass('country-selected')) {
				$('#map').removeClass('country-selected');
			}
			$('#question_row').addClass('light-gray');
			window.mytimeout = setTimeout(function () {
				let country = $(event.target).text();
				mapLocateCountry(country);
				$('#map').addClass('country-selected');
			}, 500);
		},
		() => {
			$('#question_row').removeClass('light-gray');
			clearTimeout(window.mytimeout);
			while ($('#map').hasClass('country-selected')) {
				$('#map').removeClass('country-selected');
			}
		}
	);

	$('body').hover(event => {
		if (!$(event.target).hasClass('country')) {
			while ($('#map').hasClass('country-selected')) {
				$('#map').removeClass('country-selected');
			}
		}
		if (!$(event.target).hasClass('answer')) {
			while ($('#map').hasClass('capital-selected')) {
				$('#map').removeClass('capital-selected');
			}
		}
	});

	async function reset() {
		historySize = 0;
		await dbRef.child('history').set(null);
		setNewEntry();
		clearDatabase();
	}

	$('#pr3__reset').click(() => reset());

	displayEmptyList();
	setNewEntry();
	getHistorySize().then(() => {
		readDatabase();
		$('#pr3__undo').click(() => undoHistory());
		$('#pr3__clear').click(() => {
			addToHistory();
			clearDatabase();
		});
	});
};
