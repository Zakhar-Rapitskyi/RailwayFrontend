import axiosInstance from './axiosConfig';
import { format } from 'date-fns';

const API_PATH = '/admin/statistics';

const statisticsService = {
  /**
   * Get ticket statistics based on specified criteria
   * @param {Object} criteria - Search criteria
   * @param {Date} criteria.startDate - Start date
   * @param {Date} criteria.endDate - End date
   * @param {number} [criteria.routeId] - Optional route ID filter
   * @param {number} [criteria.departureStationId] - Optional departure station ID filter
   * @param {number} [criteria.arrivalStationId] - Optional arrival station ID filter
   * @returns {Promise} - Promise with ticket statistics
   */
  getTicketStatistics: async (criteria) => {
    // Format dates for backend
    const formattedCriteria = {
      ...criteria,
      startDate: criteria.startDate ? format(criteria.startDate, 'yyyy-MM-dd') : undefined,
      endDate: criteria.endDate ? format(criteria.endDate, 'yyyy-MM-dd') : undefined
    };
    
    const response = await axiosInstance.post(`${API_PATH}/tickets`, formattedCriteria);
    return response.data;
  },
  
  /**
   * Export ticket statistics as CSV
   * @param {Object} criteria - Search criteria
   * @returns {string} - CSV content
   */
  exportTicketStatisticsAsCsv: async (criteria) => {
    const statistics = await statisticsService.getTicketStatistics(criteria);
    
    // Generate CSV header
    let csv = 'Route,Tickets Sold,Occupancy Rate (%)\n';
    
    // Add each route statistics
    statistics.routeStatistics.forEach(route => {
      csv += `"${route.routeName}",${route.ticketCount},${route.occupancyRate.toFixed(2)}\n`;
    });
    
    // Add totals
    csv += `\nTotal,${statistics.totalTickets},-\n`;
    
    return csv;
  }
};

export default statisticsService;