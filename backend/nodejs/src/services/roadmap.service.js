import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import RoadMapModel from '../models/roadmap.model.js';

class RoadMapService {
    /**
     * 로드맵을 생성합니다.
     * @param {BigInt} userId - 사용자 ID
     * @param {Enum} subject - 과목
     * @param {Enum} grade - 학년
     * @param {Enum} period - 기간
     * @returns {Object} 생성된 로드맵의 UUID
     */
    static async createRoadMap(userId, subject, grade, learning_goal, study_duration) {
        try {
            const roadmap = await callRagApi(userId, subject, learning_goal, grade, study_duration);
            const roadmapData = JSON.stringify(roadmap);
            const roadMapUuid = uuidv4();
            await RoadMapModel.createRoadMap(roadMapUuid, userId, roadmapData, subject, grade);
            return { roadMapUuid };
        }
        catch (error) {
            throw new Error(`로드맵 생성 중 오류가 발생했습니다: ${error.message}`); 
        }
        finally {
            connection.release();
        }
    }
    /**
     * User의 로드맵을 가져옵니다.
     * @param {} userId - 사용자 ID
     * @returns {} User의 로드맵 목록
     */
    static async getRoadMaps(userId) {
        try {
            const result = await RoadMapModel.getRoadMaps(userId);
            return result;
        }
        catch (error) {
            throw new Error(`로드맵 조회 중 오류가 발생했습니다: ${error.message}`);
        }
        finally {
            connection.release();
        }
    }
    /**
     * User의 특정 RoadMap을 가져옵니다.
     * @param {string} roadmapUuid - 로드맵 UUID
     * @param {BigInt} userId - 사용자 ID
     * @returns {Json} 로드맵 JSON 데이터
     */
    static async getRoadMap(roadmapUuid, userId) {
        try {
            const result = await RoadMapModel.getRoadMap(roadmapUuid, userId);
            return result;
        }
        catch (error) {
            throw new Error(`로드맵 조회 중 오류가 발생했습니다: ${error.message}`);
        }
        finally {
            connection.release();
        }
    }
    static async callRagApi(userId, subject, grade, learning_goal, study_duration) {
        try {
            const result = await callRagApi(userId, subject, grade, learning_goal, study_duration);
            return result;
        }
        catch (error) {
            throw new Error(`RAG API 호출 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}


/**
 * RAG API를 호출하여 로드맵 데이터를 생성합니다.
 * @param {Enum} subject - 과목
 * @param {Enum} grade - 학년
 * @param {Enum} period - 기간
 * @returns {Object} 생성된 로드맵 데이터
 */
async function callRagApi(userId, subject, grade, learning_goal, study_duration) {
    const RAG_API_URL = process.env.RAG_API_URL;
    const response = await axios.post(`${RAG_API_URL}/api/curriculum/generate`, {
        userId,
        subject,
        grade,
        learning_goal,
        study_duration
    });
    return response.data;
}

export default RoadMapService;