import { COLLECTION_URL_PUBLISHED, COLLECTION_CONFIG_URL } from './config'; 


function sample(array: Array<any>){
    return array[Math.floor(Math.random() * array.length)];
}


function sample_name(starts:Array<string>, animals:Array<Array<string>>): {id:string, emoji:string}{
    const animal = sample(animals);
    return {id: `${sample(starts)}-${animal[0]}`, emoji: animal[1]};
}


export default async (type): Promise<{id:string, emoji:string}> => {
    console.log("Generating nickname from allowed lists...");
    const config = await (await fetch(COLLECTION_CONFIG_URL)).json();
    const id_parts = config["id_parts"][type]
    const obj = await (await fetch(COLLECTION_URL_PUBLISHED)).json();
    const taken_names = obj.collection.map((item : {nickname: string})=>item.nickname).filter((item : string)=>item !== undefined);
    const values: Array<Array<string>> = Object.entries(id_parts['nouns']);
    let name = sample_name(id_parts['adjectives'], values);
    while(name.id in taken_names){
        name = sample_name(id_parts['adjectives'], values);
    }
    return name; 
}
