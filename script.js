const calorieCounter = document.getElementById('calorie-counter');
const budgetNumberInput = document.getElementById('budget');
const entryDropdown = document.getElementById('entry-dropdown');
const addEntryButton = document.getElementById('add-entry');
const clearButton = document.getElementById('clear');
const output = document.getElementById('output');
let isError = false;

function cleanInputString(str) {
  const regex = /[+-\s]/g;
  return str.replace(regex, '');
}

function isInvalidInput(str) {
  const regex = /\d+e\d+/i;
  return str.match(regex);
}

function addEntry() {
  const targetInputContainer = document.querySelector(`#${entryDropdown.value} .input-container`);
  const entryNumber = targetInputContainer.querySelectorAll('input[type="text"]').length + 1;
  const HTMLString = `
  <label for="${entryDropdown.value}-${entryNumber}-name">Entry ${entryNumber} Name</label>
  <input type="text" id="${entryDropdown.value}-${entryNumber}-name" placeholder="Name" />
  <label for="${entryDropdown.value}-${entryNumber}-calories">Entry ${entryNumber} Calories</label>
  <input
    type="number"
    min="0"
    id="${entryDropdown.value}-${entryNumber}-calories"
    placeholder="Calories"
  />`;
  targetInputContainer.insertAdjacentHTML('beforeend', HTMLString);
}

function calculateCalories(e) {
  e.preventDefault();
  isError = false;

  const breakfastNumberInputs = document.querySelectorAll('#breakfast input[type=number]');
  const lunchNumberInputs = document.querySelectorAll('#lunch input[type=number]');
  const dinnerNumberInputs = document.querySelectorAll('#dinner input[type=number]');
  const snacksNumberInputs = document.querySelectorAll('#snacks input[type=number]');
  const exerciseNumberInputs = document.querySelectorAll('#exercise input[type=number]');

  const breakfastCalories = getCaloriesFromInputs(breakfastNumberInputs);
  const lunchCalories = getCaloriesFromInputs(lunchNumberInputs);
  const dinnerCalories = getCaloriesFromInputs(dinnerNumberInputs);
  const snacksCalories = getCaloriesFromInputs(snacksNumberInputs);
  const exerciseCalories = getCaloriesFromInputs(exerciseNumberInputs);
  const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);

  if (isError) {
    return;
  }

  const consumedCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories + exerciseCalories;
  const remainingCalories = budgetCalories - consumedCalories;
  const surplusOrDeficit = remainingCalories < 0 ? 'Surplus' : 'Deficit';

  let tableRows = `
    <tr>
      <th>Total Breakfast Calories</th>
      <th>Total Lunch Calories</th>
      <th>Total Dinner Calories</th>
      <th>Total Snacks Calories</th>
      <th>Total Exercise Calories</th>
      <th>Overall Calories</th>
      <th>Actions</th>
    </tr>
    <tr>
      <td>${breakfastCalories}</td>
      <td>${lunchCalories}</td>
      <td>${dinnerCalories}</td>
      <td>${snacksCalories}</td>
      <td>${exerciseCalories}</td>
      <td>${consumedCalories}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    </tr>
  `;

  const table = `
  <table>
    <thead>${tableRows}</thead>
    <tbody>
      
    </tbody>
  </table>
  <p class="${surplusOrDeficit.toLowerCase()}">${Math.abs(remainingCalories)} Calorie ${surplusOrDeficit}</p>
  `;

  output.innerHTML = table;
  output.classList.remove('hide');

  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', deleteRow);
  });

  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', updateRow);
  });

  calorieCounter.addEventListener("submit", calculateCalories);
}

function updateRow(event) {
  const columnToEdit = parseInt(prompt("Enter the column number to edit (1-5):"), 10);

  if (columnToEdit >= 1 && columnToEdit <= 5) {
    const newValue = parseInt(prompt("Enter new value:"), 10);

    if (!isNaN(newValue)) {
      const row = event.target.closest('tr');
      const cells = row.querySelectorAll('td');
      const oldValue = parseInt(cells[columnToEdit - 1].textContent, 10);

      cells[columnToEdit - 1].textContent = newValue;

      let consumedCalories = parseInt(cells[5].textContent, 10) - oldValue + newValue;
      cells[5].textContent = consumedCalories;

      const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);
      const remainingCalories = budgetCalories - consumedCalories;
      const surplusOrDeficit = remainingCalories < 0 ? 'Surplus' : 'Deficit';

      output.querySelector('p').textContent = `${Math.abs(remainingCalories)} Calorie ${surplusOrDeficit}`;
    } else {
      alert("Invalid input. Please enter a valid number.");
    }
  } else {
    alert("Invalid column number. Please enter a number between 1 and 5.");
  }
}

function deleteRow(event) {
  const confirmation = confirm("Are you sure you want to delete this row?");
  if (confirmation) {
    const row = event.target.closest('tr');
    row.remove();
  }
}

function getItemsAndCaloriesFromInputs(nameInputs, caloriesInputs) {
  const items = [];
  let totalCalories = 0;

  nameInputs.forEach((nameInput, index) => {
    const name = nameInput.value.trim();
    const calories = parseInt(caloriesInputs[index].value.trim(), 10);

    if (name !== '' && !isNaN(calories)) {
      items.push({ name, calories });
      totalCalories += calories;
    } else {
      isError = true;
      alert('Please fill in both name and calories for each item.');
    }
  });

  return { items, totalCalories };
}


function getCaloriesFromInputs(list) {
  let calories = 0;

  for (const item of list) {
    const currVal = cleanInputString(item.value);
    const invalidInputMatch = isInvalidInput(currVal);

    if (invalidInputMatch) {
      alert(`Invalid Input: ${invalidInputMatch[0]}`);
      isError = true;
      return null;
    }
    calories += Number(currVal);
  }
  return calories;
}

function clearForm() {
  const inputContainers = Array.from(document.querySelectorAll('.input-container'));

  for (const container of inputContainers) {
    container.innerHTML = '';
  }

  budgetNumberInput.value = '';
  output.innerText = '';
  output.classList.add('hide');
}

addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalories);
clearButton.addEventListener("click", clearForm);