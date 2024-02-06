import generate_name from './generate_name.js';

async function main() {
    // main code
    console.log("Generating name...");
    console.log(await (await generate_name()).json());
}

main();
