console.log('found jira-api file');

function greenHopperSprintCustomFieldParse(str) {
    const startAt = str.indexOf('[');
    const endAt = str.indexOf(']');
    const list = str.slice(startAt + 1, endAt).split(',');
    const sprint = {};
    for ( let pair of list ) {
        const [key, value] = pair.split('=');
        sprint[key] = value;
    }
    return sprint;
}

function jiraBaseEndpoint(domain) {
  return `https://${domain}/rest/api/2`;
}

function greenHopperBaseEndpoint(domain) {
  return `https://${domain}/rest/agile/1.0`;
}

async function fetchIssue(domain, issueId) {
  const url = `${jiraBaseEndpoint(domain)}/issue/${issueId}`;
  return await fetch(url, { credentials: 'same-origin' }).then((response) => response.json());
}

export default class JiraApi {
  static async fetchSprintNo(domain, issueId) {
    const result = await fetchIssue(domain ,issueId);
    console.log('result', result);
    console.log('hoge');
    const greenHopperString = result.fields.customfield_10022[0];
    console.log('green', greenHopperString);
    const parsed = greenHopperSprintCustomFieldParse(greenHopperString);
    console.log('parsed', parsed);
  }

  // static async fetchBoards(domain,) {
  // }
  static async fetchBoards(domain, issueId) {
    const boardName = issueId.split('-')[0];
    let url = `${greenHopperBaseEndpoint(domain)}/board`;
    if (issueId) { url += `?name=${boardName}` }
    const result = await fetch(url, { credentials: 'same-origin' }).then(response => response.json());
    // ignoring startAt field to simplify
    console.log('board result', result.values);
    return result.values;
  }

  static async fetchSprints(domain, boardId, state) {
    if (!['future', 'active', 'closed'].includes(state)) { state = '' }
    let url = `${greenHopperBaseEndpoint(domain)}/board/${boardId}/sprint`;
    if (state) { url += `?state=${state}` }
    const result = await fetch(url, { credentials: 'same-origin' }).then(response => response.json());
    // ignoreing startAt field to simplif
    console.log('sprint result', result.values);
    return result.values;
  }

  static async fetchIssuesForSprint(domain, sprintId) {
    const url = `${greenHopperBaseEndpoint(domain)}/sprint/${sprintId}/issue`;
    const result = await fetch(url, { credentials: 'same-origin'}).then(response => response.json());
    console.log('sprint issue', result.issues);
    return result.issues;
  }
}

