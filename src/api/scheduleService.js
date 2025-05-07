import axiosInstance from './axiosConfig';

const API_PATH = '/schedules';

const scheduleService = {
  /**
   * Get all schedules
   * @returns {Promise} - Promise with schedules data
   */
  getAllSchedules: async () => {
    const response = await axiosInstance.get(API_PATH);
    return response.data;
  },

  /**
   * Get schedule by ID
   * @param {number} id - Schedule ID
   * @returns {Promise} - Promise with schedule data
   */
  getScheduleById: async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create a new schedule (Admin only)
   * @param {number} trainId - Train ID
   * @param {number} routeId - Route ID
   * @param {string} departureDate - Departure date (YYYY-MM-DD)
   * @returns {Promise} - Promise with created schedule data
   */
  createSchedule: async (trainId, routeId, departureDate) => {
    const response = await axiosInstance.post(`${API_PATH}`, null, {
      params: { trainId, routeId, departureDate }
    });
    return response.data;
  },

  /**
   * Set schedule station time (Admin only)
   * @param {number} scheduleId - Schedule ID
   * @param {number} routeStationId - Route station ID
   * @param {string} arrivalTime - Arrival time (HH:MM:SS)
   * @returns {Promise} - Promise with updated schedule station data
   */
  setScheduleStationTime: async (scheduleId, routeStationId, arrivalTime) => {
    const response = await axiosInstance.post(
      `${API_PATH}/${scheduleId}/stations/${routeStationId}`,
      { arrivalTime }
    );
    return response.data;
  },

  /**
   * Update schedule train (Admin only)
   * @param {number} scheduleId - Schedule ID
   * @param {number} trainId - New train ID
   * @returns {Promise} - Promise with updated schedule data
   */
  updateScheduleTrain: async (scheduleId, trainId) => {
    const response = await axiosInstance.put(
      `${API_PATH}/${scheduleId}/train`,
      { trainId }
    );
    return response.data;
  },

  /**
   * Delete a schedule (Admin only)
   * @param {number} id - Schedule ID
   * @returns {Promise} - Promise with response
   */
  deleteSchedule: async (id) => {
    const response = await axiosInstance.delete(`${API_PATH}/${id}`);
    return response.data;
  },

  /**
   * Search routes by departure and arrival stations and date
   * @param {Object} searchData - Search parameters
   * @param {number} searchData.departureStationId - Departure station ID
   * @param {number} searchData.arrivalStationId - Arrival station ID
   * @param {string} searchData.departureDate - Departure date (YYYY-MM-DD)
   * @returns {Promise} - Promise with search results
   */
  searchRoutes: async (searchData) => {
    const response = await axiosInstance.post(`${API_PATH}/search`, searchData);
    return response.data;
  }
};

export default scheduleService;