import { dbPool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

class AssessmentModel {
    // 문제를 생성합니다
    static async create(userId, roadmapId, problems) {
        const problemUuid = uuidv4();
        await dbPool.execute(
            "INSERT INTO assessment (uuid, user_id, curriculum_id, assessment, created_at) VALUES (?, ?, ?, ?, ?)",
            [problemUuid, userId, roadmapId, problems, new Date()]
        );
        return { problemUuid };
    }
    // RoadMap과 UUID로 문제를 조회합니다.
    static async findByRoadmapAndUuid(roadmapId, roadmapUuid) {
            const rows = await dbPool.execute(
                "SELECT id, assessment FROM assessment WHERE curriculum_id = ? AND uuid = ?",
                [roadmapId, roadmapUuid]
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
        await dbPool.execute(
            "UPDATE assessment SET test_result = ? WHERE curriculum_id = ?",
            [JSON.stringify(testResult), curriculum_id]
        ); 
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
