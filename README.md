# Task Management Application

Angular application for managing tasks with CRUD operations, routing, and responsive design.

## Features

- Create, edit, and delete tasks
- Task state management (new, active, resolved, closed)
- Pagination
- Form validation
- Responsive design

## Tech Stack

- Angular 21
- TypeScript
- RxJS
- json-server (mock API)
- SCSS
- Jasmine / Karma (testing)

## Setup

```bash
npm install
npm start
```

App runs at `http://localhost:4200`.

## Mock API

Serves `db.json` via json-server:

```bash
npm run api
```

API available at `http://localhost:3000/tasks`.

## Testing

```bash
npm test
```
