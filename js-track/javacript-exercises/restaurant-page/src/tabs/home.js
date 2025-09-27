import backgroundImg from '../assets/img/background.jpg';

export default function createHome() {
    const wrapper = document.createElement('div');
    wrapper.className = 'tab home-tab';

    const heading = document.createElement('h1');
    heading.textContent = 'My Restaurant';
    const tagline = document.createElement('p');
    tagline.textContent = 'Serving vibes, flavor, and dangerously good coffee.';
    const img = document.createElement('img');
    img.src = backgroundImg;
    img.alt = 'Restaurant interior';

    wrapper.append(heading, tagline, img);
    return wrapper;
}
