document.addEventListener('DOMContentLoaded', function () {
  const bodyElement = document.querySelector('body');
  const valueElement = document.getElementById('permission-value');
  const showTagElement = document.getElementById('show-tag');
  showTagElement.addEventListener('change', setShowTag);

  //Funções para comunicação com o content script
  function requestLocalStorageValue() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'getLocalStorageValue' }, function (response) {
        if (valueElement) {
          valueElement.textContent = response && response.value ? response.value : 'Nenhuma';
        }
      });
    });
  }

  function requestShowTagState() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'getShowTag' }, function (response) {
        if (showTagElement) {
          console.log("requestShowTagState recebeu do content o valor: ", response.value);
          showTagElement.value = response && response.value ?
            response.value ?
              showTagElement.setAttribute("checked", "checked")
              : showTagElement.removeAttribute("checked")
            : showTagElement.removeAttribute("checked");
        }
      });
    });
  }

  function setShowTag() {
    const showTagState = showTagElement.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'setShowTag', value: showTagState }, function (response) {

      });
    });
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];
    let url = new URL(tab.url);
    const regex = /^(.*-)?painel\.metodologiagb\.com\.br$/;

    const hostMessageElement = document.getElementById('host-message');
    const containerDataElement = document.getElementById('container-data');
    const containerElement = document.querySelector('.container');

    if ((regex.test(url.hostname) || (url.hostname === 'localhost' && url.port === '3000')) && tab.title === "Painel | MGB") {
      containerDataElement.style.visibility = 'visible';
      hostMessageElement.innerHTML = `Painel Metodologia Gustavo Borges<br/>Ambiente ${getEnviroment(url.hostname)}`;
      containerElement.style.backgroundImage = "";
      containerElement.style.backgroundColor = '#009BDB';
      bodyElement.style.height = "100px";
      requestLocalStorageValue();
      requestShowTagState();
    }
    else {
      hostMessageElement.textContent = 'Extensão exclusiva para uso no painel Metodologia Gustavo Borges';
      containerDataElement.style.visibility = 'hidden';
      containerElement.style.backgroundImage = "url('fundo.png')";
      containerElement.style.backgroundColor = '#D2E6FF';
      bodyElement.style.height = "350px";
    }
  });
});

const getEnviroment = url =>
  url.startsWith('hm-painel') || url.startsWith('qa-painel')
    ? url.split('-')[0]
    : 'Produção';