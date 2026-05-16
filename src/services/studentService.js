const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "..", "data");
const studentsFile = path.join(dataDir, "students.csv");
const marksFile = path.join(dataDir, "student_marks.csv");

const studentsHeader = "id,student_name,father_name,mother_name,address";
const marksHeader = "id,student_id,subject_name,marks_obtained,max_marks";

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, "\"\"")}"`;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

async function ensureFile(filePath, header) {
  try {
    await fs.access(filePath);
  } catch (error) {
    await fs.writeFile(filePath, `${header}\n`, "utf8");
  }
}

async function ensureDataFiles() {
  await fs.mkdir(dataDir, { recursive: true });
  await ensureFile(studentsFile, studentsHeader);
  await ensureFile(marksFile, marksHeader);
}

async function readCsv(filePath) {
  await ensureDataFiles();

  const content = await fs.readFile(filePath, "utf8");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });
}

async function appendCsv(filePath, values) {
  await ensureDataFiles();

  const line = values.map(escapeCsvValue).join(",");
  await fs.appendFile(filePath, `${line}\n`, "utf8");
}

function getNextId(records) {
  const maxId = records.reduce((maxValue, record) => {
    const id = Number(record.id) || 0;
    return Math.max(maxValue, id);
  }, 0);

  return maxId + 1;
}

function toStudentSummary(student, marks) {
  const totalSubjects = marks.length;
  const totalMarks = marks.reduce(
    (sum, mark) => sum + Number(mark.marks_obtained || 0),
    0
  );
  const totalMaxMarks = marks.reduce(
    (sum, mark) => sum + Number(mark.max_marks || 0),
    0
  );
  const percentage =
    totalMaxMarks === 0 ? 0 : Number(((totalMarks / totalMaxMarks) * 100).toFixed(2));

  return {
    id: Number(student.id),
    student_name: student.student_name,
    father_name: student.father_name,
    mother_name: student.mother_name,
    address: student.address,
    total_subjects: totalSubjects,
    total_marks: Number(totalMarks.toFixed(2)),
    total_max_marks: Number(totalMaxMarks.toFixed(2)),
    percentage
  };
}

async function createStudent(student) {
  const students = await readCsv(studentsFile);
  const nextId = getNextId(students);

  await appendCsv(studentsFile, [
    nextId,
    student.studentName,
    student.fatherName,
    student.motherName,
    student.address
  ]);

  return nextId;
}

async function addStudentMark(markData) {
  const students = await readCsv(studentsFile);
  const studentExists = students.some(
    (student) => Number(student.id) === Number(markData.studentId)
  );

  if (!studentExists) {
    const error = new Error("Student not found.");
    error.code = "STUDENT_NOT_FOUND";
    throw error;
  }

  const marks = await readCsv(marksFile);
  const nextId = getNextId(marks);

  await appendCsv(marksFile, [
    nextId,
    markData.studentId,
    markData.subjectName,
    markData.marksObtained,
    markData.maxMarks
  ]);
}

async function getDashboardData(searchTerm = "") {
  const students = await readCsv(studentsFile);
  const marks = await readCsv(marksFile);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredStudents = students.filter((student) =>
    student.student_name.toLowerCase().includes(normalizedSearch)
  );

  const studentSummaries = filteredStudents
    .map((student) => {
      const studentMarks = marks.filter(
        (mark) => Number(mark.student_id) === Number(student.id)
      );
      return toStudentSummary(student, studentMarks);
    })
    .sort((first, second) =>
      first.student_name.localeCompare(second.student_name)
    );

  const topStudents = students
    .map((student) => {
      const studentMarks = marks.filter(
        (mark) => Number(mark.student_id) === Number(student.id)
      );
      return toStudentSummary(student, studentMarks);
    })
    .filter((student) => student.total_max_marks > 0)
    .sort((first, second) => {
      if (second.percentage !== first.percentage) {
        return second.percentage - first.percentage;
      }

      return first.student_name.localeCompare(second.student_name);
    })
    .slice(0, 5)
    .map((student) => ({
      id: student.id,
      student_name: student.student_name,
      percentage: student.percentage
    }));

  const marksTable = marks
    .map((mark) => {
      const student = students.find(
        (studentRecord) => Number(studentRecord.id) === Number(mark.student_id)
      );

      return {
        id: Number(mark.id),
        student_name: student ? student.student_name : "Unknown Student",
        subject_name: mark.subject_name,
        marks_obtained: Number(mark.marks_obtained),
        max_marks: Number(mark.max_marks)
      };
    })
    .sort((first, second) => {
      const studentCompare = first.student_name.localeCompare(second.student_name);
      if (studentCompare !== 0) {
        return studentCompare;
      }

      return first.subject_name.localeCompare(second.subject_name);
    });

  const studentOptions = students
    .map((student) => ({
      id: Number(student.id),
      student_name: student.student_name
    }))
    .sort((first, second) =>
      first.student_name.localeCompare(second.student_name)
    );

  return {
    students: studentSummaries,
    topStudents,
    marks: marksTable,
    studentOptions
  };
}

module.exports = {
  createStudent,
  addStudentMark,
  getDashboardData
};
