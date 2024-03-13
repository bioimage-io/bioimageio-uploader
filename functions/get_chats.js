export default async (event) => {
    const data = await event.json();
    const url = data.url;
    return await fetch(url);
}

