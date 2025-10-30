import { dbPool } from '../config/db.js';

class RoadmapModel {
    static async createRoadMap(roadmapUuid, userId, roadmapData, subject, grade) {
        await dbPool.execute(
            'INSERT INTO curriculum (uuid, user_id, curriculum, created_at, subject, grade) VALUES (?, ?, ?, ?, ?, ?)',
            [roadmapUuid, userId, roadmapData, new Date(), subject, grade]
        )
    }
    static async getRoadMaps(userId) {
        const result = await dbPool.execute(
            'SELECT uuid, curriculum, subject, grade, created_at FROM curriculum WHERE user_id = ?',
            [userId]
        );
        return result;
    }
    static async getRoadMap(roadmapUuid, userId) {
        const result = await dbPool.execute(
            'SELECT id, curriculum, subject, grade, created_at FROM curriculum WHERE uuid = ? AND user_id = ?',
            [roadmapUuid, userId]
        );
        return result;
    }
}

export default RoadmapModel;