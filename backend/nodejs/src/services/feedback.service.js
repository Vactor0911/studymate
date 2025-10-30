import { callFastAPI } from '../utils/fastapi.js';

class FeedbackService {
    /**
     * 평가 결과를 기반으로 AI 피드백을 생성합니다.
     * @param {string} subject - 과목
     * @param {string} grade - 학년
     * @param {array} roadmap_nodes - 로드맵 노드 배열
     * @param {object} assessment_results - 평가 결과
     * @returns {Promise<object>} 피드백 데이터
     */
    static async generateFeedback(subject, grade, roadmap_nodes, assessment_results) {
        try {
            const response = await callFastAPI('/api/feedback/generate', {
                subject,
                grade,
                roadmap_nodes,
                assessment_results
            });
            
            // 응답: { feedback_summary, strengths, weaknesses, recommendations }
            return response;
        } catch (error) {
            throw new Error(`피드백 생성 오류: ${error.message}`);
        }
    }
}

export default FeedbackService;
