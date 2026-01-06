import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/", (req, res) => {
  const { stream, semester, regulation } = req.query;

  if (!stream || !semester) {
    return res.status(400).json({
      error: "stream and semester are required"
    });
  }

  try {
    const filePath = path.resolve(
      "data",
      `${stream.toLowerCase()}.json`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "Stream not found"
      });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    // 🔥 AUTO-DETECT regulation if not provided
    const availableRegulations = Object.keys(data.regulations || {});
    const activeRegulation =
      regulation || availableRegulations[availableRegulations.length - 1];

    const semesterKey = String(semester);

    const subjects =
      data.regulations?.[activeRegulation]?.[semesterKey];

    if (!subjects) {
      return res.status(404).json({
        error: "No subjects found for given semester"
      });
    }

    res.json({
      stream: stream.toUpperCase(),
      regulation: activeRegulation,
      semester: semesterKey,
      subjects
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error"
    });
  }
});

export default router;
