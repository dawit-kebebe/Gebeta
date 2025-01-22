import '../css/style.global.css';
import './SpinnerFullScreen.css';
import './WinnerMenu.css';

interface WinnerMenuProps {
    title: string;
    message: string;
    onClose: () => void;
}

function WinnerMenu({ title, message, onClose }: WinnerMenuProps) {
    const container = document.createElement('div');
    container.classList.add('winner-menu-container');

    const header = document.createElement('h2');
    header.classList.add('title');
    header.classList.add('open-sans-500');
    header.textContent = title;

    const description = document.createElement('p');
    description.classList.add('description');
    description.classList.add('open-sans-300');
    description.innerHTML = message;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const closeButton = document.createElement('button');
    closeButton.classList.add('btn');
    closeButton.classList.add('btn-primary');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', onClose);

    buttonContainer.appendChild(closeButton);
    container.append(header, description, buttonContainer);

    return container;
}

export { WinnerMenu };