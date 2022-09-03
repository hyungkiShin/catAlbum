const BASE_URL = "https://zl3m4qq0l9.execute-api.ap-northeast-2.amazonaws.com/dev"

export const request = async (nodeId) => { // 다른 소스파일에서 사용할 함수는 export
    try {
      const res = await fetch(`${BASE_URL}/${nodeId ? nodeId : ""}`);
      if (!res.ok) throw new Error("서버의 상태가 이상합니다!");
      return await res.json();
    } catch (e) {
      throw new Error(`무엇인가 잘못 되었습니다. ${e.message}`);
    }
  };

  export const loading_request = async ({
    nodeId,
    setLoading,
    finishLoading,
  }) => {
    try {
      setLoading();
      const nodes = await request(nodeId);
      return nodes;
    } catch (e) {
      throw new Error(`무엇인가 잘못 되었습니다. ${e.message}`);
    } finally {
      finishLoading();
    }
  };