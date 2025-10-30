import axios from 'axios';
import ProblemsModel from '../models/problems.model.js';

class ProblemService {
    /**
     * RoadMap에 문제를 생성합니다.
     * @param {BigInt} userId - 사용자 ID
     * @param {BigInt} roadmapId - 로드맵 ID
     * @returns {Object} 생성된 문제의 UUID
     */
    static async createProblems(userId, roadmapId) {
        try {
            const problemsData = await callRagApi(subject, grade);
            const problems = JSON.stringify(problemsData);
            const result = await ProblemsModel.create(userId, roadmapId, problems);
            return { result };
        }
        catch (error) {
            throw new Error(`문제 생성 실패: ${error.message}`);
        }
        finally {
            connection.release();
        }
    }
    /**
     * RoadMap의 문제를 가져옵니다.
     * @param {BigInt} roadmapId 
     * @returns {Longtext} Json 형식의 문제 데이터
     */
    static async getProblems(roadmapId, roadmapUuid) {
        try {
            const rows = await ProblemsModel.findByRoadmapAndUuid(roadmapId, roadmapUuid);
            const examId = String(rows[0].id);
            const problems = JSON.parse(rows[0].exam);

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
        finally {
            connection.release();
        }
    }
    /**
     * 문제 정답을 확인합니다.
     * @param {*} userAnswers 
     * @param {*} examId 
     * @returns 
     */
    static async checkAnswers(userAnswers, examId) {
        try {
            const rows = await ProblemsModel.findByExamId(examId);
            const problems = JSON.parse(rows[0].exam);
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
            await ProblemsModel.updateExamResult(testResult, examId);
            return testResult;
        }
        catch (error) {
            throw new Error(`정답 확인 실패: ${error.message}`);
        }
        finally {
            connection.release();
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

export default ProblemService;
