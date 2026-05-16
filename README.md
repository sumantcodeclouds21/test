# Student Management System

This project is a simple student management system built with Node.js, Express, EJS, and CSV files.

## Features

- Add student information
- Add subject-wise marks
- Search students by name
- Display students in table format
- Show top students by percentage

## Project Structure

```text
.
├── data/
│   ├── student_marks.csv
│   └── students.csv
├── src/
│   ├── controllers/
│   ├── public/
│   ├── routes/
│   ├── services/
│   └── views/
├── .env.example
├── package.json
└── server.js
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the project:

```bash
npm run dev
```

3. Open `http://localhost:3000`

The app will automatically create and use these project files:

- [students.csv](/Users/codeclouds-sumant/Desktop/learning/data/students.csv:1)
- [student_marks.csv](/Users/codeclouds-sumant/Desktop/learning/data/student_marks.csv:1)

## Main Pages

- `/` Dashboard for student data, search, marks, and top percentage list

## Deploy On Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Deploy normally using [api/index.js](/Users/codeclouds-sumant/Desktop/learning/api/index.js:1) and [vercel.json](/Users/codeclouds-sumant/Desktop/learning/vercel.json:1).

On Vercel, the app now copies the bundled CSV files into `/tmp` at runtime before reading and writing.

Important: this only avoids the read-only `/var/task` error. Vercel serverless file writes are still temporary, so CSV is best for demos or short-lived testing, not permanent production data.

## Notes

- Marks percentage is calculated from total obtained marks divided by total max marks.
- CSV files are created automatically when the app starts using the service layer.
- On Vercel, CSV changes are written to `/tmp` and may be lost between invocations or redeployments.
