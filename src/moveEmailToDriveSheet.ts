// SPDX-License-Identifier: MPL-2.0
type Label = GoogleAppsScript.Gmail.Schema.Label;
type Message = GoogleAppsScript.Gmail.Schema.Message;
const Messages = Gmail.Users!.Messages!;
const Labels = Gmail.Users!.Labels!;

const BLACKLIST = props.blacklist?.split(',')?.map(s => s.trim()) ?? []
const re = /recebeu um Pix de\s+(?<name>[^\r\n]*)\s*Valor recebido\s+R\$ (?<money>[\d,]*)\s*Detalhes do pagamento\s*Data e hora\s*(?<date>\d{2}\/\d{2}\/\d{4}) às (?<time>\d{2}:\d{2})/gm

function getLabels(): { old: Label; new: Label; } {
    const labels = Labels.list('me')
    if (!labels?.labels) throw new Error("failed to get labels!")

    const old = labels.labels.find(d => d.name == getProp("oldLabel"))
    const n = labels.labels.find(d => d.name == getProp("newLabel"))
    if (!old || !n) { throw new Error("failed to find label!") }
    return { old, new: n }
}

function* getMessages(label: string): Generator<Message> {
    const msgIDs = Messages.list('me', { q: `label:${label}` });
    if (!msgIDs) { throw new Error("failed to get messages!") }

    for (const msgid of msgIDs.messages ?? []) {
        if (!msgid.id) continue

        yield Messages.get('me', msgid.id, { format: "raw" })
    }
}

function moveEmailToDriveSheet() {
    const folder = DriveApp.getFolderById(getProp("folder"));
    const sheet = SpreadsheetApp.openById(getProp("sheet")).getSheetByName("Extrato")
    const labels = getLabels();

    if (!sheet) {
        throw new Error("failed to find spreadsheet!")
    }

    for (const msg of getMessages(labels.old.name!)) {
        re.lastIndex = 0

        let matches = re.exec(msg.snippet!)?.groups;
        if (!matches?.name || !matches.money || !matches.date || !matches.time) {
            throw new Error("data not found on snippet you'll need to parse the whole email loolll")
        }
        const name = matches.name.trim()

        if (!BLACKLIST.includes(name)) {
            let [d, mo, y] = matches.date.split('/').map(n => Number.parseInt(n, 10))
            let [h, m] = matches.time.split(':').map(n => Number.parseInt(n, 10))
            let date = new Date(y, mo - 1, d, h, m)

            let file = folder.createFile(Utilities.newBlob(msg.raw!, 'message/rfc822', `${name}: R\$${matches.money} ${date.toISOString()}.eml`))
            sheet.appendRow([date, "", matches.money, "", `=HYPERLINK("${file.getUrl()}"; "pix")`, name])
        }
        Messages.modify({ addLabelIds: [labels.new.id!], removeLabelIds: [labels.old.id!, 'INBOX'] }, 'me', msg.id!)
    }
}