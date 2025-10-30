import CurriculumService from "../services/curriculum.service.js";

class CurriculumController {
    static async createRoadMap(req, res) {
        try {
            const userId = 1;
            const { subject, grade, learning_goal, study_duration } = req.body;
            const result = await CurriculumService.createRoadMap(userId, subject, grade, learning_goal, study_duration);
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
            // 추후 로직 추가 예정
            const userId = 1;
            const roadMaps = await CurriculumService.getRoadMaps(userId);
            res.status(200).json(roadMaps);
        } 
        catch (error) {
            res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
        }
    }
    static async getRoadMap(req, res) {
        try {
            const userId = 1;
            const curriculumUuid = req.params.curriculumUuid;
            const roadMap = await CurriculumService.getRoadMap(curriculumUuid, userId);
            res.status(200).json(roadMap);
        }
        catch (error) {
            res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
        }
    }
}

export default CurriculumController;
