import { COLLECTION_URL_PUBLISHED, COLLECTION_CONFIG_URL } from './config'; 


async function get_taken_names(): Promise<Array<string>>{
    // Url of collection
    const url = COLLECTION_URL_PUBLISHED;
    const obj = await (await fetch(url)).json();
    return obj.collection.map((item : {nickname: string})=>item.nickname).filter((item : string)=>item !== undefined);
}


async function get_id_parts(type: string): Promise<Array<string>>{
    const url = COLLECTION_CONFIG_URL;
    const config = await (await fetch(url)).json();
    
    return config["id_parts"][type]
}


function sample(array: Array<any>){
    return array[Math.floor(Math.random() * array.length)];
}


function generate_name(starts:Array<string>, animals:Array<Array<string>>): {id:string, emoji:string}{
    const animal = sample(animals);
    return {id: `${sample(starts)}-${animal[0]}`, emoji: animal[1]};
}


export default async (type): Promise<{id:string, emoji:string}> => {
    console.log("Generating nickname from allowed lists...");
    const [id_parts, taken_names] = await Promise.all([
        get_id_parts(type),
        get_taken_names()]);
    const values: Array<Array<string>> = Object.entries(id_parts['nouns']);
    let name = generate_name(id_parts['adjectives'], values);
    while(name.id in taken_names){
        name = generate_name(id_parts['adjectives'], values);
    }
    return name; 
}
