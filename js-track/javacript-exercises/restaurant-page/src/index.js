import createHome from './tabs/home.js';
import createMenu from './tabs/menu.js';
import createContact from './tabs/contact.js';

const tabFactories = {
    home: createHome,
    menu: createMenu,
    contact: createContact,
};

const content = document.getElementById('content');
const nav = document.querySelector('nav');

function clearContent() {
    content.innerHTML = '';
}

function setActiveButton(name) {
    [...nav.querySelectorAll('button')].forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === name);
    });
}

function loadTab(name) {
    const factory = tabFactories[name];
    if (!factory) return;
    clearContent();
    content.appendChild(factory());
    setActiveButton(name);
}

nav.addEventListener('click', e => {
    if (e.target.matches('button[data-tab]')) {
        loadTab(e.target.dataset.tab);
    }
});

loadTab('home');
