import { v4 as uuidv4 } from 'uuid';
import { callFastAPI } from '../utils/fastapi.js';
import CurriculumModel from '../models/curriculum.model.js';

class CurriculumService {
    /**
     * 로드맵을 생성합니다.
     * @param {BigInt} userId - 사용자 ID
     * @param {string} subject - 과목
     * @param {string} grade - 학년
     * @returns {Object} 생성된 로드맵의 UUID
     */
    static async createRoadMap(userId, subject, grade) {
        try {
            const roadmap = await callFastAPI('/api/curriculum/generate', {
                subject,
                grade
            });
            const roadmapData = JSON.stringify(roadmap);
            const roadMapUuid = uuidv4();
            await CurriculumModel.createRoadMap(roadMapUuid, userId, roadmapData, roadmap.subject, roadmap.grade);
            return { roadMapUuid };
        }
        catch (error) {
            throw new Error(`로드맵 생성 중 오류가 발생했습니다: ${error.message}`);
        }
    }
    /**
     * User의 로드맵을 가져옵니다.
     * @param {} userId - 사용자 ID
     * @returns {} User의 로드맵 목록
     */
    static async getRoadMaps(userId) {
        try {
            const result = await CurriculumModel.getRoadMaps(userId);
            return result.map(row => ({
                ...row,
                curriculum: JSON.parse(row.curriculum)  // 문자열 → 객체
            }));
        }
        catch (error) {
            throw new Error(`로드맵 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }
    /**
     * User의 특정 RoadMap을 가져옵니다.
     * @param {string} roadmapUuid - 로드맵 UUID
     * @param {BigInt} userId - 사용자 ID
     * @returns {Json} 로드맵 JSON 데이터
     */
    static async getRoadMap(curriculumUuid, userId) {
        try {
            const rows = await CurriculumModel.getRoadMap(curriculumUuid, userId);
            return rows.map(row => ({
                ...row,
                curriculum: JSON.parse(row.curriculum)
            }));
        }
        catch (error) {
            throw new Error(`로드맵 조회 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 커리큘럼을 업데이트합니다.
     * @param {BigInt} userId - 사용자 ID
     * @param {string} subject - 과목
     * @param {string} grade - 학년
     * @param {object} assessment_results - 평가 결과
     * @param {array} roadmap_nodes - 기존 로드맵 노드
     * @returns {Object} 업데이트된 로드맵 UUID
     */
    static async updateCurriculum(userId, subject, grade, assessment_results, roadmap_nodes) {
        try {
            const updatedRoadmap = await callFastAPI('/api/curriculum/update', {
                subject,
                grade,
                assessment_results,
                roadmap_nodes
            });
            
            // DB에 업데이트된 커리큘럼 저장 (새로운 버전으로)
            const roadmapData = JSON.stringify(updatedRoadmap);
            const roadMapUuid = uuidv4();
            await CurriculumModel.createRoadMap(roadMapUuid, userId, roadmapData, updatedRoadmap.subject, updatedRoadmap.grade);
            
            return { roadMapUuid, updatedRoadmap };
        }
        catch (error) {
            throw new Error(`커리큘럼 업데이트 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}

export default CurriculumService;