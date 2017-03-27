const inputId = document.querySelector('#jira-id');
const createIssueButton = document.querySelector('#createIssue');
const select = document.querySelector('select');

async function loadBoardMapKeys() {
    const keys = await browser.storage.local.get().then(res => {
        console.log('res', res);
        return Object.keys(res.boardMap);
    });
    console.log('keys', keys);
    return keys;
}

async function id2Number(id) {
    const keys = await loadBoardMapKeys();
    console.log('await keys', keys);
    console.log('keys type', typeof keys);
    const currentKey = keys.filter((key) => id.includes(key))[0];
    return id.replace(`${currentKey}-`, '');
}

const fromRapidBoard = (url) => {
    const params = new window.URLSearchParams(url);
    return params.get('selectedIssue');
};

const fromIssueBrowser = (url) => {
    const arrDirs = new URL(url).pathname.split('/');
    return arrDirs[arrDirs.length - 1];
};

const issueIdFromURL = (url) => {
    if (url.includes('RapidBoard')) { return fromRapidBoard(url); }
    return fromIssueBrowser(url);
};

const buildOptionDOM = (value) => {
    const dom = document.createElement('option');
    dom.value = value;
    dom.innerHTML = value;
    return dom;
};

createIssueButton.addEventListener('click', () => {
    const issueNumber = inputId.value;
    const repo = select.value;

    const newIssueURL = `https://github.com/${repo}/issues/new`;
    browser.tabs.create({
        'url': newIssueURL
    }).then(tab => {
        browser.tabs.onUpdated.addListener((tabId, changeinfo) => {
            if (tabId !== tab.id) { return null; }
            if (changeinfo.status === 'complete') {
                browser.tabs.sendMessage(tabId, {issueNumber: issueNumber});
            }
        });
    });
});

async function setIssueValue(issueId) {
    const issueValue = await id2Number(issueId);
    console.log('await issueValue', issueValue);
    inputId.value = issueValue;
}

browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
    const tab = tabs[0];
    if (!tab.url.includes('atlassian.net')) {
        inputId.disabled = true;
        createIssueButton.disabled = true;
        return;
    }
    const issueId = issueIdFromURL(tab.url);
    const boardName = issueId.split('-')[0];
    console.log('issueId', issueId);
    setIssueValue(issueId);

    browser.storage.local.get('boardMap').then((storage) => {
        const repos = storage.boardMap[boardName].split(',');
        for(let repo of repos) {
            const option = buildOptionDOM(repo);
            select.appendChild(option);
        }
    });
});