if (window.location.host.includes('github')) {
  console.log('content_scripts', 'loaded -----------------------------');
  const description = document.querySelector('#issue_body');

  async function buildDescription(issueNumber) {
    return browser.storage.local.get().then((res) => {
      const domain = res.domain;
      const boardName = Object.keys(res.boardMap)[0];
      return `## [Sprint*#${boardName}-${issueNumber}](https://${domain}/browse/${boardName}-${issueNumber})`;
    });
  }

  async function setDescription(request) {
    console.log('msg', request);
    description.value = await buildDescription(request.issueNumber);
  }

  browser.runtime.onMessage.addListener(setDescription);
// new issue
}
