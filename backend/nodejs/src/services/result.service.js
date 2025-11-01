import axios from 'axios';
import ResultModel from '../models/result.model.js';
class ResultService {
    static async createResult(curriculumid) {
      try {
        const { subject, grade, roadmap_nodes, assessment_result } = await ResultModel.getCurriculumDetails(curriculumid);

        const checkAnswers = assessment_result.questions.map((question, idx) => ({
          index: idx + 1,
          question: question,
          isCorrect: assessment_result.isCorrect[idx]
        }));

        const ragRequestData = {
          result: {
            subject,
            grade,
            roadmap_nodes,
            checkAnswers
          }
        };
        const evalResult = await this.callRagApi(ragRequestData);
        const result = await ResultModel.create(curriculumid, evalResult);
        return result.uuid;
      } catch (error) {
        throw new Error('Error creating result: ' + error.message);
      }
    }
    static async callRagApi(ragRequestData) {
      const RAG_API_URL = process.env.RAG_API_URL;
      const response = await axios.post(`${RAG_API_URL}/api/feedback/generate`, ragRequestData);
      return response.data;
    }
}

export default ResultService;