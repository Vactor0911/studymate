import axios from 'axios';

const RAG_API_URL = process.env.RAG_API_URL || 'http://localhost:8000';

/**
 * FastAPI 엔드포인트 호출 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트 경로 (예: '/api/chat')
 * @param {object} data - 요청 바디
 * @param {object} options - axios 옵션
 * @returns {Promise<any>} API 응답 데이터
 */
export async function callFastAPI(endpoint, data, options = {}) {
    try {
        const response = await axios.post(
            `${RAG_API_URL}${endpoint}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30초 타임아웃
                ...options
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            // FastAPI에서 반환한 에러
            const detail = error.response.data?.detail || error.response.statusText;
            throw new Error(`FastAPI Error (${error.response.status}): ${detail}`);
        } else if (error.request) {
            // 요청은 보냈으나 응답 없음
            throw new Error('FastAPI에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
        } else {
            // 기타 에러
            throw new Error(`FastAPI 호출 실패: ${error.message}`);
        }
    }
}

export default { callFastAPI };
