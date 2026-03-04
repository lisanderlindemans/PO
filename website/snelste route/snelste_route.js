function tekenRooster() {
    const cols = document.getElementById('inputCols').value;
    const rows = document.getElementById('inputRows').value;
    const container = document.getElementById('rooster');

    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    container.innerHTML = '';

    const totaal = cols * rows;
    for (let i = 0; i < totaal; i++) {
        const div = document.createElement('div');
        div.classList.add('cel');
        container.appendChild(div);
    }
}

window.onload = tekenRooster;