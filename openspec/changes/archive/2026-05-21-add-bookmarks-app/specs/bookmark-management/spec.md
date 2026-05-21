## ADDED Requirements

### Requirement: User can view saved bookmarks
The system SHALL provide a user interface that displays the current list of saved bookmarks, and each displayed bookmark SHALL include its link and the date it was added. If a bookmark title exists, the system SHALL display it alongside the link.

#### Scenario: Bookmarks are loaded for display
- **WHEN** the bookmarks screen is opened
- **THEN** the system loads saved bookmarks from the backend and renders them as a list

#### Scenario: Bookmark with optional title is displayed
- **WHEN** a saved bookmark includes a title
- **THEN** the rendered list item shows the title, link, and date of addition

#### Scenario: Bookmark without title is displayed
- **WHEN** a saved bookmark does not include a title
- **THEN** the rendered list item still shows the link and date of addition

### Requirement: User can add a bookmark
The system SHALL provide a bookmark creation form with a required link field and an optional title field. The backend SHALL reject create requests that do not contain a valid link value, and the frontend SHALL clear the form after a successful bookmark creation without showing a confirmation step.

#### Scenario: Bookmark is added with link only
- **WHEN** the user submits the form with a valid link and no title
- **THEN** the system creates the bookmark, stores a null or empty title value, clears the form, and shows the new bookmark in the list

#### Scenario: Bookmark is added with link and title
- **WHEN** the user submits the form with a valid link and a title
- **THEN** the system creates the bookmark, clears the form, and shows the new bookmark in the list with its title

#### Scenario: Bookmark add is rejected without a link
- **WHEN** the user attempts to submit the form without a link
- **THEN** the system does not create a bookmark and indicates that the link field is required

### Requirement: User can delete a bookmark
The system SHALL provide a delete action adjacent to each bookmark list item, and deleting a bookmark SHALL not require an additional confirmation step.

#### Scenario: Bookmark is deleted from the list
- **WHEN** the user activates delete for a bookmark
- **THEN** the system removes the bookmark from persistent storage and the bookmark no longer appears in the rendered list

### Requirement: Bookmark data is persisted in PostgreSQL
The backend SHALL persist bookmarks in PostgreSQL using a connection configured through the `DATABASE_URL` environment variable. Each persisted bookmark SHALL include a server-generated identifier and creation timestamp.

#### Scenario: Bookmark is returned with creation metadata
- **WHEN** the backend returns bookmark data for listing or creation
- **THEN** each bookmark object includes its identifier, link, optional title, and creation timestamp
