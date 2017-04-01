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

export default class JiraApi {
    static async fetchSprintNo(issueId) {
        const issueId = 'JAICOTD-200';
        const url = '';
        const result = await fetch(url, { credentials: 'same-origin' }).then((response) => response.json());
        console.log('result', result);
        console.log('hoge');
        const greenHopperString = result.fields.customfield_10022[0];
        console.log('green', greenHopperString);
        const parsed = greenHopperSprintCustomFieldParse(greenHopperString);
        console.log('parsed', parsed);
    }
}
