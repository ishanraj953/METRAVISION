import API from "./api";

export const violationService = {
  getAllViolations: async (statusFilter = null, productId = null) => {
    let url = "/violations/";
    const params = [];
    if (statusFilter) params.push(`status_filter=${statusFilter}`);
    if (productId) params.push(`product_id=${productId}`);
    if (params.length) url += `?${params.join("&")}`;
    const response = await API.get(url);
    return response.data;
  },

  getViolationById: async (violationId) => {
    const response = await API.get(`/violations/${violationId}`);
    return response.data;
  },

  getViolationEvidence: async (violationId) => {
    const response = await API.get(`/violations/${violationId}/evidence`);
    return response.data;
  },

  submitOfficerDecision: async (violationId, decision, remarks = "") => {
    const response = await API.post(`/violations/${violationId}/decision`, {
      decision: decision, // CONFIRMED | REJECTED | MANUAL_REVIEW | REQUEST_BETTER_IMAGE
      remarks: remarks
    });
    return response.data;
  }
};

export default violationService;