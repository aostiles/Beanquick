import parse = require('csv-parse/lib/sync');

function printRecord(fromAccount: string, year: string, r: any): string {
    const month = r[0];
    const day = r[1];
    const comment = r[2];
    const amount = r[3];
    const toAccount = r[4];
    const templated =
    `${year}-${month}-${day} * \"${comment}\"
    ${toAccount} ${amount} USD
    ${fromAccount}
`;
    return templated;
}

export function toBeancount(s: string, fromAccount: string, year: string) {
    const records = parse(s, {trim: true});
    const printed = records.map(function(x: any) { return printRecord(fromAccount, year, x); });
    return printed.join("\n");
}