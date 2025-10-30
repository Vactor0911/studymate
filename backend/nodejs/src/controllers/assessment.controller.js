import AssessmentService from "../services/assessment.service.js";

class AssessmentController {
  static async createProblem(req, res) {
    try {
      const userId = req.user.id; // JWT 미들웨어에서 추출
      const { curriculumId, title, grade, subject, num_questions } = req.body;
      
      const result = await AssessmentService.createProblems(
        userId, curriculumId, title, grade, subject, num_questions
      );
      res.status(201).json({
        message: "문제가 성공적으로 생성되었습니다.",
        assessmentUuid: result.assessmentUuid,
      });
    } catch (error) {
      res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
    }
  }

  static async getProblems(req, res) {
    try {
      const roadmapId = req.body.roadmapId;
      const roadmapUuid = req.body.roadmapUuid;
      const result = await AssessmentService.getProblems(roadmapId, roadmapUuid);
      res
        .status(200)
        .json({ message: "문제 목록을 성공적으로 조회하였습니다.", ...result });
    } catch (error) {
      res
        .status(500)
        .json({ message: "서버 오류가 발생했습니다.", error: error.message });
    }
  }

  static async checkAnswers(req, res) {
    try {
      const { userAnswers, curriculumId } = req.body;
      const result = await AssessmentService.checkAnswers(userAnswers, curriculumId);
      res.status(200).json({ message: "정답 확인이 완료되었습니다.", result });
    } catch (error) {
      res
        .status(500)
        .json({ message: "서버 오류가 발생했습니다.", error: error.message });
    }
  }

  static async getAssessmentResults(req, res) {
    try {
      const curriculumId = req.body.curriculumId;
      const result = await AssessmentService.getAssessmentResults(curriculumId);
      res
        .status(200)
        .json({ message: "평가 결과 조회가 완료되었습니다.", result });
    } catch (error) {
      res
        .status(500)
        .json({ message: "서버 오류가 발생했습니다.", error: error.message });
    }
  }
}

export default AssessmentController;
