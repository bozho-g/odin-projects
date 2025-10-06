import { fetchCitySuggestions } from "./api.js";

export function initDropdown({ form, input, list, onSelect, debounce = 300 }) {
    let debounceTimeout;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const selected = list.querySelector('button.selected');

        if (selected) {
            triggerSelect(selected);
        }
    });

    input.addEventListener('keyup', (e) => {
        if (e.keyCode === 40 || e.keyCode === 38) {
            return;
        }

        let prefix = e.target.value;
        clearTimeout(debounceTimeout);

        if (prefix && prefix.length >= 3) {
            debounceTimeout = setTimeout(async () => {
                try {
                    const suggestions = await fetchCitySuggestions(prefix);
                    renderList(suggestions);
                } catch (error) {
                    console.log(error);
                }

            }, debounce);
        } else {
            hide();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.keyCode === 40 || e.keyCode === 38) {
            e.preventDefault();
            selectChosenButton(e.keyCode === 38 ? -1 : 1);
        } else if (e.key === 'Enter') {
            const selected = list.querySelector('button.selected');
            if (selected) {
                e.preventDefault();
                triggerSelect(selected);
            }
        }
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
            if (!list.contains(document.activeElement)) {
                hide(true);
            }
        }, 0);
    });

    input.addEventListener('focus', () => {
        if (list.innerHTML.trim() !== "") {
            show();
        }
    });

    list.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-latitude]');
        if (btn) {
            triggerSelect(btn);
        }
    });

    function selectChosenButton(direction) {
        const buttons = Array.from(document.querySelectorAll('button[data-latitude]'));
        const currentlySelected = document.querySelector('.selected');

        const currentlySelectedIndex = buttons.findIndex(x => x === currentlySelected);

        currentlySelected.classList.remove('selected');
        buttons[(currentlySelectedIndex + direction + buttons.length) % buttons.length].classList.add('selected');
    }

    function triggerSelect(btn) {
        const latitude = btn.dataset.latitude;
        const longitude = btn.dataset.longitude;
        const location = btn.dataset.location;
        onSelect({ lat: latitude, lon: longitude, location });
        clear();
        hide(true);
    }

    function renderList(items) {
        list.innerHTML = "";

        if (items.length === 0) {
            list.innerHTML += `
            <li class="no-results">
            <span>No results found</span>
            </li>
            `;

            show();
            return;
        }

        list.innerHTML = items.map((obj, index) => `
         <li>
                    <button type="button" ${index === 0 ? 'class="selected"' : ''} data-latitude="${obj.latitude}" data-longitude="${obj.longitude}" data-location="${obj.city}, ${obj.country}">
                        <div class="locationItem">
                            <div class="cityName">${obj.city}</div>
                            <div class="regionName">${obj.region}, ${obj.country}</div>
                        </div>
                    </button>
                </li>
        `).join("");

        show();
    }

    function clear() {
        form.reset();
        list.innerHTML = "";
    }

    function show() {
        list.classList.add('shown');
    }

    function hide(clearList = false) {
        list.classList.remove('shown');
        if (clearList) list.innerHTML = "";
    }
}