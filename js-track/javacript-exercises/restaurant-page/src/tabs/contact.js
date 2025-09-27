export default function createContact() {
    const wrapper = document.createElement('div');
    wrapper.className = 'tab contact-tab';

    const heading = document.createElement('h2');
    heading.textContent = 'Contact';

    const phone = document.createElement('p');
    phone.textContent = 'Phone: (555) 123-9876';

    const addr = document.createElement('p');
    addr.textContent = '123 Flavor Street, Taste City';

    const hours = document.createElement('p');
    hours.textContent = 'Open Daily: 8am - 10pm';

    wrapper.append(heading, phone, addr, hours);
    return wrapper;
}
