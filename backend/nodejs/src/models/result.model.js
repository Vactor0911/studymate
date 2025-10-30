import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../config/db.js";
import CurriculumModel from "./curriculum.model.js";
import AssessmentModel from "./assessment.model.js";
class ResultModel {
  static async create(curriculumid, evalResult) {
    const resultUuid = uuidv4();
    await dbPool.execute(
      "INSERT INTO result (uuid, curriculum_id, eval_result, created_at) VALUES (?, ?, ?, ?)",
      [resultUuid, curriculumid, evalResult, new Date()]
    );
    return { uuid: resultUuid };
  }
  static async findByResultUuid(resultUuid) {
    const rows = await dbPool.execute(
      "SELECT eval_result FROM result WHERE uuid = ?",
      [resultUuid]
    );
    return rows;
  }
  static async getCurriculumDetails(curriculumid) {
    const curriculum = await CurriculumModel.getRoadMap(curriculumid);
    const assessment = await AssessmentModel.getTestResultByCurriculumId(curriculumid);
    return {
      subject: curriculum.subject,
      grade: curriculum.grade,
      roadmap_nodes: curriculum.curriculum,
      assessment_result: {
        problemNumber: assessment[0].problemNumber,
        questions: assessment[0].questions,
        isCorrect: assessment[0].isCorrect
      }
    }
  }
}

export default ResultModel;