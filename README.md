# Uploader Overview

```mermaid
stateDiagram-v2
    User --> Client
    Upload --> ZipFile
    ZipFile --> PresignedURL_Zip
    CreateStatus --> status.json
    status.json --> Status
    Unzip --> FileSet
    CreateTritonModel --> TritonModel
    TestTritonModel --> BioEngineRunner
    TritonModel --> BioEngineRunner
    Publish --> PublishedFileSet
    PresignedURL_Zip --> Unzip


    state Client {
        Add --> Edit
        Edit --> Verify
        Verify --> Upload
        PresignedURL_Zip
        Status 
    }

    state CI{
        CreateStatus
        Unzip --> TestModel
        TestModel --> CreateTritonModel
        CreateTritonModel --> TestTritonModel
        TestTritonModel --> Publish
    }

    state HyphaAppEngine {
        HyphaS3
        BioEngineRunner

        state HyphaS3{
            ZipFile
        }
    }

    state EBI_S3 {
        status.json
        FileSet
        TritonModel
    }

    state Zenodo {
        PublishedFileSet
    }

```


## Developing

Start a development server:

```bash
ntl dev

# or run without netlify functions: 
npm run dev 
```

## Building

To create a production version of the app:

```bash
npm run build
```
