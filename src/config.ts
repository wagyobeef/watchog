const useLocalApi = process.env.USE_LOCAL_API === "true";
const prodServerUrl = process.env.PROD_SERVER_URL || "";

export const API_BASE_URL = useLocalApi
  ? "http://localhost:3001/api"
  : `${prodServerUrl}/api`;
