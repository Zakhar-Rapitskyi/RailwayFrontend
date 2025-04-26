import axiosInstance from './axiosConfig';

const API_PATH = '/conductor';

const conductorService = {
  /**
   * Verify ticket by ticket number
   * @param {string} ticketNumber - Ticket number to verify
   * @returns {Promise} - Promise with ticket data
   */
  verifyTicket: async (ticketNumber) => {
    const response = await axiosInstance.get(`${API_PATH}/tickets/verify/${ticketNumber}`);
    return response.data;
  }
};

export default conductorService;