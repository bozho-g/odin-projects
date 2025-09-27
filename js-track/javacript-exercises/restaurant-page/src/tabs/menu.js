export default function createMenu() {
    const wrapper = document.createElement('div');
    wrapper.className = 'tab menu-tab';

    const heading = document.createElement('h2');
    heading.textContent = 'Menu';

    const list = document.createElement('ul');
    const items = [
        { name: 'Espresso', info: 'Rich and bold', price: '$3' },
        { name: 'Avocado Toast', info: 'Sourdough + lime chili', price: '$7' },
        { name: 'House Ramen', info: 'Slow broth, fresh noodles', price: '$12' },
    ];

    items.forEach(i => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${i.name}</strong> - ${i.info} <span class="price">${i.price}</span>`;
        list.appendChild(li);
    });

    wrapper.append(heading, list);
    return wrapper;
}
