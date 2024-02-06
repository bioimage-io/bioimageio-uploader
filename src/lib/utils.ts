

export async function FileFromJSZipZipOject(zipObject){
    if(zipObject.dir) throw new Error("Zip file must be flat (no internal folders)");
    const res =  new File([await zipObject.async("blob")], zipObject.name);
    return res;

}


export function clean_rdf(rdf){
    delete rdf._metadata;
    if (rdf?.config?._deposit) delete rdf.config._deposit;
    // Null or zero-length orcid causes issues 
    for (let index=0; index < rdf.authors.length; index++){
        if(!rdf.authors[index].orcid){
            delete rdf.authors[index].orcid;
        }
    }
    for (let index=0; index < rdf.maintainers.length; index++){
        if(!rdf.maintainers[index].email){
            delete rdf.maintainers[index].email;
        }
    }
    return rdf;
}

export const is_string = (value) => typeof value === 'string';

/* 
Fetch API: Inputs to fetch

* resource
    This defines the resource that you wish to fetch. This can either be:
        A string or any other object with a stringifier — including a URL object — that provides the URL of the resource you want to fetch.
        A Request object.
options Optional
    An object containing any custom settings you want to apply to the request. The possible options are:
    method
        The request method, e.g., "GET", "POST". The default is "GET". Note that the Origin header is not set on Fetch requests with a method of HEAD or GET. Any string that is a case-insensitive match for one of the methods in RFC 9110 will be uppercased automatically. If you want to use a custom method (like PATCH), you should uppercase it yourself.
    headers
        Any headers you want to add to your request, contained within a Headers object or an object literal with String values. Note that some names are forbidden.
        Note: The Authorization HTTP header may be added to a request, but will be removed if the request is redirected cross-origin.
    body
        Any body that you want to add to your request: this can be a Blob, an ArrayBuffer, a TypedArray, a DataView, a FormData, a URLSearchParams, string object or literal, or a ReadableStream object. This latest possibility is still experimental; check the compatibility information to verify you can use it. Note that a request using the GET or HEAD method cannot have a body.
    mode
        The mode you want to use for the request, e.g., cors, no-cors, or same-origin.
    credentials
        Controls what browsers do with credentials (cookies, HTTP authentication entries, and TLS client certificates). Must be one of the following strings:
        omit
            Tells browsers to exclude credentials from the request, and ignore any credentials sent back in the response (e.g., any Set-Cookie header).
        same-origin
            Tells browsers to include credentials with requests to same-origin URLs, and use any credentials sent back in responses from same-origin URLs. This is the default value.
        include
            Tells browsers to include credentials in both same- and cross-origin requests, and always use any credentials sent back in responses.
            Note: Credentials may be included in simple and "final" cross-origin requests, but should not be included in CORS preflight requests.
    cache
        A string indicating how the request will interact with the browser's HTTP cache. The possible values, default, no-store, reload, no-cache, force-cache, and only-if-cached, are documented in the article for the cache property of the Request object.
    redirect
        How to handle a redirect response:
        follow
            Automatically follow redirects. Unless otherwise stated the redirect mode is set to follow.
        error
            Abort with an error if a redirect occurs.
        manual
            Caller intends to process the response in another context. See WHATWG fetch standard for more information.
    referrer
        A string specifying the referrer of the request. This can be a same-origin URL, about:client, or an empty string.
    referrerPolicy
        Specifies the referrer policy to use for the request. May be one of no-referrer, no-referrer-when-downgrade, same-origin, origin, strict-origin, origin-when-cross-origin, strict-origin-when-cross-origin, or unsafe-url.
    integrity
        Contains the subresource integrity value of the request (e.g., sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=).
    keepalive
        The keepalive option can be used to allow the request to outlive the page. Fetch with the keepalive flag is a replacement for the Navigator.sendBeacon() API.
    signal
        An AbortSignal object instance; allows you to communicate with a fetch request and abort it if desired via an AbortController.
    priority
        Specifies the priority of the fetch request relative to other requests of the same type. Must be one of the following strings:
        high
            A high-priority fetch request relative to other requests of the same type.
        low
            A low-priority fetch request relative to other requests of the same type.
        auto
            Automatically determine the priority of the fetch request relative to other requests of the same type (default).
*/

export async function fetch_with_progress(resource, options){ 
    return await new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        if(options.upload_listener) request.upload.addEventListener("progress", options.upload_listener); 
            //(event) => {if(upload_listener){upload_listener(event)}});
            //if (event.lengthComputable) {
                //console.log("upload progress:", event.loaded / event.total);
                //uploadProgress.value = event.loaded / event.total;
            //}
            //});
        if(options.download_listener) request.addEventListener("progress", options.download_listener);
          //if (event.lengthComputable) {
            //console.log("download progress:", event.loaded / event.total);
            //downloadProgress.value = event.loaded / event.total;
          //}
        //});
        request.addEventListener("loadend", () => {
            if (request.status >= 200 && request.status < 300) {
                resolve(request.response);
            } else {
                reject({
                    status: request.status,
                    statusText: request.statusText
                });
            }
        });
        request.addEventListener("error", () => {
            reject({
                status: request.status,
                statusText: request.statusText
            });
        });

        request.open(options.method, resource, true);
        if(options.headers){
            for (const [key, value] of Object.entries(options.headers)) {
                request.setRequestHeader(key, value);
            }
        }
        request.send(options.body);
    });
}

