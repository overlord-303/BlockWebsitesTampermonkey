// ==UserScript==
// @name         Block Websites
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Block unwanted websites in a given list.
// @author       Overlord_303 (https://github.com/overlord-303)
// @icon         https://github.com/overlord-303/BlockWebsitesTampermonkey/raw/main/block.png
// @updateURL    https://github.com/overlord-303/BlockWebsitesTampermonkey/raw/main/tampermonke.js
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        window.close
// @run-at       document-start
// ==/UserScript==
// noinspection JSUnresolvedReference

(function() {
    'use strict';

    document.addEventListener("keydown", onKeyDown);

    const blockedSites = getBlockedSites();

    blockedSites.forEach(website =>
    {
        //const regex = new RegExp(`^(https?:\/\/)?(www\.)?(${website.replaceAll('.', '\.')})(\/.+|$)`, 'i');

        //console.log(regex, website.replace(/\./g, '\.'), regex.test(window.location.href));

        if (window.location.href.includes(website)/*regex.test(window.location.href)*/)
        {
            window.stop();
            window.close();
        }
    });
})();

function getBlockedSites()
{
    const stored = GM_getValue('blockedSites') ?? [];

    if (typeof stored === 'string')
    {
        return JSON.parse(stored);
    }
    else
    {
        return stored;
    }
}

let modalOpen = false;

function openModal()
{
    modalOpen = true;

    const blockedSites = getBlockedSites();

    const style = document.createElement('style');
    style.innerHTML = `
        #siteInput:hover {
            outline: none !important;
        }
        .modal-button:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.id = 'blockModal';
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
    modalContent.innerHTML = `
        <h2 style="margin: 0 0 10px 0; color: gray">Block or Unblock Website</h2>
        <input type="text" id="siteInput" placeholder="Enter website URL" style="width: 80%; padding: 10px; margin-bottom: 10px; transition: border 0.5s;">
        <br>
        <button id="blockBtn" class="modal-button" style="background-color: red; color: white; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px;">Block</button>
        <button id="unblockBtn" class="modal-button" style="background-color: green; color: white; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px;">Unblock</button>
        <button id="closeBtn" class="modal-button" style="background-color: gray; color: white; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px;">Close</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    document.getElementById('blockBtn').onclick = () =>
    {
        const link = document.getElementById('siteInput').value.trim();
        if (link)
        {
            if (!blockedSites.includes(link))
            {
                blockedSites.push(link);

                GM_setValue('blockedSites', JSON.stringify(blockedSites));

                document.getElementById('siteInput').placeholder = `Website blocked.`;
                document.getElementById('siteInput').value = '';

                if (window.location.href.includes(link)) window.location.reload();
            }
            else
            {
                document.getElementById('siteInput').placeholder = `Website already blocked.`;
                document.getElementById('siteInput').value = '';
            }
        }
    };

    document.getElementById('unblockBtn').onclick = () =>
    {
        const link = document.getElementById('siteInput').value.trim();
        if (link)
        {
            const index = blockedSites.indexOf(link);
            if (index !== -1)
            {
                blockedSites.splice(index, 1);

                GM_setValue('blockedSites', JSON.stringify(blockedSites));

                document.getElementById('siteInput').placeholder = `Website unblocked.`;
                document.getElementById('siteInput').value = '';
            }
            else
            {
                document.getElementById('siteInput').placeholder = `Website already unblocked.`;
                document.getElementById('siteInput').value = '';
            }
        }
    };

    document.getElementById('closeBtn').onclick = () =>
    {
        document.body.removeChild(modal);
        console.log(blockedSites);

        modalOpen = false;
    };
}

function onKeyDown(handler)
{
    const keyCode = handler.which === 0 ? handler.charCode : handler.keyCode;

    if (keyCode === 32 && !modalOpen)
    {
        openModal();
    }
}
