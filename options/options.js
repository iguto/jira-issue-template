console.log('load options.js');

const form = document.querySelector('form');
const boardInput = document.querySelector('#board_name');
const repoInput = document.querySelector('#repo_name');
const domainInput = document.querySelector('#domain_name');

saveToStorage = () => {
    const domain = domainInput.value;
    const board = boardInput.value;

    const boardMap = {};
    boardMap[board] = repoInput.value;
    const obj = {boardMap, domain};
    console.log('stored object', obj);
    browser.storage.local.set(obj).catch((err) => console.log('local.set error:', err));
};

setValuesToForm = () => {
    browser.storage.local.get().then((res) => {
        const boardMap = res.boardMap;
        const jiraId = Object.keys(boardMap)[0];
        const repoName = boardMap[jiraId];
        boardInput.value = jiraId;
        repoInput.value = repoName;
        domainInput.value = res.domain;
    });
};

document.addEventListener('DOMContentLoaded', setValuesToForm);

form.addEventListener('submit', saveToStorage);
