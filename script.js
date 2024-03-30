//@ts-check
const MATERIAL_ICONS_CLASS = "material-symbols-outlined";
const app = /**@type {HTMLDivElement}*/ (document.getElementById('app'));
const roomsContainer = document.createElement('div');
roomsContainer.className = 'rooms-container'
const addRoomButton = document.createElement('button');
const searchGuestInput = document.createElement('input');
searchGuestInput.placeholder = 'חפש אורח';
searchGuestInput.type = 'search';



/**
 * 
 * @param {string} name 
 */
function icon(name) {
    const icon = document.createElement('i');
    icon.classList.add(MATERIAL_ICONS_CLASS, 'icon')
    icon.innerText = name;
    return icon;
}


/**
 * @typedef Room
 * @property {string} name
 * @property {number} id
 * @property {Array<string>} guests
 * @property {boolean} isEditing
 */

const rooms = loadRooms();
if (rooms.length) {
    rooms.forEach(renderRoom);
}

function addRoom() {
    const newRoom = {
        name: '',
        id: (rooms[rooms.length - 1]?.id + 1) || 1,
        guests: [],
        isEditing: false
    };
    rooms.push(newRoom);
    if (!searchGuestInput.isConnected) {
        app.insertBefore(searchGuestInput, addRoomButton);
    }
    saveRooms();
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

    if (!room.name || room.isEditing) {
        const inputEl = document.createElement('input');
        inputEl.placeholder = 'שם החדר';
        inputEl.value = room.name || '';
        const acceptNameButton = document.createElement('button');
        acceptNameButton.appendChild(icon('done'))
        acceptNameButton.onclick = e => {
            room.name = inputEl.value;
            room.isEditing = false;
            saveRooms();
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
        roomTitleEl.append(roomNameEl, editButton)

    }
    const deleteButton = document.createElement('button');
    deleteButton.appendChild(icon('delete'))
    deleteButton.title = 'מחק חדר'
    deleteButton.onclick = e => {
        roomEl.remove();
        rooms.splice(rooms.indexOf(room), 1);
        if (!rooms.length) {
            searchGuestInput.remove();
        }
        saveRooms();
    }
    roomTitleEl.appendChild(deleteButton)

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
        saveRooms();
    }
    addGuestButton.innerText = 'הוסף אורח';
    addGuestButton.appendChild(icon('add'));
    roomGuestsEl.append(guestListEl, guestNameInput, addGuestButton);

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

function saveRooms() {
    localStorage.setItem('rooms', JSON.stringify(rooms));
}

/**
 * 
 * @returns {Array<Room>}
 */
function loadRooms() {
    const saved = localStorage.getItem('rooms');
    if (!saved) return [];
    return JSON.parse(saved);
}

addRoomButton.innerText = 'הוסף חדר';
addRoomButton.append(icon('add'));
addRoomButton.onclick = e => addRoom();
searchGuestInput.addEventListener('input', e => {
    const { value } = /**@type {HTMLInputElement}*/(e.target);
    if (!value) {
        rooms.forEach(renderRoom);
        return;
    }
    clearElementContent(roomsContainer);
    const filtered = rooms.filter(room => room.guests.some(guest => guest.includes(value)));
    filtered.forEach(renderRoom);
    filtered.forEach(room => {
        const guestsList = document.getElementById(getRoomElementId(room.id))?.querySelector('.guests-list');
        if (!guestsList) throw new Error('Could not find guests list');
        guestsList.querySelectorAll('li span[data-guest]').forEach(guestTextElement => {
            if (!(guestTextElement instanceof HTMLElement)) throw new Error();
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
            const split = guestName.split(value).map(s => {
                if (!s) { // is a match
                    const strong = document.createElement('strong');
                    strong.innerText = value;
                    return strong;
                }
                const span = document.createElement('span');
                span.innerText = s;
                return span;
            });
            clearElementContent(guestTextElement);
            guestTextElement.append(...split);
        })
    })
})

/**
 * 
 * @param {HTMLElement} element 
 */
function clearElementContent(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}

app.append(rooms.length ? searchGuestInput : '', addRoomButton, roomsContainer)

