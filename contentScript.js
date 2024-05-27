console.log('Content script loading');

const cryptoKey = 'MgbCryptoKey';

function setLocalStorageKey(newKey, value) {
    if (value !== '') {
        localStorage.setItem(newKey, value);
        console.log(`LocalStorage key ${newKey} set to ${value}`);
    }
  }

function removeLocalStorageKey(keyName){
    localStorage.removeItem(keyName);
}

function readLocalStorageValues() {
    const salt = localStorage.getItem('encryptedUser');
    const encryptedPermission = localStorage.getItem('encryptedPermission');

    if (salt === null || salt === 'undefined' || encryptedPermission === null || encryptedPermission === 'undefined') {
        removeLocalStorageKey("ShowTag");
        removeLocalStorageKey("Permission");
        createPermissionBanner();
        return;
    }

    const cryptoHelper = new CryptoHelper(cryptoKey, salt);
    const decryptedPermission = cryptoHelper.decrypt(localStorage.getItem('encryptedPermission'));

    setLocalStorageKey("Permission", decryptedPermission)

    createPermissionBanner(decryptedPermission);
}

function onUrlChange(callback) {
    let lastUrl = location.href;
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        callback();
      }
    }).observe(document, {subtree: true, childList: true});
  }
  
  onUrlChange(readLocalStorageValues);

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getLocalStorageValue') {
        const value = localStorage.getItem('Permission');

        console.log('Listener getLocalStorageValue processado, valor: ', value);

        sendResponse({ value: value });
    }

    if (request.type === 'getShowTag') {
        const value = localStorage.getItem('ShowTag');

        console.log('Listener getShowTag processado, valor: ', value === "true");
        
        sendResponse({ value: value === "true" });
    }

    if (request.type === 'setShowTag') {
        const value = localStorage.getItem('ShowTag');

        setLocalStorageKey("ShowTag", request.value)

        readLocalStorageValues();

        sendResponse({ value: request.value });
    }
});

function createPermissionBanner(stringValue = "") {
    const bannerId = 'permission-banner';
    let banner = document.getElementById(bannerId);

    if (!getShowTag()) {
        if (banner) banner.style.visibility = 'hidden';
        return;
    }

    if (!stringValue) {
        if (banner) banner.style.visibility = 'hidden';
        return;
    }

    if (banner) {
        banner.textContent = stringValue;
        banner.style.visibility = 'visible';
        return;
    }

    banner = document.createElement('div');
    banner.id = bannerId;
    banner.textContent = stringValue;

    const bannerStyles = {
        position: 'fixed',
        top: '100px',
        left: '-35px',
        width: '200px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        textAlign: 'center',
        padding: '10px 20px',
        zIndex: '9999',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        transform: 'rotate(-45deg)',
        transformOrigin: 'top left'
    };

    Object.assign(banner.style, bannerStyles);

    // Adiciona o banner ao body do documento
    document.body.appendChild(banner);
}

function getShowTag() {
    const value = localStorage.getItem("ShowTag");

    return value === 'true';
}

window.addEventListener("load", (event) => {
    readLocalStorageValues();

    console.log('Content script loaded');
});
