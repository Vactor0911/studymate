import axios from 'axios';
import AssessmentModel from '../models/assessment.model.js';

class AssessmentService {
    /**
     * RoadMap에 문제를 생성합니다.
     * @param {BigInt} userId - 사용자 ID
     * @param {BigInt} roadmapId - 로드맵 ID
     * @returns {Object} 생성된 문제의 UUID
     */
    static async createProblems(userId, roadmapId) {
        try {
            const problemsData = this.callRagApi(subject, grade);
            const problems = JSON.stringify(problemsData);
            const result = await AssessmentModel.create(userId, roadmapId, problems);
            return result;
        }
        catch (error) {
            throw new Error(`문제 생성 실패: ${error.message}`);
        }
    }
    /**
     * RoadMap의 문제를 가져옵니다.
     * @param {BigInt} roadmapId 
     * @returns {Longtext} Json 형식의 문제 데이터
     */
    static async getProblems(roadmapId, assessmentUuid) {
        try {
            const rows = await AssessmentModel.findByRoadmapAndUuid(roadmapId, assessmentUuid);
            const examId = String(rows[0].id);
            const problems = JSON.parse(rows[0].assessment);
            const questionsWithoutAnswers = problems.questions.map(questions => ({
                question: questions.question,
                options: questions.options
            }));
            return {
                examId,
                problems: {
                    passage: problems.passage,
                    questions: questionsWithoutAnswers
                }
            };
        }
        catch (error) {
            throw new Error(`문제 조회 실패: ${error.message}`);
        }
    }
    /**
     * 문제 정답을 확인합니다.
     * @param {*} userAnswers 
     * @param {*} examId 
     * @returns 
     */
    static async checkAnswers(userAnswers, curriculumId) {
        try {
            const rows = await AssessmentModel.findByCurriculumId(curriculumId);
            const problems = JSON.parse(rows[0].assessment);
            const questionsAnswers = problems.questions.map(questions => questions.answer);
            const result = userAnswers.map((answer, index) => {
                const isCorrect = answer === questionsAnswers[index];
                return {
                    problemNumber: index+1,
                    userAnswer: answer,
                    correctAnswer: questionsAnswers[index],
                    isCorrect
                };
            });
            const correctCount = result.filter(r => r.isCorrect).length;
            const testResult = {
                result,
                corrects: correctCount
            };
            await AssessmentModel.updateExamResult(testResult, curriculumId);
            return testResult;
        }
        catch (error) {
            throw new Error(`정답 확인 실패: ${error.message}`);
        }
    }
    // 각 문제 풀이 후 평가 결과를 가져옵니다.
    static async getAssessmentResults(curriculumId) {
        try {
            const rows = await AssessmentModel.getTestResultByCurriculumId(curriculumId);
            return JSON.parse(rows[0].test_result);
        }
        catch (error) {
            throw new Error(`평가 결과 조회 실패: ${error.message}`);
        }   
    }
    static async callRagApi(query, grade, subject, sub_subject, num_questions, num_choices, retrieval_limit) {
        const RAG_API_URL = process.env.RAG_API_URL;
        const response = await axios.post(`${RAG_API_URL}/api/assessment/generate`, {
            query,
            grade,
            subject,
            sub_subject,
            num_questions,
            num_choices,
            retrieval_limit
        });
        return response.data;
    }
}

export default AssessmentService;
