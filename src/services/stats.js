import API from "./api";

export const statsService = {
  getPublicLiveStats: async () => {
    const response = await API.get("/public/live-stats");
    return response.data;
  },

  getShopkeeperStats: async () => {
    const response = await API.get("/shopkeeper/dashboard-stats");
    return response.data;
  }
};

export default statsService;
