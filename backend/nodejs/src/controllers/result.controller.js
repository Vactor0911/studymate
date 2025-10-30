import ResultService from '../services/result.service.js';

class ResultController {
    static async createResult(req, res) {
        try {
          const curriculumid = req.body.curriculumid;
          const result = await ResultService.createResult(curriculumid);
          res.status(201).json({
              message: "Result created successfully",
              resultId: result.uuid
          });
        } catch (error) {
          res.status(500).json({
              message: "Error creating result",
              error: error.message
          });
        }
    }
    static async getResult(req, res) {
      try {
        const resultUuid = req.body.resultUuid;
        const result = await ResultService.getResult(resultUuid);
        res.status(200).json({
            message: "Result fetched successfully",
            result: result
        });
      } catch (error) {
        res.status(500).json({
            message: "Error fetching result",
            error: error.message
        });
      }
    }
}

export default ResultController;