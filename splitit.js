/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

// ! LOCAL STORAGE RETRIEVAL   ------------------------------------------------

function retrieveTranslog() {
  const transactionLog = localStorage.getItem('transLog');
  return transactionLog ? JSON.parse(transactionLog) : [];
}

function sortByDate(a, b) {
  if (a.date > b.date) return -1;
  if (a.date < b.date) return 1;
  return 0;
}

function addTransaction(newEntry) {
  const transactionLog = localStorage.getItem('transLog');
  if (transactionLog) {
    const transLog = JSON.parse(transactionLog);
    transLog.push(newEntry);
    transLog.sort(sortByDate);
    localStorage.setItem('transLog', JSON.stringify(transLog));
  } else {
    localStorage.setItem('transLog', JSON.stringify([newEntry]));
  }
}

function removeTransaction(id) {
  const transactionLog = JSON.parse(localStorage.getItem('transLog'));
  const newLog = transactionLog.filter(entry => entry.id !== id);
  localStorage.setItem('transLog', JSON.stringify(newLog));
}

// * END LOCAL STORAGE RETRIEVAL   --------------------------------------------

// ! FORM FIELDS AND VALIDATION   ---------------------------------------------

// > Form access global variables..............................................
const trans = document.querySelector('[name="new-trans"]');
const {
  payer,
  ower,
  amountPaid,
  amountOwed,
  category,
  date,
  note,
  swap,
  half,
} = trans;

// > General Input Validation..................................................
function inputAlert(element, message) {
  if (element.parentElement.classList.contains('input__currency')) {
    element.parentElement.parentElement.querySelector(
      '.input__alert'
    ).textContent = message;
  } else {
    element.parentElement.querySelector('.input__alert').textContent = message;
  }
}

function resetAllAlerts() {
  document.querySelectorAll('.input__alert').forEach(alert => {
    alert.textContent = '';
  });
}

function isFilled(field) {
  if (!field.value) {
    inputAlert(field, 'Required field');
    return false;
  }
  inputAlert(field, '');
  return true;
}

function fieldsAreFilled() {
  const requireds = [amountOwed, amountPaid, category, date];
  const allFilled = [];
  for (const field of requireds) {
    allFilled.push(isFilled(field));
  }
  return !allFilled.includes(false);
}

// > Payer Field...............................................................
function setOpacityAll(elements, opacity) {
  elements.forEach(element => {
    element.style.opacity = opacity;
  });
}

function capitalize(name) {
  return `${name[0].toUpperCase() + name.slice(1)}`;
}

function swapPayerInfo(from, to) {
  const payerPic = document.querySelector('#payer-photo');
  const payerName = document.querySelector('#payer-name');
  const owerPic = document.querySelector('#ower-photo');
  const owerName = document.querySelector('#ower-name');

  payer.value = to;
  payerPic.src = `./${to}.png`;
  payerName.textContent = `${capitalize(to)} Paid:`;

  ower.value = from;
  owerPic.src = `./${from}.png`;
  owerName.textContent = `${capitalize(from)} Owes:`;
}

function switchSides() {
  const sectionHeads = document.querySelectorAll('.section__header');
  setOpacityAll(sectionHeads, 0);
  setTimeout(() => {
    if (payer.value === 'anni') swapPayerInfo('anni', 'derek');
    else swapPayerInfo('derek', 'anni');
    setOpacityAll(sectionHeads, 100);
  }, 250);
}

// > amountPaid / amountOwed Fields............................................
function checkCurrencyFormat(numString) {
  const validation = /^[0-9]\d*(((,\d{3}){1,5})?(\.\d{0,2})?)$/;
  return numString.match(validation);
}

function validateCurrencyInput(field) {
  if (field.value !== '' && !checkCurrencyFormat(field.value)) {
    inputAlert(field, `Please enter valid amount`);
    return false;
  }
  inputAlert(field, ``);
  return true;
}

function cleanNum(numString) {
  if (numString.includes('.')) {
    return numString.replace(/[.,€]/gi, '');
  }
  return `${numString.replace(/[,€]/gi, '')}00`;
}

function compareAmounts() {
  const owed = parseInt(cleanNum(amountOwed.value));
  const paid = parseInt(cleanNum(amountPaid.value));
  if (
    owed > paid &&
    checkCurrencyFormat(amountOwed.value) &&
    checkCurrencyFormat(amountPaid.value)
  ) {
    inputAlert(amountOwed, 'Owed must be less than paid');
    return false;
  }
  return true;
}

function addDecimal(numString, decimal) {
  return `${numString.slice(0, -2)}${decimal}${numString.slice(-2)}`;
}

function formatDisplayNum(numString, seperator = ',', decimal = '.') {
  const withDecimal = numString.includes('.')
    ? numString
    : addDecimal(numString, decimal);
  return withDecimal.replace(/\B(?=(\d{3})+(?!\d))/g, seperator);
}

function fixNumOnBlur(input) {
  const numString = input.value;
  if (numString && checkCurrencyFormat(numString)) {
    const display = formatDisplayNum(cleanNum(numString));
    input.value = display;
  }
  return validateCurrencyInput(input);
}

// > Half Checkbox.............................................................
function halfDisplayNum(numString) {
  const cleanInt = Math.round(parseInt(cleanNum(numString)) / 2);
  return formatDisplayNum(String(cleanInt));
}

function halfOnChecked() {
  if (half.checked && checkCurrencyFormat(amountPaid.value)) {
    amountOwed.value = halfDisplayNum(amountPaid.value);
    isFilled(amountOwed);
    compareAmounts();
  }
}

// > Category and Note Fields..................................................
function isCategoryOther() {
  if (category.value === 'Other' && note.value === '') {
    inputAlert(note, `Provide note for category 'other'`);
    return false;
  }
  inputAlert(note, '');
  return true;
}

function validateNoteInput() {
  if (note.value.match(/<[^>]*>?/gm)) {
    inputAlert(note, `Cannot contain '<'`);
    return false;
  }
  inputAlert(note, '');
  return true;
}

function checkNoteError() {
  return isCategoryOther() && validateNoteInput();
}

// > Date Field................................................................
function addZero(numString) {
  if (String(numString).length === 1) {
    return `0${numString}`;
  }
  return numString;
}

function setCurrentDate() {
  const d = new Date();
  const month = addZero(d.getMonth() + 1);
  const day = addZero(d.getDate());
  date.max = `${d.getFullYear()}-${month}-${day}`;
  date.value = `${d.getFullYear()}-${month}-${day}`;
}

// > Form Reset................................................................
function setFieldsToDefault() {
  for (const item of trans) {
    if (item.type === 'select-one') {
      item.selectedIndex = 0;
    } else {
      item.value = item.defaultValue;
    }
  }
}

function resetForm() {
  resetAllAlerts();
  setFieldsToDefault();
  setCurrentDate();
}

// > Input Listeners............................................................
function setCurrencyBlurListeners() {
  document.querySelectorAll('.input__currency-input').forEach(input => {
    input.addEventListener('blur', () => {
      if (fixNumOnBlur(input) && compareAmounts()) {
        inputAlert(input, '');
      }
      halfOnChecked();
    });
  });
}

function setCategoryOtherListener() {
  category.addEventListener('change', () => {
    isCategoryOther();
    isFilled(category);
  });
}

function setInputListeners() {
  swap.addEventListener('click', switchSides);
  note.addEventListener('blur', checkNoteError);
  half.addEventListener('change', halfOnChecked);
  setCurrencyBlurListeners();
  setCategoryOtherListener();
}

// * END FORM FIELDS AND VALIDATION   -----------------------------------------

// ! TABLES AND DATA HEADERS   ------------------------------------------------

// > Totals Global Variable....................................................
const totals = {
  derekPaid: '€0.00',
  anniPaid: '€0.00',
  derekOwes: '€0.00',
  anniOwes: '€0.00',
};

function totalsToStrings(numObject) {
  for (const key in numObject) {
    numObject[key] = numObject[key] !== 0 ? String(numObject[key]) : 0;
  }
  return numObject;
}

function totalsToNums(stringObject) {
  for (const key in stringObject) {
    stringObject[key] = parseInt(cleanNum(stringObject[key]));
  }
  return stringObject;
}

// > Update Current Ower......................................................
function calculateOwerInfo() {
  const numTotals = totalsToNums(totals);
  if (numTotals.derekOwes > numTotals.anniOwes) {
    return {
      ower: 'Derek',
      payer: 'Anni',
      amount: formatDisplayNum(
        String(numTotals.derekOwes - numTotals.anniOwes)
      ),
    };
  }
  if (numTotals.anniOwes > numTotals.derekOwes) {
    return {
      ower: 'Anni',
      payer: 'Derek',
      amount: formatDisplayNum(
        String(numTotals.anniOwes - numTotals.derekOwes)
      ),
    };
  }
  if (numTotals.anniOwes === numTotals.derekOwes) {
    return {
      ower: 'Even',
      payer: 'Even',
      amount: 0,
    };
  }
}

function updateCurrentOwer() {
  const owerEl = document.querySelector('#ower-info');
  const owerInfo = calculateOwerInfo();
  const msg = `${owerInfo.ower} owes ${owerInfo.payer} €${owerInfo.amount}`;
  if (owerInfo.amount !== 0) {
    owerEl.style.color = 'crimson';
    owerEl.textContent = msg;
  } else {
    owerEl.style.color = 'green';
    owerEl.textContent = 'Even';
  }
}

// > Update Table Summaries....................................................
function calculateTotals() {
  const newTotals = {
    anniPaid: 0,
    derekOwes: 0,
    derekPaid: 0,
    anniOwes: 0,
  };

  const transactionLog = retrieveTranslog();
  if (transactionLog) {
    for (const item of transactionLog) {
      if (item.payer === 'anni') {
        newTotals.anniPaid += parseInt(cleanNum(item.amountPaid));
        newTotals.derekOwes += parseInt(cleanNum(item.amountOwed));
      } else {
        newTotals.derekPaid += parseInt(cleanNum(item.amountPaid));
        newTotals.anniOwes += parseInt(cleanNum(item.amountOwed));
      }
    }
  }

  return totalsToStrings(newTotals);
}

function updateTotals() {
  const { anniPaid, derekPaid, anniOwes, derekOwes } = calculateTotals();

  totals.anniPaid = anniPaid ? `€${formatDisplayNum(anniPaid)}` : `€0.00`;
  totals.derekPaid = derekPaid ? `€${formatDisplayNum(derekPaid)}` : `€0.00`;
  totals.anniOwes = anniOwes ? `€${formatDisplayNum(anniOwes)}` : `€0.00`;
  totals.derekOwes = derekOwes ? `€${formatDisplayNum(derekOwes)}` : `€0.00`;
}

function updateTableSummaries() {
  updateTotals();
  const summBoxes = document.querySelectorAll('.summary-box');
  summBoxes.forEach(box => {
    const amnt = box.querySelector('.summary-box__amount');
    if (box.id === 'anni-paid__total') amnt.textContent = totals.anniPaid;
    if (box.id === 'derek-paid__total') amnt.textContent = totals.derekPaid;
    if (box.id === 'anni-owes__total') amnt.textContent = totals.anniOwes;
    if (box.id === 'derek-owes__total') amnt.textContent = totals.derekOwes;
  });
}

// > Update Data Headers.......................................................
function updateDataHeaders() {
  updateTableSummaries();
  updateCurrentOwer();
}

// > Table Tabs................................................................
function flipActiveTab() {
  const anni = document.querySelector('#anni-tab');
  const derek = document.querySelector('#derek-tab');

  anni.classList.toggle('active');
  derek.classList.toggle('active');
}

function flipHiddenTable() {
  const anni = document.querySelector('#anni-data');
  const derek = document.querySelector('#derek-data');

  if (anni.hidden) {
    anni.hidden = false;
    derek.hidden = true;
  } else {
    anni.hidden = true;
    derek.hidden = false;
  }
}

// > Table Tab Listeners.......................................................
function handleTabClick(tab) {
  if (!tab.classList.contains('active')) {
    flipActiveTab();
    flipHiddenTable();
  }
}

function setTabListeners() {
  const tabs = document.querySelectorAll('.table-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      handleTabClick(tab);
    });
  });
}

// > Make Tables...............................................................
function clearTables() {
  const anniTable = document.querySelector('#anni-table');
  const derekTable = document.querySelector('#derek-table');
  anniTable.innerHTML = '';
  derekTable.innerHTML = '';
}

function makeRow(formData) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td tabindex="0" role="button" data-id="${formData.id}" class="delete-row">
      X
    </td>
    <td>${formData.date}</td>
    <td>${formData.category}</td>
    <td>€${formData.amountPaid}</td>
    <td>€${formData.amountOwed}</td>
    <td>${formData.note}</td>
  `;
  return row;
}

function assignEntry(formData) {
  if (formData.payer === 'anni') {
    const table = document.querySelector('#anni-table');
    table.insertAdjacentElement('beforeend', makeRow(formData));
  } else {
    const table = document.querySelector('#derek-table');
    table.insertAdjacentElement('beforeend', makeRow(formData));
  }
}

function makeTables() {
  const transactionLog = retrieveTranslog();
  if (transactionLog) {
    for (const entry of transactionLog) {
      assignEntry(entry);
    }
  }
}

// > Table Row Listeners.......................................................
function handleDeleteClick(btn) {
  removeTransaction(btn.dataset.id);
  btn.parentElement.remove();
  updateDataHeaders();
}

function setDeleteListeners() {
  const deleteButtons = document.querySelectorAll('.delete-row');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteClick(btn);
    });
  });
}

// > Update Tables.............................................................
function updateTables() {
  clearTables();
  makeTables();
  setDeleteListeners();
}

// * END TABLES AND DATA HEADERS   --------------------------------------------

// ! FORM SUBMISSION AND ON PAGE LOAD   ---------------------------------------

// > Form Submission...........................................................
function generateID() {
  return Math.random()
    .toString(36)
    .substr(2, 5);
}

function retrieveFormData() {
  return {
    id: generateID(),
    payer: payer.value,
    ower: ower.value,
    amountOwed: amountOwed.value,
    amountPaid: amountPaid.value,
    category: category.value,
    note: note.value,
    date: date.value,
  };
}

function formInputsAreValid() {
  return (
    checkNoteError() &&
    compareAmounts() &&
    validateCurrencyInput(amountPaid) &&
    validateCurrencyInput(amountOwed) &&
    fieldsAreFilled()
  );
}

function handleSubmitSuccess() {
  addTransaction(retrieveFormData());
  updateTables();
  updateDataHeaders();
  resetForm();
}

function handleSumbit() {
  const submitAlert = document.querySelector('.submit-container__alert');
  if (formInputsAreValid()) {
    handleSubmitSuccess();
    submitAlert.textContent = '';
  } else {
    submitAlert.textContent = 'Fix marked fields before submission.';
  }
}

function setSubmitListener() {
  trans.addEventListener('submit', e => {
    e.preventDefault();
    handleSumbit();
  });
}

// > All Listeners.............................................................
function setPermanentListeners() {
  setInputListeners();
  setTabListeners();
  setSubmitListener();
}

// > On Page Load..............................................................
function prepPageOnLoad() {
  window.addEventListener('load', () => {
    setCurrentDate();
    updateTables();
    updateDataHeaders();
    setPermanentListeners();
  });
}

prepPageOnLoad();

// * END FORM SUBMISSION AND ON PAGE LOAD  ------------------------------------
