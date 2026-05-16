const studentService = require("../services/studentService");

function normalizeMessage(message, type = "success") {
  return { text: message, type };
}

async function renderDashboard(req, res, next) {
  try {
    const search = (req.query.search || "").trim();
    const data = await studentService.getDashboardData(search);

    res.render("dashboard", {
      title: "Student Management System",
      search,
      message: req.query.message
        ? normalizeMessage(req.query.message, req.query.type || "success")
        : null,
      ...data
    });
  } catch (error) {
    next(error);
  }
}

async function createStudent(req, res, next) {
  try {
    const { studentName, fatherName, motherName, address } = req.body;

    if (!studentName || !fatherName || !motherName || !address) {
      return res.redirect(
        "/?message=All student fields are required.&type=error"
      );
    }

    await studentService.createStudent({
      studentName: studentName.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      address: address.trim()
    });

    return res.redirect("/?message=Student added successfully.&type=success");
  } catch (error) {
    if (error.code === "STUDENT_NOT_FOUND") {
      return res.redirect("/?message=Selected student was not found.&type=error");
    }

    return next(error);
  }
}

async function addMarks(req, res, next) {
  try {
    const { studentId, subjectName, marksObtained, maxMarks } = req.body;

    if (!studentId || !subjectName || !marksObtained || !maxMarks) {
      return res.redirect(
        "/?message=All marks fields are required.&type=error"
      );
    }

    const marksValue = Number(marksObtained);
    const maxValue = Number(maxMarks);

    if (Number.isNaN(marksValue) || Number.isNaN(maxValue) || maxValue <= 0) {
      return res.redirect(
        "/?message=Marks must be valid numbers and max marks must be greater than 0.&type=error"
      );
    }

    if (marksValue < 0 || marksValue > maxValue) {
      return res.redirect(
        "/?message=Obtained marks must be between 0 and max marks.&type=error"
      );
    }

    await studentService.addStudentMark({
      studentId: Number(studentId),
      subjectName: subjectName.trim(),
      marksObtained: marksValue,
      maxMarks: maxValue
    });

    return res.redirect("/?message=Student marks added successfully.&type=success");
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  renderDashboard,
  createStudent,
  addMarks
};
