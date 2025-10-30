import CurriculumService from "../services/curriculum.service.js";

class CurriculumController {
    static async createRoadMap(req, res) {
        try {
            const userId = req.user.id; // JWT 미들웨어에서 추출
            const { subject, grade } = req.body;
            const result = await CurriculumService.createRoadMap(userId, subject, grade);
            res.status(201).json({
                message: "로드맵이 성공적으로 생성되었습니다.",
                roadMapUuid: result.roadMapUuid
            });
        } 
        catch (error) {
            res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
        }
    }
    static async getRoadMaps(req, res) {
        try {
            const userId = req.user.id; // JWT 미들웨어에서 추출
            const roadMaps = await CurriculumService.getRoadMaps(userId);
            res.status(200).json(roadMaps);
        } 
        catch (error) {
            res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
        }
    }
    static async getRoadMap(req, res) {
        try {
            const userId = req.user.id; // JWT 미들웨어에서 추출
            const curriculumUuid = req.params.curriculumUuid;
            const roadMap = await CurriculumService.getRoadMap(curriculumUuid, userId);
            res.status(200).json(roadMap);
        }
        catch (error) {
            res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
        }
    }

    static async updateCurriculum(req, res) {
        try {
            const userId = req.user.id; // JWT 미들웨어에서 추출
            const { subject, grade, assessment_results, roadmap_nodes } = req.body;
            
            const result = await CurriculumService.updateCurriculum(
                userId, subject, grade, assessment_results, roadmap_nodes
            );
            res.status(200).json({
                message: "커리큘럼이 성공적으로 업데이트되었습니다.",
                ...result
            });
        } catch (error) {
            res.status(500).json({ message: "커리큘럼 업데이트 실패", error: error.message });
        }
    }
}

export default CurriculumController;
