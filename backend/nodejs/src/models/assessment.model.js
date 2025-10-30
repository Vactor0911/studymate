import { dbPool } from "../config/db.js";

class AssessmentModel {
    // 문제를 생성합니다
    static async create(assessmentUuid, userId, curriculumId, problems) {
        await dbPool.execute(
            "INSERT INTO assessment (uuid, user_id, curriculum_id, assessment, created_at) VALUES (?, ?, ?, ?, ?)",
            [assessmentUuid, userId, curriculumId, problems, new Date()]
        );
        return { assessmentUuid };
    }
    // RoadMap과 UUID로 문제를 조회합니다.
    static async findByRoadmapAndUuid(roadmapId, assessmentUuid) {
        const rows = await dbPool.execute(
            "SELECT id, assessment FROM assessment WHERE curriculum_id = ? AND uuid = ?",
            [roadmapId, assessmentUuid]
        );
        return rows;
    } 
    // curriculumId로 가져옵니다.
    static async findByCurriculumId(curriculumId) {
        const rows = await dbPool.execute(
            "SELECT assessment FROM assessment WHERE curriculum_id = ?",
            [curriculumId]
        );
        return rows;
    } 
    // 시험 결과를 업데이트합니다.
    static async updateExamResult(testResult, curriculum_id) {
        const result = await dbPool.execute(
            "UPDATE assessment SET test_result = ? WHERE curriculum_id = ?",
            [JSON.stringify(testResult), curriculum_id]
        );
        if (result.affectedRows === 0) {
            throw new Error(`curriculum_id ${curriculum_id}에 해당하는 데이터를 찾을 수 없습니다.`);
        }
        return result;
    }
    // curriculumId로 평가 결과를 가져옵니다.
    static async getTestResultByCurriculumId(curriculumId) {
        const rows = await dbPool.execute(
            "SELECT test_result FROM assessment WHERE curriculum_id = ?",
            [curriculumId]
        );
        return rows;
    }
}

export default AssessmentModel;
