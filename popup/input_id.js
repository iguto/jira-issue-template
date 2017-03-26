const inputId = document.querySelector('#jira-id');
const createIssueButton = document.querySelector('#createIssue');
const select = document.querySelector('select');

const id2Number = (id) => {
    return browser.storage.local.get('boardMap').then(res => {
        const keys = Object.keys(res.boardMap);
        const currentKey = keys.filter((key) => id.includes(key))[0];
        return id.replace(`${currentKey}-`, '');
    });
};

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

createIssueButton.addEventListener('click', (e) => {
    const issueNumber = inputId.value;
    const repo = select.value;

    const newIssueURL = `https://github.com/${repo}/issues/new`;
    browser.tabs.create({
        "url": newIssueURL
    }).then(tab => {
        browser.tabs.onUpdated.addListener((tabId, changeinfo) => {
            if (tabId !== tab.id) { return null; }
            if (changeinfo.status === 'complete') {
                browser.tabs.sendMessage(tabId, {issueNumber: issueNumber});
            }
        });
    });
});

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
    id2Number(issueId).then((res) => inputId.value = res);

    browser.storage.local.get('boardMap').then((storage) => {
        const repos = storage.boardMap[boardName].split(',');
        for(let repo of repos) {
            const option = buildOptionDOM(repo);
            select.appendChild(option);
        }
    });
});