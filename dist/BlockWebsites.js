// ==UserScript==
// @name         Block Websites
// @namespace    http://tampermonkey.net/
// @version      1.5.0
// @description  Block unwanted websites in a given list.
// @author       Overlord_303 (https://github.com/overlord-303)
// @icon         https://github.com/overlord-303/BlockWebsitesTampermonkey/raw/main/dist/media/block.png
// @updateURL    https://github.com/overlord-303/BlockWebsitesTampermonkey/raw/main/dist/BlockWebsites.js
// @downloadURL  https://github.com/overlord-303/BlockWebsitesTampermonkey/raw/main/dist/Blockwebsites.js
// @supportURL   https://github.com/overlord-303/BlockWebsitesTampermonkey/issues
// @license      GNU AGPLv3
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        window.close
// @run-at       document-start
// ==/UserScript==
// noinspection JSUnresolvedReference, JSUnusedGlobalSymbols

const vars = {
    get blockedSites() // get-function to always return newest non-cached values (live updates across tabs)
    {
        return getBlockedSites();
    },
    href: (link) => window.location.href.includes(link),
    regex: (link) => (new RegExp(`^(https?:\/\/)?(www\.)?(${link.replace(/\./g, '\.')})(\/.+|$)`, 'i')).test(window.location.href),
    modalOpen: false,
    lastUpdated: getLastUpdated(),
    blockBtnId: generateUUID('blockBtn'),
    unblockBtnId: generateUUID('unblockBtn'),
    closeBtnId: generateUUID('closeBtn'),
    siteInputId: generateUUID('siteInput'),
    blockModalId: generateUUID('blockModal'),
    blockedListId: generateUUID('blockedList'),
};

/**
 * IIFE (Immediately-invoked function expression) running the main-functionality.
 */
(function() {
    'use strict';

    document.addEventListener("keydown", onKeyDown);
    
    GM_addValueChangeListener("blockedSites", run);
    
    run();
})();

/**
 * Checks whether to refuse the current tab.
 */
function run()
{
    vars.blockedSites.forEach(website =>
    {
        if (vars.href(website)) //vars.regex(website)
        {
            window.stop();
            window.close();
        }
    });
}

/**
 * Returns an array of all blocked urls.
 *
 * @return {string[]}
 */
function getBlockedSites()
{
    return JSON.parse(GM_getValue('blockedSites', JSON.stringify(['placeholder.com'])));
}

/**
 * Set the array of all blocked urls and return it.
 *
 * @param {string[]} blockedSites
 */
function setBlockedSites(blockedSites)
{
    GM_setValue('blockedSites', JSON.stringify(blockedSites));
    setLastUpdated();

    return getBlockedSites();
}

/**
 * Returns the timestamp of the last blocked urls array update.
 *
 * @return {number}
 */
function getLastUpdated()
{
    return GM_getValue('lastUpdated', Date.now());
}

/**
 * Set the last update of the blocked urls array to the current timestamp.
 */
function setLastUpdated()
{
    GM_setValue('lastUpdated', Date.now());
}

/**
 * Generates a UUID (Universally Unique Identifier) including a prefix, when provided.
 *
 * @param {string|null} prefix
 * @return {string}
 */
function generateUUID(prefix = null)
{
    const uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, char=> (char ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> char / 4).toString(16));
    return prefix ? prefix + '-' + uuid : uuid;
}

/**
 * Opens the website moderating modal.
 */
function openModal()
{
    vars.modalOpen = true;

    const modal = createModal();
    const input = document.getElementById(vars.siteInputId);

    /**
     * Finis coronat opus.
     *
     * Clears the input field and updates the blocked list to prevent cross-tab issues.
     */
    function finish()
    {
        input.value = '';
        updateBlockedList(); // Always updating to prevent cross-tab issues.
    }

    document.getElementById(vars.blockBtnId).onclick = () =>
    {
        const blockedSites = vars.blockedSites;
        const link = input.value.trim();
        if (link)
        {
            if (!blockedSites.includes(link))
            {
                blockedSites.push(link);

                setBlockedSites(blockedSites);

                input.placeholder = `Website blocked.`;

                if (vars.href(link)) window.location.reload();
            }
            else
            {
                input.placeholder = `Website already blocked.`;
            }

            finish();
        }
    };

    document.getElementById(vars.unblockBtnId).onclick = () =>
    {
        const blockedSites = vars.blockedSites;
        const link = input.value.trim();
        if (link)
        {
            const index = blockedSites.indexOf(link);

            if (index !== -1)
            {
                blockedSites.splice(index, 1);

                setBlockedSites(blockedSites);

                input.placeholder = `Website unblocked.`;
            }
            else
            {
                input.placeholder = `Website already unblocked.`;
            }

            finish();
        }
    };

    document.getElementById(vars.closeBtnId).onclick = () =>
    {
        document.body.removeChild(modal);
        // log('current blocked urls', 'i', vars.blockedSites);

        vars.modalOpen = false;
    };
}

/**
 * Creates the website moderating modal and returns it.
 *
 * @return {HTMLDivElement}
 */
function createModal()
{
    const style = document.createElement('style');
    style.innerHTML = `
        #${vars.siteInputId}:hover {
            outline: none !important;
        }
        .modal-button:hover {
            opacity: 0.8;
        }
        .modal-button {
            border: none !important;
        }
    `;

    const modal = document.createElement('div');
    modal.id = vars.blockModalId;
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1001';
    modal.style.filter = 'drop-shadow(2px 4px 6px black)';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#181a1b';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.boxShadow = '0 0 10px rgba(0,0,0,0.25)';
    modalContent.style.textAlign = 'center';
    modalContent.style.marginRight = '20px';
    modalContent.innerHTML = `
        <h2 style="margin: 0 0 10px 0; color: #989595">Block or Unblock Website</h2>
        <input type="text" id="${vars.siteInputId}" placeholder="Enter website URL" style="width: 80%; padding: 10px; margin-bottom: 10px; transition: border 0.5s; border: none; border-radius: 3px; background: #3b3b3b; color: white;">
        <br>
        <button id="${vars.blockBtnId}" class="modal-button" style="background-color: red; color: white; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px;">Block</button>
        <button id="${vars.unblockBtnId}" class="modal-button" style="background-color: green; color: white; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px;">Unblock</button>
        <button id="${vars.closeBtnId}" class="modal-button" style="background-color: gray; color: white; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px;">Close</button>
    `;

    const blockedList = document.createElement('div');
    blockedList.style.backgroundColor = '#181a1b';
    blockedList.style.padding = '20px';
    blockedList.style.borderRadius = '10px';
    blockedList.style.boxShadow = '0 0 10px rgba(0,0,0,0.25)';
    blockedList.style.textAlign = 'left';
    blockedList.style.color = 'white';
    blockedList.style.width = '250px';
    blockedList.style.height = '300px';
    blockedList.style.overflowY = 'scroll';
    blockedList.innerHTML = `
        <h2 style="margin: 0 0 10px 0; color: #989595">Blocked Websites</h2>
        <ul id="${vars.blockedListId}" style="list-style-type: none; padding: 0;"></ul>
    `;

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    container.appendChild(modalContent);
    container.appendChild(blockedList);
    modal.appendChild(container);
    document.body.appendChild(modal);
    document.head.appendChild(style);

    updateBlockedList();

    return modal;
}

/**
 * Updates the list containing the current blocked urls.
 */
function updateBlockedList()
{
    const blockedList = document.getElementById(vars.blockedListId);

    blockedList.innerHTML = '';

    vars.blockedSites.forEach(site => {
        const listItem = document.createElement('li');
        listItem.textContent = site;
        listItem.style.color = '#989595';
        listItem.style.margin = '2px';
        blockedList.appendChild(listItem);
    });
}

/**
 * Triggers on **keydown** event and fires when *ctrl*+*space* is pressed.
 *
 * @param handler
 */
function onKeyDown(handler)
{
    const space = (handler.which === 0 ? handler.charCode : handler.keyCode) === 32;
    const ctrl = handler.ctrlKey;

    if (ctrl && space && !vars.modalOpen) openModal();
}

/**
 * Log function used for debugging purposes.
 *
 * @param {any} log
 * @param {string} level
 * @param {...any} args
 */
function log(log, level = 'l', ...args)
{
    const prefix = 'Block Websites:'
    const message = `${prefix} ${log}`;

    switch (level)
    {
        case 'e':
        case 'err':
        case 'error':
            console.error(message, ...args);
            break;
        case 'l':
        case 'log':
            console.log(message, ...args);
            break;
        case 'w':
        case 'warn':
        case 'warning':
            console.warn(message, ...args);
            break;
        case 'i':
        case 'info':
        default:
            console.info(message, ...args);
            break
    }
}

/**
 * @function GM_getValue
 *
 * @param {string} key
 * @param {any} defaultValue
 *
 * @return {string|number}
 */

/**
 * @function GM_setValue
 *
 * @param {string} key
 * @param {string|number} value
 */

/**
 * @function GM_addValueChangeListener
 * 
 *  @param {string} key
 *  @param {function} callbackFunction
 */
