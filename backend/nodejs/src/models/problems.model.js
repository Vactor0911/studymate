import { dbPool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

class ProblemsModel {
    // 문제를 생성합니다
    static async create(userId, roadmapId, problems) {
        const problemUuid = uuidv4();
        await dbPool.execute(
            "INSERT INTO exam (uuid, user_id, curriculum_id, exam, created_at) VALUES (?, ?, ?, ?, ?)",
            [problemUuid, userId, roadmapId, problems, new Date()]
        );
        return { problemUuid };
    }
    // RoadMap과 UUID로 문제를 조회합니다.
    static async findByRoadmapAndUuid(roadmapId, roadmapUuid) {
            const rows = await dbPool.execute(
                "SELECT id, exam FROM exam WHERE curriculum_id = ? AND uuid = ?",
                [roadmapId, roadmapUuid]
            );
        return rows;
    }
    // examId로 가져옵니다.
    static async findByExamId(examId) {
        const rows = await dbPool.execute(
            "SELECT exam FROM exam WHERE id = ?",
            [examId]
        );
        return rows;
    } 
    // 시험 결과를 업데이트합니다.
    static async updateExamResult(testResult, examId) {
        await dbPool.execute(
            "UPDATE exam SET test_result = ? WHERE id = ?",
            [JSON.stringify(testResult), examId]
        ); 
    }
}

export default ProblemsModel;
