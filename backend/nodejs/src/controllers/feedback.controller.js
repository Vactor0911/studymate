import FeedbackService from "../services/feedback.service.js";

class FeedbackController {
    /**
     * AI 피드백을 생성합니다.
     */
    static async generateFeedback(req, res) {
        try {
            const userId = req.user.id; // JWT 미들웨어에서 추출
            const { subject, grade, roadmap_nodes, assessment_results } = req.body;
            
            // 필수 파라미터 검증
            if (!assessment_results) {
                return res.status(400).json({ 
                    message: "평가 결과가 필요합니다.",
                    error: "assessment_results 필드는 필수입니다." 
                });
            }
            
            const feedback = await FeedbackService.generateFeedback(
                subject, grade, roadmap_nodes, assessment_results
            );
            
            res.status(200).json(feedback);
        } catch (error) {
            res.status(500).json({ 
                message: "피드백 생성 실패", 
                error: error.message 
            });
        }
    }
}

export default FeedbackController;
