const data = "SGVsbG8gUmFtYW5hbmQsPGJyPjxiciZubmJzcDt0aGlzIGlzIGEgdGVzdCB3aXRoIHNwZWNpYWwgY2hhcmFjdGVycy4-";
// The above is base64url for "Hello Ramanand,<br><br&nbsp;this is a test with special characters.>"
// Note: I manually crafted a string that includes a '-' (mapped to '>') 

function decodeBase64(data) {
    if (!data) return '';
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
}

const decoded = decodeBase64(data);
console.log("Decoded content:");
console.log(decoded);

if (decoded.includes('<br>') && decoded.includes('&nbsp;') && decoded.endsWith('>')) {
    console.log("SUCCESS: Decoding logic works correctly.");
} else {
    console.log("FAILURE: Decoding logic failed.");
    console.log("Decoded contains <br>:", decoded.includes('<br>'));
    console.log("Decoded contains &nbsp;:", decoded.includes('&nbsp;'));
    console.log("Decoded ends with >:", decoded.endsWith('>'));
}
