console.log('jira-github-connector', 'loaded -----------------------------');

const description = document.querySelector('#issue_body');

const buildDescription = (issueNumber) => {
    return browser.storage.local.get().then((res) => {
        const domain = res.domain;
        const boardName = Object.keys(res.boardMap)[0];
        return `## [Sprint*#${boardName}-${issueNumber}](https://${domain}/browse/${boardName}-${issueNumber})`;
    });
};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('msg', request);
    buildDescription(request.issueNumber).then((res) => description.value = res);
});
// new issue