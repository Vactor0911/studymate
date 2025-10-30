import { dbPool } from '../config/db.js';

class CurriculumModel {
    static async createRoadMap(roadmapUuid, userId, roadmapData, subject, grade) {
        await dbPool.execute(
            'INSERT INTO curriculum (uuid, user_id, curriculum, created_at, subject, grade) VALUES (?, ?, ?, ?, ?, ?)',
            [roadmapUuid, userId, roadmapData, new Date(), subject, grade]
        )
    }
    static async getRoadMaps(userId) {
        const [rows] = await dbPool.execute(
            'SELECT uuid, curriculum, subject, grade, created_at FROM curriculum WHERE user_id = ?',
            [userId]
        );
        return rows;
    }
    static async getRoadMap(roadmapUuid, userId) {
        const result = await dbPool.execute(
            'SELECT id, curriculum, subject, grade, created_at FROM curriculum WHERE uuid = ? AND user_id = ?',
            [roadmapUuid, userId]
        );
        const rows = Array.isArray(result) ? result : [result];

        if (rows.length > 0 && rows[0].id) {
            rows[0].id = String(rows[0].id);
        }
        return rows;
    }
}

export default CurriculumModel;