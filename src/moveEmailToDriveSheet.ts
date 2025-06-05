// SPDX-License-Identifier: MPL-2.0

const prop = PropertiesService.getScriptProperties()
const BLACKLIST = prop.getProperty("BLACKLIST")?.split(',') ?? []
const FOLDER = prop.getProperty("FOLDER")!
const SHEET = prop.getProperty("SHEET")!

const R = /recebeu um Pix de\s+(?<name>[^\r\n]*)\s*Valor recebido\s+R\$ (?<money>[\d,]*)/gm
const faltaLabel = GmailApp.getUserLabelByName("formatura/falta")
const foiLabel = GmailApp.getUserLabelByName("formatura/foi")

function run() {
    const folder = DriveApp.getFolderById(FOLDER);
    const sheet = SpreadsheetApp.openById(SHEET).getSheetByName("Extrato")
    if (!sheet) {
        throw new Error("failed to find spreadsheet!")
    }

    for (const thread of faltaLabel.getThreads()) {
        for (const msg of thread.getMessages()) {
            const content = msg.getRawContent()
            const date = msg.getDate()

            let matches = R.exec(content)
            let name = matches?.groups?.name;
            let money = matches?.groups?.money;
            if (!name || !money || BLACKLIST.includes(name.trim())) { continue }

            let file = folder.createFile(`${quoted_printable_decode(name)}: R\$${money} ${date.toISOString()}.eml`, content);

            sheet.appendRow(["", money, "", `=HYPERLINK("${file.getUrl()}"; "comprovante")`])
        }

        thread.removeLabel(faltaLabel)
        thread.addLabel(foiLabel)
        thread.moveToArchive()
    }
}