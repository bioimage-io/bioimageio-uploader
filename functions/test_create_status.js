import create_status from './create_status.js';

async function main() {
    // main code
    console.log("Testing create_status...");
    console.log(await (await create_status()).json());
}

main();

