document.addEventListener('DOMContentLoaded', function () {
  //Funções para comunicação com o content script
  function requestLocalStorageValue() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'getLocalStorageValue' }, function (response) {
        const valueElement = document.getElementById('local-storage-value');

        if (valueElement) {
          valueElement.textContent = response && response.value ? response.value : 'Nenhum valor encontrado';
        }
      });
    });
  }

  function requestShowTagState() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'getShowTag' }, function (response) {
        const showTagElement = document.getElementById('show-tag');

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
    const showTagElement = document.getElementById("show-tag");
    const showTagState = showTagElement.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'setShowTag', value: showTagState }, function (response) {

      });
    });
  }

  requestLocalStorageValue();
  requestShowTagState();
  document.getElementById('show-tag').addEventListener('change', setShowTag);
});