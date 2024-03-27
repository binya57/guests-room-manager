const app = document.getElementById('app');
const roomsContainer = document.createElement('div');
const addRoomButton = document.createElement('button');
const searchGuestInput = document.createElement('input');

/**
 * @typedef Room
 * @property {string} name
 * @property {number} id
 * @property {Array<string>} guests
 */

const rooms = loadRooms();
if (rooms.length) {
    rooms.forEach(renderRoom);
}

function addRoom() {
    const newRoom = {
        name: '',
        id: (rooms[rooms.length - 1]?.id + 1) || 1,
        guests: []
    };
    rooms.push(newRoom);
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

    if (room.name) {
        // roomTitleEl.innerText = room.name;        
        const roomNameEl = document.createElement('span');
        const editButton = document.createElement('button');
        editButton.innerText = 'edit';
        editButton.onclick = e => {
            roomTitleEl.innerHTML = '';
            const inputEl = document.createElement('input');
            inputEl.value = room.name;
            const acceptNameButton = document.createElement('button');
            acceptNameButton.innerText = 'V'
            acceptNameButton.onclick = e => {
                const existingRoom = rooms.find(r => r.id === room.id);
                existingRoom.name = inputEl.value;
                roomTitleEl.innerHTML = '';
                roomTitleEl.innerText = inputEl.value;
                saveRooms();
                renderRoom(existingRoom);
            };
            roomTitleEl.append(inputEl, acceptNameButton);
        }
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'delete';
        deleteButton.onclick = e => {
            roomEl.remove();
            rooms.splice(rooms.indexOf(room), 1);
            saveRooms();
        }
        roomNameEl.innerText = room.name;
        roomTitleEl.append(roomNameEl, editButton, deleteButton)
    } else {
        const inputEl = document.createElement('input');
        const acceptNameButton = document.createElement('button');
        acceptNameButton.innerText = 'V'
        acceptNameButton.onclick = e => {
            const existingRoom = rooms.find(r => r.id === room.id);
            existingRoom.name = inputEl.value;
            roomTitleEl.innerHTML = '';
            roomTitleEl.innerText = inputEl.value;
            saveRooms();
            renderRoom(existingRoom);
        };
        roomTitleEl.append(inputEl, acceptNameButton);
    }

    const guestListEl = document.createElement('ul');
    guestListEl.className = 'guests';
    guestListEl.append(...room.guests.map(guest => {
        const li = document.createElement('li');
        li.dataset.guest = guest;
        li.innerText = guest;
        return li;
    }))
    const guestNameInput = document.createElement('input');
    const addGuestButton = document.createElement('button');
    addGuestButton.onclick = e => {
        if (!guestNameInput.value) return;
        room.guests.push(guestNameInput.value);
        guestNameInput.value = '';
        guestListEl.innerHTML = '';
        guestListEl.append(...room.guests.map(guest => {
            const li = document.createElement('li');
            li.dataset.guest = guest;
            li.innerText = guest;
            return li;
        }))
        saveRooms();
    }
    addGuestButton.innerText = 'Add Guest';
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

addRoomButton.innerText = 'Add Room'
addRoomButton.onclick = e => addRoom();
searchGuestInput.addEventListener('input', e => {
    const { value } = e.target;
    if (!value) {
        rooms.forEach(renderRoom);
        return;
    }
    const filteredRooms = rooms.filter(r => r.guests.some(g => g.includes(value)));
    filteredRooms.forEach(room => {
        const guestsList = document.getElementById(getRoomElementId(room.id)).querySelector('.guests');
        guestsList.childNodes.forEach(guestNode => {
            const clone = guestNode.cloneNode(false);
            if (clone.dataset.guest.includes(value)) {
                const split = clone.dataset.guest.split(value).map(s => {
                    const span = document.createElement('span');
                    span.innerText = s;
                    return span;
                });
                const strong = document.createElement('strong');
                strong.innerText = value;
                clone.appendChild(split[0]);
                clone.appendChild(strong);
                clone.appendChild(split[1]);

            } else {
                const text = document.createTextNode(clone.dataset.guest);
                clone.appendChild(text);
            }
            guestNode.replaceWith(clone);
        })
    })
})
app.append(searchGuestInput, roomsContainer, addRoomButton)

