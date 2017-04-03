const inputId = document.querySelector('#jira-id');
const createIssueButton = document.querySelector('#createIssue');
const select = document.querySelector('select');
const jiraIssueList = document.querySelector('#jira-issue-list');

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

const onCreate = () => {
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
};

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
}

function buildJiraIssueListItemDOM(issue) {
  const dom = document.createElement('div');
  dom.innerHTML = `<span>${issue.key}</span>` +
      `<div class="issue-detail-popout">${issue.fields.summary}</div>`;
  return dom;
}

async function appendJiraList() {
  const storage = await browser.storage.local.get();
  const boardName = Object.keys(storage.boardMap)[0];
  const boards = await JiraAPI.fetchBoards(storage.domain, boardName);
  const sprints = await JiraAPI.fetchSprints(storage.domain, boards[0].id, 'active');
  const sprint = sprints[0];
  const issues = await JiraAPI.fetchIssuesForSprint(storage.domain, sprint.id);
  for (let issue of issues) {
    const li = buildJiraIssueListItemDOM(issue);
    jiraIssueList.appendChild(li);
  }
}

createIssueButton.addEventListener('click', onCreate);
browser.tabs.query({active: true, currentWindow: true}).then(setInputValues);

appendJiraList();
