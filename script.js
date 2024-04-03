//@ts-check
const BASE_URL = location.href.startsWith('https')
    ? location.origin + location.pathname.slice(0, location.pathname.slice(1).indexOf('/') + 1) + '/'
    : '/';
const app = /**@type {HTMLDivElement}*/ (document.getElementById('app'));
const roomsContainer = document.createElement('div');
roomsContainer.className = 'rooms-container'
const addRoomButton = document.createElement('button');
const searchGuestInput = document.createElement('input');
searchGuestInput.placeholder = 'חפש אורח';
searchGuestInput.type = 'search';


const iconsFileNamesMap = {
    add: 'add_FILL0_wght400_GRAD0_opsz24.svg',
    delete: 'delete_FILL0_wght400_GRAD0_opsz24.svg',
    edit: 'edit_FILL0_wght400_GRAD0_opsz24.svg',
    done: 'done_FILL0_wght400_GRAD0_opsz24.svg',
    lock: 'lock_FILL0_wght400_GRAD0_opsz24.svg',
    unlock: 'lock_open_FILL0_wght400_GRAD0_opsz24.svg',
    menu: 'menu_FILL0_wght400_GRAD0_opsz24.svg',
    download: "download_FILL0_wght400_GRAD0_opsz24.svg",
    upload: "upload_file_FILL0_wght400_GRAD0_opsz24.svg"
}

const iconCache = new Map();


/**
 * 
 * @param {keyof typeof iconsFileNamesMap} name 
*/
function icon(name) {
    const icon = document.createElement('i');
    icon.className = 'icon';
    if (!iconCache.has(name)) {
        const fileName = iconsFileNamesMap[name];
        fetch(BASE_URL + 'assets/icons/' + fileName).then(res => {
            if (!res.ok) {
                icon.innerText = name;
                return;
            }
            res.text().then(html => {
                icon.innerHTML = html
                iconCache.set(name, html);
            });
        })
    } else {
        icon.innerHTML = iconCache.get(name);
    }
    return icon;
}


/**
 * @typedef Room
 * @property {string} name
 * @property {number} id
 * @property {Array<string>} guests
 * @property {boolean} isEditing
*/
const appState = loadAppState()
renderRooms();

function renderRooms() {
    clearElementContent(roomsContainer);
    appState.rooms.forEach(renderRoom);
}

function addRoom() {
    const newRoom = {
        name: '',
        id: (appState.rooms[appState.rooms.length - 1]?.id + 1) || 1,
        guests: [],
        isEditing: false
    };
    appState.rooms.push(newRoom);
    if (!searchGuestInput.isConnected) {
        app.insertBefore(searchGuestInput, addRoomButton);
    }
    saveState();
    renderRoom(newRoom);
}

/**
 * 
 * @param {Room} room 
*/
function renderRoom(room) {
    const roomEl = document.createElement('div');
    const roomTitleEl = document.createElement('div');
    const roomGuestsEl = document.createElement('div');

    roomEl.id = getRoomElementId(room.id);
    roomEl.className = 'room';
    roomTitleEl.className = 'title';
    roomGuestsEl.className = 'guests'

    if (!room.name || room.isEditing && !appState.isLocked) {
        const inputEl = document.createElement('input');
        inputEl.placeholder = 'שם החדר';
        inputEl.value = room.name || '';
        const acceptNameButton = document.createElement('button');
        acceptNameButton.appendChild(icon('done'))
        acceptNameButton.onclick = e => {
            room.name = inputEl.value;
            room.isEditing = false;
            saveState();
            renderRoom(room);
        };
        roomTitleEl.append(inputEl, acceptNameButton);

    } else {
        const roomNameEl = document.createElement('span');
        const editButton = document.createElement('button');
        editButton.appendChild(icon('edit'))
        editButton.onclick = e => {
            room.isEditing = true;
            renderRoom(room);
        }
        roomNameEl.innerText = room.name;
        roomTitleEl.append(roomNameEl, appState.isLocked ? '' : editButton)

    }
    const deleteButton = document.createElement('button');
    deleteButton.appendChild(icon('delete'))
    deleteButton.title = 'מחק חדר'
    deleteButton.onclick = e => {
        roomEl.remove();
        appState.rooms.splice(appState.rooms.indexOf(room), 1);
        if (!appState.rooms.length) {
            searchGuestInput.remove();
        }
        saveState();
    }
    if (!appState.isLocked) {
        roomTitleEl.appendChild(deleteButton)
    }

    const guestListEl = document.createElement('ul');
    guestListEl.className = 'guests-list';
    guestListEl.append(...room.guests.map(guest => {
        const li = document.createElement('li');
        const text = document.createElement('span');
        text.dataset.guest = guest;
        text.innerText = guest;
        li.append(text);
        return li;
    }))
    const guestNameInput = document.createElement('input');
    guestNameInput.placeholder = 'שם האורח';
    const addGuestButton = document.createElement('button');
    addGuestButton.onclick = e => {
        if (!guestNameInput.value) return;
        room.guests.push(guestNameInput.value);
        renderRoom(room);
        saveState();
    }
    addGuestButton.innerText = 'הוסף אורח';
    addGuestButton.appendChild(icon('add'));
    if (!appState.isLocked) {
        roomGuestsEl.append(guestListEl, guestNameInput, addGuestButton);
    } else {
        roomGuestsEl.append(guestListEl);
    }

    roomEl.append(roomTitleEl, roomGuestsEl);

    const existingRoom = document.getElementById(getRoomElementId(room.id));

    if (existingRoom) {
        existingRoom.replaceWith(roomEl);
        return;
    }
    roomsContainer.append(roomEl);
}

/**
 * 
 * @param {number} roomId 
*/
function getRoomElementId(roomId) {
    return 'room-' + roomId;
}

function saveState() {
    localStorage.setItem('appState', JSON.stringify(appState));
}

/**
 * 
 * @returns {{rooms: Room[], isLocked: boolean}}
*/
function loadAppState() {
    const saved = localStorage.getItem('appState');
    if (!saved) return {
        rooms: [],
        isLocked: false
    };
    return JSON.parse(saved);
}

addRoomButton.innerText = 'הוסף חדר';
addRoomButton.append(icon('add'));
addRoomButton.onclick = e => addRoom();
searchGuestInput.addEventListener('input', e => {
    const { value } = /**@type {HTMLInputElement}*/(e.target);
    if (!value) {
        appState.rooms.forEach(renderRoom);
        return;
    }
    clearElementContent(roomsContainer);
    const filtered = appState.rooms.filter(room => room.guests.some(guest => guest.includes(value)));
    filtered.forEach(renderRoom);
    filtered.forEach(room => {
        const guestsList = document.getElementById(getRoomElementId(room.id))?.querySelector('.guests-list');
        if (!guestsList) throw new Error('Could not find guests list');
        guestsList.querySelectorAll('li span[data-guest]').forEach(guestTextElement => {
            if (!(guestTextElement instanceof HTMLElement)) throw new Error('A guest element is not HtmlElement');
            const guestName = guestTextElement.dataset.guest ?? '';
            if (!guestName.includes(value)) {
                clearElementContent(guestTextElement);
                guestTextElement.innerText = guestName;
                return;
            }
            if (guestName === value) {
                clearElementContent(guestTextElement);
                const strong = document.createElement('strong');
                strong.innerText = value;
                guestTextElement.appendChild(strong);
                return;
            }
            const matches = [...guestName.matchAll(new RegExp(value, 'g'))];
            clearElementContent(guestTextElement);

            matches.forEach((match, index) => {
                const [matchValue] = match;
                const { index: matchIndex, length: matchLength } = match;
                const prevMatchEndIndex = index > 0
                    ? (matches[index - 1].index || 0) + matches[index - 1][0].length
                    : 0;
                const prev = guestName.slice(prevMatchEndIndex, matchIndex);
                const normal = document.createTextNode(prev);
                const strong = document.createElement('strong');
                strong.innerText = matchValue;
                guestTextElement.append(normal, strong);
            })
            const lastMatch = matches[matches.length - 1];
            if (lastMatch.index || 0 + lastMatch[0].length < guestName.length) {
                const normal = document.createTextNode(guestName.slice((lastMatch.index || 0) + lastMatch[0].length));
                guestTextElement.append(normal);
            }

        })
    })
})

/**
 * 
 * @param {Node} element 
*/
function clearElementContent(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}

function exportData() {
    const data = appState;
    const json = JSON.stringify(data);
    const buffer = new Blob([...json], { type: 'text/plain' });
    const dataURl = URL.createObjectURL(buffer)
    const link = document.createElement('a');
    link.href = dataURl;
    link.download = "room-management" + new Date().toLocaleDateString() + '.txt';
    link.click();
    URL.revokeObjectURL(dataURl);

}

/**
 * 
 * @param {File} file 
 * @returns {Promise<Partial<typeof appState>>}
 */
async function loadDataFromFile(file) {
    const data = await file.text();
    return JSON.parse(data);
}







document.body.addEventListener('dragenter', e => {
    e.stopPropagation();
    e.preventDefault();
    document.body.classList.add('dragging')
})

document.body.addEventListener('dragleave', e => {
    e.stopPropagation();
    e.preventDefault();
    if (e.target !== document.body) return;
    document.body.classList.remove('dragging')
})

document.body.addEventListener('drop', e => {
    document.body.classList.remove('dragging');
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    loadDataFromFile(file).then(res => {
        const props = Object.keys(res);
        props.forEach(key => {
            appState[key] = res[key] ?? appState[key];
        })
        renderRooms();
    })
})

function createFloatingMenu() {
    /**@type {Array<{className: string, onclick: (event: MouseEvent) => void, icon: keyof typeof iconsFileNamesMap}>} */
    const menuItems = [
        {
            className: '',
            icon: appState.isLocked ? 'unlock' : 'lock',
            onclick: e => {
                const currentButton = /**@type {HTMLButtonElement}*/(e.currentTarget);
                clearElementContent(currentButton);
                appState.isLocked = !appState.isLocked;
                currentButton.append(icon(appState.isLocked ? 'unlock' : 'lock'))
                saveState();
                renderRooms();
            }
        },
        {
            className: '',
            icon: 'download',
            onclick: e => {
                exportData();
            }
        },
        {
            className: '',
            icon: 'upload',
            onclick: e => {
                const input = document.createElement('input');
                input.type = 'file';
                input.click();
                const [file] = input.files || [];
                if (!file) return;
                loadDataFromFile(file).then(res => {
                    const props = Object.keys(res);
                    props.forEach(key => {
                        appState[key] = res[key] ?? appState[key];
                    })
                    renderRooms();
                })
            }
        }
    ];

    const floatingMenu = document.createElement('button');
    floatingMenu.className = 'fab-menu';
    floatingMenu.append(icon('menu'));
    floatingMenu.onclick = e => {
        if (!(floatingMenu === e.currentTarget)) return;
        floatingMenu.classList.toggle('open');
    }

    const menuItemsContainer = document.createElement('div');
    menuItemsContainer.className = 'fab-menu-items-container';
    menuItemsContainer.append(...menuItems.map((item, index) => {
        const itemButton = document.createElement('button');
        itemButton.onclick = item.onclick;
        itemButton.classList.add('fab-menu-item');
        const totalDelay = 20 * menuItems.length;
        itemButton.style.transitionDelay = (totalDelay - ((index) * 20)) + 'ms'
        if (item.className) {
            itemButton.classList.add(item.className);
        }
        itemButton.append(icon(item.icon));
        return itemButton;
    }))
    floatingMenu.append(menuItemsContainer);

    return floatingMenu;
}

app.append(appState.rooms.length ? searchGuestInput : '', addRoomButton, roomsContainer, createFloatingMenu())

