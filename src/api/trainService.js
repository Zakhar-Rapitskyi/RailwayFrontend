import axiosInstance from './axiosConfig';

const API_PATH = '/trains';

const trainService = {
  /**
   * Get all trains
   * @returns {Promise} - Promise with trains data
   */
  getAllTrains: async () => {
    const response = await axiosInstance.get(API_PATH);
    return response.data;
  },

  /**
   * Get train by ID
   * @param {number} id - Train ID
   * @returns {Promise} - Promise with train data
   */
  getTrainById: async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/${id}`);
    return response.data;
  },

  /**
   * Create a new train (Admin only)
   * @param {Object} trainData - Train data
   * @returns {Promise} - Promise with created train data
   */
  createTrain: async (trainData) => {
    const response = await axiosInstance.post(API_PATH, trainData);
    return response.data;
  },

  /**
   * Update a train (Admin only)
   * @param {number} id - Train ID
   * @param {Object} trainData - Updated train data
   * @returns {Promise} - Promise with updated train data
   */
  updateTrain: async (id, trainData) => {
    const response = await axiosInstance.put(`${API_PATH}/${id}`, trainData);
    return response.data;
  },

  /**
   * Delete a train (Admin only)
   * @param {number} id - Train ID
   * @returns {Promise} - Promise with response
   */
  deleteTrain: async (id) => {
    const response = await axiosInstance.delete(`${API_PATH}/${id}`);
    return response.data;
  }
};

export default trainService;