

async function get_taken_names(){
    // Url of collection
    const url = "https://raw.githubusercontent.com/bioimage-io/collection-bioimage-io/gh-pages/collection.json";
    const obj = await (await fetch(url)).json();
    return obj.collection.map((item)=>item.nickname).filter((item)=>item !== undefined);
}


async function get_adjectives(){
    const url = "https://github.com/bioimage-io/collection-bioimage-io/raw/main/adjectives.txt";
    const text = await (await fetch(url)).text();
    return text.split("\n");
}


async function get_animals(){
    const url = "https://github.com/bioimage-io/collection-bioimage-io/raw/main/animals.yaml";
    const text = await (await fetch(url)).text();
    return text.split("\n")
        .filter((line)=>line.trim()[0] !== '#')
        .map((line) => {
            const comment_index = line.indexOf("#");
            if(comment_index !== -1){
                line = line.slice(0, comment_index);
            }
            return line;
        })
        .filter((line)=>line.trim() !== '')
        .map((line) => line.split(":")
                           .map((entry)=>entry.trim()));
}


function sample(array){
    return array[Math.floor(Math.random() * array.length)];
}


function generate_name(starts, animals){
    const animal = sample(animals);
    return {name: `${sample(starts)}-${animal[0]}`, icon: animal[1]};
}


export default async () => {
    const [adjectives, animals_with_icons, taken_names] = await Promise.all([
        get_adjectives(),
        get_animals(),
        get_taken_names()]);
    let name = generate_name(adjectives, animals_with_icons);
    while(name in taken_names){
        name = generate_name(adjectives, animals_with_icons);
    }
    const res = new Response.json(name);
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.append("Access-Control-Allow-Headers", "*");
    res.headers.append("Access-Control-Allow-Methods", "*");
    return res;
    //return {
      //statusCode: 200,
      //headers: {
            //[> Required for CORS support to work <]
            //'Access-Control-Allow-Origin': '*',
            //'Access-Control-Allow-Headers': 'Content-Type',
            //[> Required for cookies, authorization headers with HTTPS <]
            //'Access-Control-Allow-Credentials': true
        //},
        //body: JSON.stringify(name)
    ////Response.json(name);
    //}
}
