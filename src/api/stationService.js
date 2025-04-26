import axiosInstance from './axiosConfig';

const API_PATH = '/stations';

const stationService = {
  /**
   * Get all stations
   * @returns {Promise} - Promise with stations data
   */
  getAllStations: async () => {
    const response = await axiosInstance.get(API_PATH);
    return response.data;
  },

  /**
   * Get station by ID
   * @param {number} id - Station ID
   * @returns {Promise} - Promise with station data
   */
  getStationById: async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/${id}`);
    return response.data;
  },

  /**
   * Search station by name
   * @param {string} name - Station name to search
   * @returns {Promise} - Promise with station data
   */
  searchStationByName: async (name) => {
    const response = await axiosInstance.get(`${API_PATH}/search`, {
      params: { name }
    });
    return response.data;
  },

  /**
   * Create a new station (Admin only)
   * @param {Object} stationData - Station data
   * @returns {Promise} - Promise with created station data
   */
  createStation: async (stationData) => {
    const response = await axiosInstance.post(API_PATH, stationData);
    return response.data;
  },

  /**
   * Update a station (Admin only)
   * @param {number} id - Station ID
   * @param {Object} stationData - Updated station data
   * @returns {Promise} - Promise with updated station data
   */
  updateStation: async (id, stationData) => {
    const response = await axiosInstance.put(`${API_PATH}/${id}`, stationData);
    return response.data;
  },

  /**
   * Delete a station (Admin only)
   * @param {number} id - Station ID
   * @returns {Promise} - Promise with response
   */
  deleteStation: async (id) => {
    const response = await axiosInstance.delete(`${API_PATH}/${id}`);
    return response.data;
  }
};

export default stationService;