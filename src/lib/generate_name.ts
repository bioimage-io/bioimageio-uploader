import { COLLECTION_URL, ADJECTIVES_URL, ANIMALS_URL } from './config'; 


async function get_taken_names(): Promise<Array<string>>{
    // Url of collection
    const url = COLLECTION_URL;
    const obj = await (await fetch(url)).json();
    return obj.collection.map((item : {nickname: string})=>item.nickname).filter((item : string)=>item !== undefined);
}


async function get_adjectives(): Promise<Array<string>>{
    const url = ADJECTIVES_URL;
    const text = await (await fetch(url)).text();
    return text.split("\n");
}


async function get_animals(): Promise<Array<Array<string>>>{
    const url = ANIMALS_URL;
    const text = await (await fetch(url)).text();
    return text.split("\n")
        .filter((line)=>line.trim()[0] !== '#')
        .filter((line)=>line.trim() !== '')
        .map((line) => {
            const comment_index = line.indexOf("#");
            if(comment_index !== -1){
                line = line.slice(0, comment_index);
            }
            return line;
        })
        .map((line) => line.split(":")
                           .map((entry)=>entry.trim()));
}


function sample(array: Array<any>){
    return array[Math.floor(Math.random() * array.length)];
}


function generate_name(starts:Array<string>, animals:Array<Array<string>>): {id:string, emoji:string}{
    const animal = sample(animals);
    return {id: `${sample(starts)}-${animal[0]}`, emoji: animal[1]};
}


export default async (): Promise<{id:string, emoji:string}> => {
    console.log("Generating nickname from allowed lists...");
    const [adjectives, animals_with_emojis, taken_names] = await Promise.all([
        get_adjectives(),
        get_animals(),
        get_taken_names()]);
    let name = generate_name(adjectives, animals_with_emojis);
    while(name.id in taken_names){
        name = generate_name(adjectives, animals_with_emojis);
    }
    return name; 
}
