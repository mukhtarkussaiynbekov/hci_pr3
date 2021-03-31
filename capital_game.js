// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.

$(document).ready(function () {
	var country_capital_pairs = pairs;

	var previousSelections = [];

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
	emptyList();
	// previousSelections.forEach()

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
