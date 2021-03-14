const STORAGE_NAME = "devFinances:"
const Modal = {
  divModal: document.querySelector('.modal-overlay'),
  open() {
    Modal.divModal.classList.add('active');
  },
  close() {
    Modal.divModal.classList.remove('active');
  }
}

const DOM = {
  transactionContainer: document.querySelector('#data-table tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.dataset.transaction = transaction.id
    tr.innerHTML = DOM.innerHTMLTransaction(transaction)
    DOM.transactionContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction) {
    const cssClass = transaction.amount > 0 ? "income" : "expense"
    const formattedAmount = Utils.formatCurrency(transaction.amount)
    const content = `<td class="description">${transaction.description}</td>
    <td class="${cssClass}">${formattedAmount}</td>
    <td class="date">${transaction.date}</td>
    <td><img onClick="Transaction.remove(${transaction.id});" src="./assets/minus.svg" alt="Remover transação"></td>`
    return content;
  },
  updateBalance() {
    document.querySelector('#income-display').innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.querySelector('#expense-display').innerHTML = Utils.formatCurrency(Transaction.expenses())
    document.querySelector('#total-display').innerHTML = Utils.formatCurrency(Transaction.balance())
  },
  clearTransaction() {
    DOM.transactionContainer.innerHTML = "";
  }
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';
    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
    return signal + value;
  },
  formatAmount(value) {
    value = value * 100;
    return Math.round(value);
  },
  formatDate(date) {
    if (date.match(/\D\/\D\/\D/))
      return date;
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  }
}

const Storage = {
  get() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_NAME + "transactions"))
    return !stored ? [] : stored;
  },

  set(transactions) {
    localStorage.setItem(STORAGE_NAME + "transactions", JSON.stringify(transactions));
  }
}

const Transaction = {
  all: Storage.get(),
  incomes() {
    if (Transaction.all.length === 0) return 0;
    return Transaction.all.reduce((incomes, income) => {
      return income.amount > 0
        ? incomes + income.amount
        : incomes;
    }, 0)
  },
  expenses() {
    if (Transaction.all.length === 0) return 0;
    return Transaction.all.reduce((incomes = 0, income) => {
      return income.amount < 0
        ? incomes - income.amount
        : incomes;
    }, 0)
  },
  balance() {
    return Transaction.incomes() - Transaction.expenses()
  },
  add(transaction) {
    if (!transaction.hasOwnProperty("amount")) return;
    transaction.id = Math.floor(100000 * Math.random());
    Transaction.all.push(transaction);
    App.reload()
  },
  remove(id) {
    Transaction.all = Transaction.all.filter(item => item.id !== id);
    App.reload()
  }
};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields() {
    const { description, amount, date } = Form.getValues();
    if (description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === "")
      throw new Error("Por favor preencha todos os campos!")

  },
  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);
    return { description, amount, date }
  },
  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },
  submit(event) {
    event.preventDefault();
    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Transaction.add(transaction);
      Form.clearFields();
      Modal.close();
    }
    catch (e) {
      console.log(e)
      alert(e.message)
    }


  }
}
const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction)
    DOM.updateBalance()
    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransaction()
    App.init()
  }
}
App.init();

// Transaction.add({
//   description: 'Luz',
//   amount: -50000,
//   date: '23/01/2021'
// });
// Transaction.add({
//   description: 'Desenvolvimento de Sites',
//   amount: 200000,
//   date: '23/01/2021'
// });
// Transaction.add({
//   description: 'Internet',
//   amount: -20000,
//   date: '23/01/2021'
// });

const btnCancelModal = document.querySelector('button.cancel');
const btnNewTransaction = document.querySelector('button.new');
const form = document.querySelector('form');

btnCancelModal.addEventListener('click', Modal.close);
btnNewTransaction.addEventListener('click', Modal.open);
form.addEventListener('submit', Form.submit)



