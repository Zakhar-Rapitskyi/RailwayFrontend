import axiosInstance from './axiosConfig';

const API_PATH = '/tickets';

const ticketService = {
  /**
   * Get all tickets (Admin only)
   * @returns {Promise} - Promise with tickets data
   */
  getAllTickets: async () => {
    const response = await axiosInstance.get(API_PATH);
    return response.data;
  },

  /**
   * Get ticket by ID
   * @param {number} id - Ticket ID
   * @returns {Promise} - Promise with ticket data
   */
  getTicketById: async (id) => {
    const response = await axiosInstance.get(`${API_PATH}/${id}`);
    return response.data;
  },

  /**
   * Get ticket by number
   * @param {string} ticketNumber - Ticket number
   * @returns {Promise} - Promise with ticket data
   */
  getTicketByNumber: async (ticketNumber) => {
    const response = await axiosInstance.get(`${API_PATH}/number/${ticketNumber}`);
    return response.data;
  },

  /**
   * Get tickets for a user
   * @param {number} userId - User ID
   * @returns {Promise} - Promise with user tickets
   */
  getTicketsByUser: async (userId) => {
    const response = await axiosInstance.get(`${API_PATH}/user/${userId}`);
    return response.data;
  },

  /**
   * Get current user tickets
   * @returns {Promise} - Promise with current user tickets
   */
  getCurrentUserTickets: async () => {
    const response = await axiosInstance.get(`${API_PATH}/me`);
    return response.data;
  },

  /**
   * Book a ticket
   * @param {Object} bookingData - Booking data
   * @param {number} bookingData.scheduleId - Schedule ID
   * @param {number} bookingData.departureStationId - Departure station ID
   * @param {number} bookingData.arrivalStationId - Arrival station ID
   * @param {number} bookingData.carNumber - Car number
   * @param {number} bookingData.seatNumber - Seat number
   * @returns {Promise} - Promise with booked ticket data
   */
  bookTicket: async (bookingData) => {
    const response = await axiosInstance.post(API_PATH, bookingData);
    return response.data;
  },

  /**
   * Cancel a ticket
   * @param {number} id - Ticket ID
   * @returns {Promise} - Promise with response
   */
  cancelTicket: async (id) => {
    const response = await axiosInstance.delete(`${API_PATH}/${id}`);
    return response.data;
  },

  /**
   * Get available seats
   * @param {number} scheduleId - Schedule ID
   * @param {number} carNumber - Car number
   * @returns {Promise} - Promise with available seats data
   */
  getAvailableSeats: async (scheduleId, carNumber) => {
    const response = await axiosInstance.get(`${API_PATH}/seats`, {
      params: { scheduleId, carNumber }
    });
    return response.data;
  },

  /**
   * Get ticket statistics (Admin only)
   * @param {Object} requestData - Statistics request data
   * @param {string} requestData.startDate - Start date (YYYY-MM-DD)
   * @param {string} requestData.endDate - End date (YYYY-MM-DD)
   * @param {number} [requestData.routeId] - Optional route ID filter
   * @param {number} [requestData.stationId] - Optional station ID filter
   * @returns {Promise} - Promise with statistics data
   */
  getTicketStatistics: async (requestData) => {
    const response = await axiosInstance.post(`${API_PATH}/statistics`, requestData);
    return response.data;
  }
};

export default ticketService;