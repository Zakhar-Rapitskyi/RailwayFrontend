import axiosInstance from './axiosConfig';

const API_PATH = '/routes';

const routeService = {
  /**
   * Get all routes
   * @returns {Promise} - Promise with routes data
   */
  getAllRoutes: async () => {
    const response = await axiosInstance.get(API_PATH);
    return response.data;
  },

  /**
   * Get route by ID
   * @param {number} id - Route ID
   * @returns {Promise} - Promise with route data
   */
  getRouteById: async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create a new route (Admin only)
   * @param {Object} routeData - Route data
   * @returns {Promise} - Promise with created route data
   */
  createRoute: async (routeData) => {
    const response = await axiosInstance.post(API_PATH, routeData);
    return response.data;
  },

  /**
   * Update a route (Admin only)
   * @param {number} id - Route ID
   * @param {Object} routeData - Updated route data
   * @returns {Promise} - Promise with updated route data
   */
  updateRoute: async (id, routeData) => {
    const response = await axiosInstance.put(`${API_PATH}/${id}`, routeData);
    return response.data;
  },

  /**
   * Delete a route (Admin only)
   * @param {number} id - Route ID
   * @returns {Promise} - Promise with response
   */
  deleteRoute: async (id) => {
    const response = await axiosInstance.delete(`${API_PATH}/${id}`);
    return response.data;
  },

  /**
   * Get route stations
   * @param {number} id - Route ID
   * @returns {Promise} - Promise with route stations data
   */
  getRouteStations: async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/${id}/stations`);
    return response.data;
  },

  /**
   * Add station to route (Admin only)
   * @param {number} routeId - Route ID
   * @param {number} stationId - Station ID
   * @param {number} stationOrder - Station order in the route
   * @param {number} distanceFromStart - Distance from start in km
   * @returns {Promise} - Promise with created route station data
   */
  addStationToRoute: async (routeId, stationId, stationOrder, distanceFromStart) => {
    const response = await axiosInstance.post(
      `${API_PATH}/${routeId}/stations/${stationId}`,
      { stationOrder, distanceFromStart }
    );
    return response.data;
  },

  /**
   * Remove station from route (Admin only)
   * @param {number} routeId - Route ID
   * @param {number} stationId - Station ID
   * @returns {Promise} - Promise with response
   */
  removeStationFromRoute: async (routeId, stationId) => {
    const response = await axiosInstance.delete(`${API_PATH}/${routeId}/stations/${stationId}`);
    return response.data;
  }
};

export default routeService;