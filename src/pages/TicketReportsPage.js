import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { format, subDays, startOfMonth } from 'date-fns';
import { FaCalendarAlt, FaSearch, FaFileExport, FaChartBar } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import stationService from '../api/stationService';
import routeService from '../api/routeService';
import statisticsService from '../api/statisticsService';
import Loader from '../components/common/Loader';
import { useAlert } from '../contexts/AlertContext';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Validation schema
const reportCriteriaSchema = Yup.object().shape({
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date')
});

const TicketReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stations, setStations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const { success, error } = useAlert();

  // Initial date range - current month
  const defaultStartDate = startOfMonth(new Date());
  const defaultEndDate = new Date();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stationsData, routesData] = await Promise.all([
          stationService.getAllStations(),
          routeService.getAllRoutes()
        ]);
        
        setStations(stationsData);
        setRoutes(routesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        error('Failed to load stations and routes data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [error]);

  const handleGenerateReport = async (values) => {
    setSubmitting(true);
    try {
      const report = await statisticsService.getTicketStatistics(values);
      setStatistics(report);
      success('Report generated successfully');
    } catch (err) {
      console.error('Error generating report:', err);
      error('Failed to generate report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = async (values) => {
    try {
      const csvContent = await statisticsService.exportTicketStatisticsAsCsv(values);
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      const filename = `ticket-statistics-${format(values.startDate, 'yyyy-MM-dd')}-to-${format(values.endDate, 'yyyy-MM-dd')}.csv`;
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      success('CSV file exported successfully');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      error('Failed to export CSV. Please try again.');
    }
  };

  // Prepare chart data from statistics
  const prepareChartData = () => {
    if (!statistics || !statistics.routeStatistics || statistics.routeStatistics.length === 0) {
      return null;
    }

    // Limit to top 10 routes by ticket count for better visualization
    const topRoutes = [...statistics.routeStatistics]
      .sort((a, b) => b.ticketCount - a.ticketCount)
      .slice(0, 10);

    return {
      labels: topRoutes.map(route => route.routeName),
      datasets: [
        {
          label: 'Number of Tickets Sold',
          data: topRoutes.map(route => route.ticketCount),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Occupancy Rate (%)',
          data: topRoutes.map(route => route.occupancyRate),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tickets'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        max: 100,
        title: {
          display: true,
          text: 'Occupancy Rate (%)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ticket Sales by Route'
      }
    }
  };

  const chartData = prepareChartData();

  if (loading) {
    return <Loader text="Loading data..." />;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <FaChartBar className="me-2" />
        Ticket Sales Reports
      </h2>
      
      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Report Criteria</h4>
              
              <Formik
                initialValues={{
                  startDate: defaultStartDate,
                  endDate: defaultEndDate,
                  routeId: '',
                  departureStationId: '',
                  arrivalStationId: ''
                }}
                validationSchema={reportCriteriaSchema}
                onSubmit={handleGenerateReport}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Start Date</Form.Label>
                          <div className="position-relative">
                            <DatePicker
                              selected={values.startDate}
                              onChange={(date) => setFieldValue('startDate', date)}
                              className={`form-control ${touched.startDate && errors.startDate ? 'is-invalid' : ''}`}
                              dateFormat="yyyy-MM-dd"
                              wrapperClassName="w-100"
                            />
                            <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                              <FaCalendarAlt className="text-muted" />
                            </div>
                          </div>
                          {touched.startDate && errors.startDate && (
                            <div className="invalid-feedback d-block">
                              {errors.startDate}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      
                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>End Date</Form.Label>
                          <div className="position-relative">
                            <DatePicker
                              selected={values.endDate}
                              onChange={(date) => setFieldValue('endDate', date)}
                              className={`form-control ${touched.endDate && errors.endDate ? 'is-invalid' : ''}`}
                              dateFormat="yyyy-MM-dd"
                              minDate={values.startDate}
                              wrapperClassName="w-100"
                            />
                            <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                              <FaCalendarAlt className="text-muted" />
                            </div>
                          </div>
                          {touched.endDate && errors.endDate && (
                            <div className="invalid-feedback d-block">
                              {errors.endDate}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      
                      <Col md={4} lg={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Route (Optional)</Form.Label>
                          <Form.Select
                            name="routeId"
                            value={values.routeId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          >
                            <option value="">All Routes</option>
                            {routes.map(route => (
                              <option key={route.id} value={route.id}>
                                {route.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      
                      <Col md={4} lg={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Departure Station (Optional)</Form.Label>
                          <Form.Select
                            name="departureStationId"
                            value={values.departureStationId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          >
                            <option value="">All Stations</option>
                            {stations.map(station => (
                              <option key={station.id} value={station.id}>
                                {station.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      
                      <Col md={4} lg={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Arrival Station (Optional)</Form.Label>
                          <Form.Select
                            name="arrivalStationId"
                            value={values.arrivalStationId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          >
                            <option value="">All Stations</option>
                            {stations.map(station => (
                              <option key={station.id} value={station.id}>
                                {station.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <div className="d-flex gap-2 mt-2">
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Spinner size="sm" animation="border" className="me-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FaSearch className="me-2" />
                            Generate Report
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline-secondary"
                        onClick={() => handleExportCsv(values)}
                        disabled={!statistics || submitting}
                      >
                        <FaFileExport className="me-2" />
                        Export CSV
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Results Section */}
      {statistics ? (
        <Row>
          <Col lg={12} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body>
                <h4 className="mb-3">Report Results</h4>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Summary</h5>
                    <span className="badge bg-primary fs-6">
                      Total Tickets: {statistics.totalTickets}
                    </span>
                  </div>
                  
                  {chartData && (
                    <div className="chart-container mb-4" style={{ height: '400px' }}>
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  )}
                  
                  <Table responsive striped hover className="mt-4">
                    <thead>
                      <tr>
                        <th>Route</th>
                        <th className="text-center">Tickets Sold</th>
                        <th className="text-center">Occupancy Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.routeStatistics.map((route, index) => (
                        <tr key={index}>
                          <td>{route.routeName}</td>
                          <td className="text-center">{route.ticketCount}</td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="progress flex-grow-1" style={{ height: '15px', maxWidth: '100px' }}>
                                <div 
                                  className={`progress-bar ${route.occupancyRate < 50 ? 'bg-success' : route.occupancyRate < 75 ? 'bg-warning' : 'bg-danger'}`}
                                  style={{ width: `${route.occupancyRate}%` }}
                                ></div>
                              </div>
                              <span className="ms-2">{route.occupancyRate.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-active fw-bold">
                        <td>Total</td>
                        <td className="text-center">{statistics.totalTickets}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Alert variant="info" className="mt-3">
          Use the form above to generate a ticket sales report.
        </Alert>
      )}
    </Container>
  );
};

export default TicketReportsPage;