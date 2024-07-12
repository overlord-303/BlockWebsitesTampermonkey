// ==UserScript==
// @name         Block Websites
// @namespace    http://tampermonkey.net/
// @version      1.5.7
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
    href: (link) => window.location.href.includes(link),
    validUrl: (link) => /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/.*)?$/.test(link),
    regex: (link) => (new RegExp(`^(https?:\/\/)(www\.)?${link.replace(/https?:\/\//, '').replace(/www\./, '').replace(/\./g, '\.')}(\/(.+|$)|$)`, 'i')).test(window.location.href),
    style: {
        backgroundTransparent: 'rgba(0,0,0,0.5)',
        backgroundColor: '#181a1b',
        backgroundInput: '#3b3b3b',
        color: '#989595',
        filter: 'drop-shadow(2px 4px 6px #000000)',
        boxShadow: '0 0 10px rgba(0,0,0,0.25)',
        buttons: {
            color: '#ffffff',
            blockBtn: '#ff0000',
            unblockBtn: '#008000',
            closeBtn: '#808080',
        },
    },
    modalOpen: false,
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
    
    GM_addValueChangeListener("blockedSites", () => {
        run();
        updateBlockedList();
    });
    
    run();
})();

/**
 * Checks whether to refuse the current tab.
 */
function run()
{
    getBlockedSites().forEach(website =>
    {
        if (vars.regex(website))
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
    return JSON.parse(GM_getValue('blockedSites', JSON.stringify(['https://www.placeholder.com'])));
}

/**
 * Set the array of all blocked urls and return it.
 *
 * @param {string[]} blockedSites
 */
function setBlockedSites(blockedSites)
{
    GM_setValue('blockedSites', JSON.stringify(blockedSites));
    return getBlockedSites();
}

/**
 * Removes the *blockedSites* default property.
 *
 * @param {string[]} blockedSites
 *
 * @return {string[]}
 */
function removePlaceholder(blockedSites)
{
    const index = blockedSites.indexOf('https://www.placeholder.com');
    return (blockedSites.length > 1 && index !== -1) ? blockedSites.splice(index, 1) : blockedSites;
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
    return prefix ? `${prefix}-${uuid}` : uuid;
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
        const blockedSites = getBlockedSites();
        const link = input.value.trim();
        if (link && vars.validUrl(link))
        {
            if (!blockedSites.includes(link))
            {
                blockedSites.push(link);

                setBlockedSites(removePlaceholder(blockedSites));

                input.placeholder = `Website blocked.`;
            }
            else
            {
                input.placeholder = `Website already blocked.`;
            }
        }
        else
        {
            input.placeholder = `Invalid domain.`;
        }

        finish();
    };

    document.getElementById(vars.unblockBtnId).onclick = () =>
    {
        const blockedSites = getBlockedSites();
        const link = input.value.trim();
        if (link && vars.validUrl(link))
        {
            const index = blockedSites.indexOf(link);

            if (index !== -1)
            {
                blockedSites.splice(index, 1);

                setBlockedSites(removePlaceholder(blockedSites));

                input.placeholder = `Website unblocked.`;
            }
            else
            {
                input.placeholder = `Website isn't blocked.`;
            }
        }
        else
        {
            input.placeholder = `Invalid domain.`;
        }

        finish();
    };

    document.getElementById(vars.closeBtnId).onclick = () =>
    {
        document.body.removeChild(modal);

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
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-button {
            width: 0px;
            height: 0px;
        }
        ::-webkit-scrollbar-thumb {
            background: #989595;
            border: 0px none #ffffff;
            border-radius: 50px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #838181;
        }
        ::-webkit-scrollbar-thumb:active {
            background: #838181;
        }
        ::-webkit-scrollbar-track {
            background: #3b3b3b;
            border: 0px none #ffffff;
            border-radius: 50px;
        }
        ::-webkit-scrollbar-track:hover {
            background: #3b3b3b;
        }
        ::-webkit-scrollbar-track:active {
            background: #3b3b3b;
        }
        ::-webkit-scrollbar-corner {
            background: transparent;
        }
    `;

    const modal = document.createElement('div');
    modal.id = vars.blockModalId;
    modal.style.backgroundColor = vars.style.backgroundTransparent;
    modal.style.filter = vars.style.filter;

    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1001';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = vars.style.backgroundColor;
    modalContent.style.boxShadow = vars.style.boxShadow;

    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.textAlign = 'center';
    modalContent.style.margin = '10px';
    modalContent.innerHTML = `
        <h2 style="margin: 0 0 10px 0; color: ${vars.style.color}">Block or Unblock Website</h2>
        <input type="text" id="${vars.siteInputId}" placeholder="Enter website URL" style="width: 80%; padding: 10px; margin-bottom: 10px; transition: border 0.5s; border: none; border-radius: 3px; background: ${vars.style.backgroundInput}; color: ${vars.style.buttons.color};">
        <br>
        <button id="${vars.blockBtnId}" class="modal-button" style="background-color: ${vars.style.buttons.blockBtn}; color: ${vars.style.buttons.color}; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px;">Block</button>
        <button id="${vars.unblockBtnId}" class="modal-button" style="background-color: ${vars.style.buttons.unblockBtn}; color: ${vars.style.buttons.color}; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px;">Unblock</button>
        <button id="${vars.closeBtnId}" class="modal-button" style="background-color: ${vars.style.buttons.closeBtn}; color: ${vars.style.buttons.color}; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px;">Close</button>
    `;

    const blockedList = document.createElement('div');
    blockedList.style.backgroundColor = vars.style.backgroundColor;
    blockedList.style.boxShadow = vars.style.boxShadow;

    blockedList.style.padding = '20px';
    blockedList.style.borderRadius = '10px';
    blockedList.style.textAlign = 'left';
    blockedList.style.margin = '10px';
    blockedList.style.color = 'white';
    blockedList.style.width = '250px';
    blockedList.style.maxHeight = '300px';
    blockedList.style.height = '300px';
    blockedList.style.overflow = 'hidden';
    blockedList.innerHTML = `
        <h2 style="margin: 0 0 10px 0; color: ${vars.style.color}">Blocked Websites</h2>
        <ul id="${vars.blockedListId}" style="list-style-type: none; padding: 0; overflow-y: scroll; max-height: 250px;"></ul>
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
    if (!vars.modalOpen) return;

    const blockedList = document.getElementById(vars.blockedListId);

    blockedList.innerHTML = '';

    getBlockedSites().forEach(site => {
        const listItem = document.createElement('li');
        listItem.textContent = site;
        listItem.style.color = vars.style.color;
        listItem.style.margin = '2px';
        blockedList.appendChild(listItem);
    });
}

/**
 * Triggers on **keydown** event and fires when *ctrl*+*space* is pressed.
 *
 * @param {KeyboardEvent} handler
 */
function onKeyDown(handler)
{
    const hotkey = (handler.key === ' ') && handler.ctrlKey;

    if (hotkey && !vars.modalOpen) openModal();
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
    const prefix = 'Block Websites - Development Version - Development Version - Development Version - Development Version:'
    const message = `${prefix} ${log}`;

    switch (level)
    {
        case 'l':
        case 'log':
            console.log(`📰 ${message}\n`, ...args);
            break;

        case 'i':
        case 'info':
        default:
            console.info(`ℹ️ ${message}\n`, ...args);
            break;

        case 'w':
        case 'warn':
        case 'warning':
            console.warn(`⚠️ ${message}\n`, ...args);
            break;

        case 'e':
        case 'err':
        case 'error':
            console.error(`🚨 ${message}\n`, ...args);
            break;
    }
}

/**
 * @function GM_getValue
 *
 * @param {string} key
 * @param {any} defaultValue
 *
 * @return {any}
 */

/**
 * @function GM_setValue
 *
 * @param {string} key
 * @param {any} value
 */

/**
 * @function GM_addValueChangeListener
 * 
 *  @param {string} key
 *  @param {function} callbackFunction
 */
