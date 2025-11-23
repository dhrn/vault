# AI Document Vault - Case Study

## Objective

The goal of this project is to design and build a prototype of an
AI-powered document management system, which we'll call the "AI Document
Vault". The core idea is to create a user-friendly interface for
uploading, managing, and interacting with documents, where AI is used to
automatically process and enrich the documents with summaries and other
structured data.

## Background

In many professional environments, managing a large number of documents
(like reports, contracts, articles, etc.) is a common challenge. Finding
information quickly and understanding the gist of a document without
reading it entirely can save a lot of time. The AI Document Vault aims
to solve this by providing a central place to store documents and using
AI to make them more accessible and useful.

## Requirements

### User Interface (UI)

-   A clean and intuitive interface for a document "vault".
-   A file and folder explorer view to navigate the uploaded documents.
-   A mechanism to upload one or more documents, ideally with
    drag-and-drop support.
-   A view to display a selected document's content, along with the
    AI-generated summary and markdown.

### Backend

-   A simple backend service (e.g., using Node.js/Express,
    Python/FastAPI, or any other framework you are comfortable with).
-   An endpoint to handle file uploads.
-   The backend should be able to store the files (local FS, S3, or
    Supabase Storage).
-   It should also store the generated summary and markdown for each
    file.

### AI Integration

-   Backend must call an external AI service (Anthropic Claude, etc.)
-   For each uploaded document, generate:
    1.  A concise summary
    2.  A markdown version that cleans structure/formatting
-   Store original + summary + markdown.

## Suggested Technical Stack

-   Frontend: React, Vue, or Angular
-   Backend: Node.js (Express) or Python (FastAPI)
-   AI: Claude API or similar

## Deliverables

-   Complete source code (frontend + backend)
-   README.md with setup instructions, design explanation, assumptions
-   Optional screenshots/video

## Evaluation Criteria

-   Code Quality
-   User Experience
-   Problem Solving
-   Completeness
-   Communication

Good luck!
