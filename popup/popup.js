const inputId = document.querySelector('#jira-id');
const createIssueButton = document.querySelector('#createIssue');
const select = document.querySelector('select');
console.log('input loaded');
import JiraAPI from './JiraAPI';

async function loadBoardMapKeys() {
  const keys = await browser.storage.local.get().then(res => {
    return Object.keys(res.boardMap);
  });
  return keys;
}

async function id2Number(id) {
  const keys = await loadBoardMapKeys();
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
  if (url.includes('RapidBoard')) {
    return fromRapidBoard(url);
  }
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
      if (tabId !== tab.id) {
        return null;
      }
      if (changeinfo.status === 'complete') {
        browser.tabs.sendMessage(tabId, {issueNumber: issueNumber});
      }
    });
  });
});

const disableCreate = () => {
  inputId.disabled = true;
  createIssueButton.disabled = true;
};

async function setInputValues(tabs) {
  const tab = tabs[0];
  console.log('tab', tab);
  if (!tab.url.includes('atlassian.net')) {
    disableCreate(tab);
    return;
  }
  const issueId = issueIdFromURL(tab.url);
  const boardName = issueId.split('-')[0];
  inputId.value = await id2Number(issueId);
  loadBoardMapKeys();
  const storage = await browser.storage.local.get();
  const repos = storage.boardMap[boardName].split(',');
  for (let repo of repos) {
    const option = buildOptionDOM(repo);
    select.appendChild(option);
  }
  // JiraAPI.fetchSprintNo(storage.domain, issueId);
  // const boards = await JiraAPI.fetchBoards(storage.domain, issueId);
  // const sprints = await JiraAPI.fetchSprints(storage.domain, boards[0].id, 'active');
  // const sprint = sprints[0];
  // const issues = await JiraAPI.fetchIssuesForSprint(storage.domain, sprint.id);
}

browser.tabs.query({active: true, currentWindow: true}).then(setInputValues);

