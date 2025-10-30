import { v4 as uuidv4 } from 'uuid';
import { callFastAPI } from '../utils/fastapi.js';
import AssessmentModel from '../models/assessment.model.js';

class AssessmentService {
    /**
     * RoadMap에 문제를 생성합니다.
     * @param {BigInt} userId - 사용자 ID
     * @param {BigInt} curriculumId - 커리큘럼 ID
     * @param {string} title - 문제 주제
     * @param {string} grade - 학년
     * @param {string} subject - 과목
     * @param {number} num_questions - 문제 개수 (기본 5)
     * @returns {Object} 생성된 문제의 UUID
     */
    static async createProblems(userId, curriculumId, title, grade, subject, num_questions = 5) {
        try {
            const problemsData = await callFastAPI('/api/assessment/generate', {
                title,
                grade,
                subject,
                num_questions
            });
            
            // 응답 구조: { passage, questions: [{question, options, answer, explanation}], metadata }
            const problems = JSON.stringify(problemsData);
            const assessmentUuid = uuidv4();
            
            await AssessmentModel.create(assessmentUuid, userId, curriculumId, problems);
            return { assessmentUuid };
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
            console.log('checkAnswers 호출됨 - curriculumId:', curriculumId);
            console.log('userAnswers:', userAnswers);

            const rows = await AssessmentModel.findByCurriculumId(curriculumId);
            console.log('조회된 행 수:', rows.length);

            if (!rows || rows.length === 0) {
                throw new Error(`curriculum_id ${curriculumId}에 해당하는 평가를 찾을 수 없습니다.`);
            }

            const problems = JSON.parse(rows[0].assessment);
            const questionsAnswers = problems.questions.map(questions => questions.answer);
            const result = userAnswers.map((answer, index) => {
                const isCorrect = answer === questionsAnswers[index];
                return {
                    problemNumber: index+1,
                    question : problems.questions[index].question,
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

            console.log('업데이트 전 testResult:', testResult);
            const updateResult = await AssessmentModel.updateExamResult(testResult, curriculumId);
            console.log('업데이트 결과:', updateResult);

            return testResult;
        }
        catch (error) {
            console.error('checkAnswers 에러:', error);
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
}

export default AssessmentService;
