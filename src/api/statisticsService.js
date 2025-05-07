import axiosInstance from './axiosConfig';
import { format } from 'date-fns';

const API_PATH = '/admin/statistics';

const statisticsService = {
  getTicketStatistics: async (criteria) => {
    const formattedCriteria = {
      ...criteria,
      startDate: criteria.startDate ? format(criteria.startDate, 'yyyy-MM-dd') : undefined,
      endDate: criteria.endDate ? format(criteria.endDate, 'yyyy-MM-dd') : undefined
    };
    
    const response = await axiosInstance.post(`${API_PATH}/tickets`, formattedCriteria);
    return response.data;
  },

  updateStatisticsForDate: async (date) => {
    const response = await axiosInstance.put(`${API_PATH}/update`, null, {
      params: { date }
    });
    return response.data;
  },
  
  exportTicketStatisticsAsCsv: async (criteria) => {
    const statistics = await statisticsService.getTicketStatistics(criteria);
    
    let csv = 'Route,Date,Tickets Sold,Seat Capacity,Occupancy Rate (%),Last Updated\n';
    
    statistics.forEach(stat => {
      const date = format(new Date(stat.date), 'yyyy-MM-dd');
      const updatedAt = stat.updatedAt ? format(new Date(stat.updatedAt), 'yyyy-MM-dd HH:mm') : 'N/A';
      
      csv += `"${stat.routeName}",${date},${stat.ticketCount},${stat.seatCapacity},${stat.occupancyRate.toFixed(2)},${updatedAt}\n`;
    });
    
    return csv;
  }
};

export default statisticsService;