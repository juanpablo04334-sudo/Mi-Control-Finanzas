const financeForm = document.getElementById('financeForm');
const transactionList = document.getElementById('transactionList');

const balanceTotal = document.getElementById('balanceTotal');
const totalIncome = document.getElementById('totalIncome');
const totalExpense = document.getElementById('totalExpense');
const savingsRate = document.getElementById('savingsRate');

const heroBalance = document.getElementById('heroBalance');
const heroIncome = document.getElementById('heroIncome');
const heroExpense = document.getElementById('heroExpense');

const legendIncome = document.getElementById('legendIncome');
const legendExpense = document.getElementById('legendExpense');
const legendBalance = document.getElementById('legendBalance');
const movementCount = document.getElementById('movementCount');
const savingGoal = document.getElementById('savingGoal');

const incomeLine = document.getElementById('incomeLine');
const expenseLine = document.getElementById('expenseLine');
const incomeDots = document.getElementById('incomeDots');
const expenseDots = document.getElementById('expenseDots');

const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

let transactions = [
  { description: 'Sueldo mensual', amount: 2200, type: 'income' },
  { description: 'Freelance', amount: 480, type: 'income' },
  { description: 'Alquiler', amount: 700, type: 'expense' },
  { description: 'Supermercado', amount: 210, type: 'expense' },
  { description: 'Internet y servicios', amount: 130, type: 'expense' }
];

function formatCurrency(value){
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

function renderTransactions(){
  transactionList.innerHTML = '';
  transactions.slice().reverse().forEach(tx => {
    const item = document.createElement('article');
    item.className = `tx ${tx.type}`;
    item.innerHTML = `
      <div class="tx-meta">
        <strong>${tx.description}</strong>
        <span>${tx.type === 'income' ? 'Ingreso registrado' : 'Gasto registrado'}</span>
      </div>
      <div class="tx-type">${tx.type === 'income' ? 'Ganancia' : 'Gasto'}</div>
      <div class="tx-amount">${tx.type === 'income' ? '+' : '-'} ${formatCurrency(tx.amount)}</div>
    `;
    transactionList.appendChild(item);
  });
}

function buildPolyline(values, minY, maxY){
  const xStep = 480 / Math.max(values.length - 1, 1);
  const maxVal = Math.max(...values, 1);
  return values.map((val, i) => {
    const x = 20 + xStep * i;
    const y = maxY - ((val / maxVal) * (maxY - minY));
    return `${x},${y.toFixed(1)}`;
  }).join(' ');
}

function buildDots(group, values, color, minY, maxY){
  group.innerHTML = '';
  const xStep = 480 / Math.max(values.length - 1, 1);
  const maxVal = Math.max(...values, 1);
  values.forEach((val, i) => {
    const x = 20 + xStep * i;
    const y = maxY - ((val / maxVal) * (maxY - minY));
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', y.toFixed(1));
    c.setAttribute('r', 5);
    c.setAttribute('fill', color);
    group.appendChild(c);
  });
}

function updateGraph(income, expense){
  const baseIncome = [200, 320, 430, 520, 680, 790, income || 50];
  const baseExpense = [150, 180, 240, 260, 310, 350, expense || 30];

  incomeLine.setAttribute('points', buildPolyline(baseIncome, 40, 180));
  expenseLine.setAttribute('points', buildPolyline(baseExpense, 55, 190));

  buildDots(incomeDots, baseIncome, '#1e9b7b', 40, 180);
  buildDots(expenseDots, baseExpense, '#d98a3d', 55, 190);
}

function updateSummary(){
  const income = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = income - expense;
  const rate = income > 0 ? Math.max(0, ((balance / income) * 100)) : 0;

  balanceTotal.textContent = formatCurrency(balance);
  totalIncome.textContent = formatCurrency(income);
  totalExpense.textContent = formatCurrency(expense);
  savingsRate.textContent = `${rate.toFixed(0)}%`;

  heroBalance.textContent = formatCurrency(balance);
  heroIncome.textContent = formatCurrency(income);
  heroExpense.textContent = formatCurrency(expense);

  legendIncome.textContent = formatCurrency(income);
  legendExpense.textContent = formatCurrency(expense);
  legendBalance.textContent = formatCurrency(balance);

  movementCount.textContent = transactions.length;
  savingGoal.textContent = `${Math.min(100, rate.toFixed(0))}%`;

  updateGraph(income, expense);
}

financeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const description = document.getElementById('description').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  if(!description || isNaN(amount) || amount <= 0) return;

  transactions.push({ description, amount, type });
  financeForm.reset();
  renderTransactions();
  updateSummary();
});

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('taskText').value.trim();
  const priority = document.getElementById('taskPriority').value;

  if(!text) return;

  const labels = {
    high: 'alta',
    medium: 'media',
    low: 'baja'
  };

  const item = document.createElement('label');
  item.className = 'task';
  item.innerHTML = `
    <input type="checkbox" />
    <div>
      <strong>${text}</strong>
      <span>Tarea personalizada para mantener tu organización financiera.</span>
    </div>
    <span class="pill ${priority}">${labels[priority]}</span>
  `;

  taskList.appendChild(item);
  bindTask(item);
  taskForm.reset();
});

function bindTask(task){
  const checkbox = task.querySelector('input[type="checkbox"]');
  checkbox.addEventListener('change', () => {
    task.classList.toggle('done', checkbox.checked);
  });
}

document.querySelectorAll('.task').forEach(bindTask);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

renderTransactions();
updateSummary();
