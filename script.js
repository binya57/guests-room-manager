// @ts-check
const BASE_URL = location.href.startsWith('https')
    ? location.origin + location.pathname.slice(0, location.pathname.slice(1).indexOf('/') + 1) + '/'
    : '/';

const iconsFileNamesMap = {
    add: 'add_FILL0_wght400_GRAD0_opsz24.svg',
    delete: 'delete_FILL0_wght400_GRAD0_opsz24.svg',
    edit: 'edit_FILL0_wght400_GRAD0_opsz24.svg',
    done: 'done_FILL0_wght400_GRAD0_opsz24.svg',
    lock: 'lock_FILL0_wght400_GRAD0_opsz24.svg',
    unlock: 'lock_open_FILL0_wght400_GRAD0_opsz24.svg',
    menu: 'menu_FILL0_wght400_GRAD0_opsz24.svg',
    download: "download_FILL0_wght400_GRAD0_opsz24.svg",
    upload: "upload_file_FILL0_wght400_GRAD0_opsz24.svg",
    help: "help_FILL0_wght400_GRAD0_opsz24.svg"
}
const iconCache = new Map();
/**
 * 
 * @param {keyof typeof iconsFileNamesMap} name 
*/
function icon(name) {
    const icon = el('i', {className: 'icon'});    
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

const rooms = [
    {
        name: `אורחים א'`, guests: [
            'נעמה',
            'אברהם',
            'מרים',
            'שלמה',
        ]
    },
    {
        name: `אורחים ב'`, guests: [
            'אביטל',
            'חנה',
            'איילה',            
        ]
    },
    {
        name: `קליניקה`, guests: [
            'רות',
            'שרית',
            'שני',            
            'יעל',            
        ]
    },
    {
        name: `בייסמנט`, guests: [
            'אבישי',
            'תהילה',
            'נעמי',            
        ]
    },
    {
        name: `עליית גג חדר ראשון`, guests: [
            'נועה',
            'אלכס',
            'טליה',            
            'איילת',            
        ]
    },
]


const app = document.getElementById('app');
const appBody = el('section', {className: 'appBody'});
app?.appendChild(appBody);

function createInput() {
    const input = el('input', {
        type: 'search',
        placeholder: 'מה שמך?',
        oninput() {
            const value = input.value;
            const results = [];
            if (value !== "") {
                rooms.forEach(room => {                    
                    const guests = room.guests.filter(guest => {
                        return guest.search(new RegExp(value)) > -1
                    });
                    if (guests.length) {
                        results.push(...guests.map(guest => ({ guestName: guest, roomName: room.name })))
                    }
                });
            }
            createResultList(results);
        }
    })
    appBody.appendChild(input);
}

/**
 * @param {Array<{guestName: string, roomName: typeof rooms[number]['name']}>} resultList
 */
function createResultList(resultList) {
    let listEl = document.getElementsByTagName('ul')[0];
    if (listEl) 
        clearElementContent(listEl)
    else 
        listEl = el('ul');
     
    const liElements = resultList.map(item => {
        const liEL = el('li', {
            innerText: item.guestName,            
        });
        const buttonEl = el('button', {  
            title:item.roomName,          
            onclick() {
                sayGuestAndRoom(item.guestName, item.roomName)
            }
        });        
        buttonEl.append(icon('help'));
        liEL.appendChild(buttonEl);
        return liEL;
    });
    listEl.append(...liElements);
    appBody.appendChild(listEl)
}

/**
 * @param {string} str 
 */
function speak(str) {
    if (speechSynthesis.speaking) return;
    const ut = new SpeechSynthesisUtterance(str);
    ut.lang = "he-IL";
    ut.rate = 0.7;
    window.speechSynthesis.speak(ut);
}
/**
 * @param {string} guestName
 * @param {string} roomName
 */
function sayGuestAndRoom(guestName, roomName) {
    const sentence = `שלום ${guestName}, החדר שלך הוא: ${roomName}, איזה כיף לך זה החדר הכי טוב בבית! אני מאחל לך פסח כשר ושמח`;
    speak(sentence);
}

createInput();

/**
 * @template T
 * @typedef {{[P in keyof T]?: DeepPartial<T[P]>}} DeepPartial
 */

/**
 * 
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} tag 
 * @param {DeepPartial<HTMLElementTagNameMap[T]>} [props = {}]
 */
function el(tag, props = {}) {
    const el = document.createElement(tag);
    Object.assign(el, props);
    return el;
}

/**
 * 
 * @param {Node} element 
*/
function clearElementContent(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}


