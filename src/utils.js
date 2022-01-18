const removeElement = (querySelector) => document.querySelector(querySelector)?.parentNode?.removeChild(document.querySelector(querySelector));

const isAdmin = () => admId === roomData.admId;

const hasDiffTimeVideo = (timeVideoFirebase) => {
  // diffTime === 0 = videos igualmente no mesmo time
  // diffTime > 0 = video desse usuario está mais para frente que o do parceiro
  // diffTime < 0 = video do parceiro está mais para frente
  const diffTime = (video?.currentTime - timeVideoFirebase);

  return diffTime >= 0.10 || diffTime <= -0.10;
}

const isWatchingVideo = () => window.location.href.includes('watch');

const itsOnSameLink = (link) => {
  const videoId = link.split('watch')[1] ?? '';
  const currentVideoId = window.location.href.split('watch')?.[1] ?? null;

  return !!videoId.includes(currentVideoId);
};

const createButton = (id, label, classList, onClick) => {
  const button = document.createElement('button');

  button.setAttribute('id', id);
  button.classList.add(`btn`, ...classList);
  button.innerHTML = label;
  button.addEventListener('click', onClick);
  return button;
}

const createCheckbox = (label) => {
  const container = document.createElement('div');
  container.classList.add('checkbox-container');

  const checkboxContainer = document.createElement('div');
  checkboxContainer.setAttribute(`id`, 'checkboxContainer');
  checkboxContainer.classList.add('checkbox', 'style-scope', 'tp-yt-paper-checkbox');

  const checkbox = document.createElement('div');
  checkbox.setAttribute(`id`, 'checkbox');
  checkbox.classList.add('style-scope', 'tp-yt-paper-checkbox');
  checkboxContainer.addEventListener('click', () => {
    const isChecked = checkbox.classList.contains('checked');
    if (isChecked) {
      checkbox.classList.remove('checked');
      checkmark.classList.add('hidden');
    } else {
      checkbox.classList.add('checked');
      checkmark.classList.remove('hidden');
    }
  });

  const checkmark = document.createElement('div');
  checkmark.setAttribute(`id`, 'checkmark');
  checkmark.classList.add('hidden', 'style-scope', 'tp-yt-paper-checkbox');

  const labelElement = document.createElement('p');
  labelElement.classList.add('text');
  labelElement.innerHTML = label;

  checkbox.appendChild(checkmark);
  checkboxContainer.appendChild(checkbox);
  container.appendChild(checkboxContainer);
  container.appendChild(labelElement);

  return container;
}
