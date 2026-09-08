import API from "./api";

export const violationService = {
  getAllViolations: async () => {
    const response = await API.get("/violations");
    return response.data;
  },

  reportViolation: async (violationData) => {
    const response = await API.post("/violations", violationData);
    return response.data;
  },
};