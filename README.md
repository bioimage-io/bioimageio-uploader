# Uploader Overview

```mermaid
stateDiagram-v2
    User --> Client
    Upload --> CI
    Upload --> ZipFile
    ZipFile --> PresignedURL
    CreateStatus --> status.json
    status.json --> Status
    Unzip --> FileSet
    CreateTritonModel --> TritonModel
    TestTritonModel --> BioEngineRunner
    TritonModel --> BioEngineRunner
    Publish --> PublishedFileSet

    state Client {
        Add --> Edit
        Edit --> Verify
        Verify --> Upload
        Upload --> PresignedURL
        PresignedURL --> Status
    }

    state CI{
        CreateStatus --> Unzip
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
