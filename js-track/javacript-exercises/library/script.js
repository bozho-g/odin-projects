const addBtn = document.querySelector('.open-button');
const closeBtn = document.querySelector('.cancel');
const form = document.querySelector('.form-container');
const popup = document.querySelector('.form-popup');
const libraryDiv = document.querySelector('.container');

const library = loadLibrary();

function loadLibrary() {
    const storedLibrary = localStorage.getItem('library');
    return storedLibrary ? JSON.parse(storedLibrary) : [];
}

function persist() {
    localStorage.setItem('library', JSON.stringify(library));
}

class Book {
    constructor(name, author, pages, isRead) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.author = author;
        this.pages = pages;
        this.isRead = isRead;
    }
}

function toggleForm(show) {
    popup.style.display = show ? 'flex' : 'none';
    form.reset();
}

function createBookElement(book) {
    const bookDiv = document.createElement('div');
    bookDiv.classList.add('book');
    bookDiv.dataset.id = book.id;

    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = book.name;

    const author = document.createElement('p');
    author.textContent = `Author: ${book.author}`;

    const pages = document.createElement('p');
    pages.textContent = `Pages: ${book.pages}`;

    const status = document.createElement('p');
    status.textContent = `Status: ${book.isRead ? 'Read' : 'Not Read'}`;

    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('btn', 'toggle-read');
    toggleBtn.type = 'button';
    toggleBtn.textContent = 'Toggle Read';

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('btn', 'remove-book');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';

    bookDiv.append(title, author, pages, status, toggleBtn, removeBtn);
    bookDiv.addEventListener('click', bookActions);

    return bookDiv;
}

function refresh() {
    persist();
    displayBooks();
}

function displayBooks() {
    libraryDiv.innerHTML = '';

    library.forEach(book => {
        libraryDiv.appendChild(createBookElement(book));
    });
}

function bookActions(e) {
    if (e.target.nodeName !== 'BUTTON') {
        return;
    }

    const bookId = e.target.parentElement.dataset.id;

    if (e.target.classList.contains('toggle-read')) {
        const book = library.find(b => b.id === bookId);
        book.isRead = !book.isRead;
    }

    if (e.target.classList.contains('remove-book')) {
        const bookIndex = library.findIndex(b => b.id === bookId);
        library.splice(bookIndex, 1);
    }

    refresh();
}

const validators = {
    name: (value) => value.trim() !== "" || "Title is required",
    author: (value) => value.trim() !== "" || "Author is required",
    pages: (value) => {
        if (value.trim() === "") return "Pages are required";
        if (parseInt(value) < 1) return "Pages must be at least 1";
        return true;
    }
};

function validateField(input) {
    const rule = validators[input.name];
    if (!rule) return true;

    const result = rule(input.value);
    const errorEl = document.getElementById(`${input.name}-error`);

    if (result === true) {
        input.classList.remove("invalid");
        input.classList.add("valid");
        if (errorEl) errorEl.textContent = "";
        return true;
    } else {
        input.classList.remove("valid");
        input.classList.add("invalid");
        if (errorEl) errorEl.textContent = result;
        return false;
    }
}

form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => validateField(input));
});

function addBook(e) {
    e.preventDefault();
    const data = new FormData(form);

    let allValid = true;
    form.querySelectorAll("input").forEach((input) => {
        if (!validateField(input)) allValid = false;
    });

    if (!allValid) {
        return;
    }

    library.push(
        new Book(
            data.get('name'),
            data.get('author'),
            data.get('pages'),
            data.get('isRead') === 'on'
        )
    );

    refresh();
    toggleForm(false);
    form.reset();
}

function addSampleBooks() {
    library.push(
        new Book('The Hobbit', 'J.R.R. Tolkien', 310, true),
        new Book('1984', 'George Orwell', 328, false),
        new Book('To Kill a Mockingbird', 'Harper Lee', 281, true)
    );
    persist();
};

if (library.length === 0) {
    addSampleBooks();
}

document.addEventListener('DOMContentLoaded', displayBooks);
addBtn.addEventListener('click', () => toggleForm(true));
closeBtn.addEventListener('click', () => toggleForm(false));
form.addEventListener('submit', addBook);