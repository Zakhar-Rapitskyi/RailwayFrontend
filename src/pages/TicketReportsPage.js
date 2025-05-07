import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner, Modal } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, startOfMonth } from 'date-fns';
import { FaCalendarAlt, FaSearch, FaFileExport, FaChartBar, FaSync } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import routeService from '../api/routeService';
import statisticsService from '../api/statisticsService';
import Loader from '../components/common/Loader';
import { useAlert } from '../contexts/AlertContext';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const reportCriteriaSchema = Yup.object().shape({
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date')
});


const updateStatisticsSchema = Yup.object().shape({
  date: Yup.date().required('Date is required')
});

const TicketReportsPage = () => {
  
  const initialLoadRef = useRef(true);
  const lastFormValuesRef = useRef(null);
  
  
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const { success, error } = useAlert();

  
  const defaultStartDate = startOfMonth(new Date());
  const defaultEndDate = new Date();

  
  const initialFormValues = {
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    routeId: ''
  };

  
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!initialLoadRef.current) return;
      
      setLoading(true);
      try {
        const routesData = await routeService.getAllRoutes();
        setRoutes(routesData);
      } catch (err) {
        console.error('Error fetching routes data:', err);
        error('Failed to load routes data.');
      } finally {
        setLoading(false);
        initialLoadRef.current = false;
      }
    };

    fetchRoutes();
  }, [error]);

  
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
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
  }), []);

  
  const { chartData, totalTickets, avgOccupancy } = useMemo(() => {
    
    const prepareChartData = () => {
      if (!statistics || !Array.isArray(statistics) || statistics.length === 0) {
        return null;
      }

      try {
        
        const topRoutes = [...statistics]
          .filter(route => route && route.routeName)
          .sort((a, b) => (b.ticketCount || 0) - (a.ticketCount || 0))
          .slice(0, 10);

        if (topRoutes.length === 0) return null;

        return {
          labels: topRoutes.map(route => route.routeName || 'Unknown'),
          datasets: [
            {
              label: 'Number of Tickets Sold',
              data: topRoutes.map(route => route.ticketCount || 0),
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              borderColor: 'rgba(53, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Occupancy Rate (%)',
              data: topRoutes.map(route => route.occupancyRate || 0),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              yAxisID: 'y1'
            }
          ]
        };
      } catch (err) {
        console.error("Error preparing chart data:", err);
        return null;
      }
    };

    
    const calculateTotals = () => {
      if (!statistics || !Array.isArray(statistics) || statistics.length === 0) {
        return { totalTickets: 0, avgOccupancy: 0 };
      }
      
      try {
        const validStats = statistics.filter(stat => stat && typeof stat === 'object');
        
        const totalTickets = validStats.reduce((total, route) => total + (route.ticketCount || 0), 0);
        const totalCapacity = validStats.reduce((total, route) => total + (route.seatCapacity || 0), 0);
        const avgOccupancy = totalCapacity > 0 ? (totalTickets / totalCapacity) * 100 : 0;
        
        return { totalTickets, avgOccupancy };
      } catch (err) {
        console.error("Error calculating totals:", err);
        return { totalTickets: 0, avgOccupancy: 0 };
      }
    };

    const chartData = prepareChartData();
    const { totalTickets, avgOccupancy } = calculateTotals();
    
    return { chartData, totalTickets, avgOccupancy };
  }, [statistics]);

  const handleGenerateReport = useCallback(async (values) => {
    if (lastFormValuesRef.current && 
        JSON.stringify(lastFormValuesRef.current) === JSON.stringify(values)) {
      console.log("Skipping duplicate request");
      return;
    }
    
    lastFormValuesRef.current = values;
    
    setSubmitting(true);
    try {
      const report = await statisticsService.getTicketStatistics(values);
      setStatistics(report);
      success('Report generated successfully');
    } catch (err) {
      console.error('Error generating report:', err);
      error('Failed to generate report. Please try again.');
      setStatistics([]);
    } finally {
      setSubmitting(false);
    }
  }, [success, error]);

  const handleUpdateStatistics = useCallback(async (values) => {
    setUpdating(true);
    try {
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      await statisticsService.updateStatisticsForDate(formattedDate);
      success('Statistics updated successfully');
      setShowUpdateModal(false);
    } catch (err) {
      console.error('Error updating statistics:', err);
      error('Failed to update statistics. Please try again.');
    } finally {
      setUpdating(false);
    }
  }, [success, error]);

  const handleExportCsv = useCallback(async (values) => {
    try {
      const csvContent = await statisticsService.exportTicketStatisticsAsCsv(values);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
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
  }, [success, error]);

  const renderTableRows = useCallback(() => {
    if (!statistics || !Array.isArray(statistics)) return null;
    
    return statistics
      .filter(route => route && route.routeName)
      .map((route, index) => {
        try {
          return (
            <tr key={index}>
              <td>{route.routeName}</td>
              <td className="text-center">
                {route.date ? format(parseISO(route.date.toString()), 'yyyy-MM-dd') : 'N/A'}
              </td>
              <td className="text-center">{route.ticketCount || 0}</td>
              <td className="text-center">{route.seatCapacity || 0}</td>
              <td className="text-center">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="progress flex-grow-1" style={{ height: '15px', maxWidth: '100px' }}>
                    <div 
                      className={`progress-bar ${(route.occupancyRate || 0) < 50 ? 'bg-success' : (route.occupancyRate || 0) < 75 ? 'bg-warning' : 'bg-danger'}`}
                      style={{ width: `${route.occupancyRate || 0}%` }}
                    ></div>
                  </div>
                  <span className="ms-2">{(route.occupancyRate || 0).toFixed(1)}%</span>
                </div>
              </td>
              <td className="text-center">
                {route.updatedAt ? format(parseISO(route.updatedAt.toString()), 'yyyy-MM-dd HH:mm') : 'N/A'}
              </td>
            </tr>
          );
        } catch (err) {
          console.error("Error rendering table row:", err);
          return null;
        }
      })
      .filter(row => row !== null);
  }, [statistics]);

  if (loading) {
    return <Loader text="Loading data..." />;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaChartBar className="me-2" />
          Ticket Sales Reports
        </h2>
        <Button 
          variant="outline-primary" 
          onClick={() => setShowUpdateModal(true)}
        >
          <FaSync className="me-2" />
          Update Statistics
        </Button>
      </div>
      
      <Row>
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Report Criteria</h4>
              
              <Formik
                initialValues={initialFormValues}
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
                      <Col md={6} lg={4}>
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
                      
                      <Col md={6} lg={4}>
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
                      
                      <Col md={12} lg={4}>
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
      {statistics && Array.isArray(statistics) && statistics.length > 0 ? (
        <Row>
          <Col lg={12} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body>
                <h4 className="mb-3">Report Results</h4>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Summary</h5>
                    <div>
                      <span className="badge bg-primary fs-6 me-2">
                        Total Tickets: {totalTickets}
                      </span>
                      <span className="badge bg-info fs-6">
                        Avg. Occupancy: {avgOccupancy.toFixed(1)}%
                      </span>
                    </div>
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
                        <th className="text-center">Date</th>
                        <th className="text-center">Tickets Sold</th>
                        <th className="text-center">Seat Capacity</th>
                        <th className="text-center">Occupancy Rate</th>
                        <th className="text-center">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderTableRows()}
                    </tbody>
                    <tfoot>
                      <tr className="table-active fw-bold">
                        <td>Total</td>
                        <td></td>
                        <td className="text-center">{totalTickets}</td>
                        <td></td>
                        <td className="text-center">{avgOccupancy.toFixed(1)}%</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : statistics ? (
        <Alert variant="warning" className="mt-3">
          No data found for the selected criteria. Try different filter options.
        </Alert>
      ) : (
        <Alert variant="info" className="mt-3">
          Use the form above to generate a ticket sales report.
        </Alert>
      )}
      
      {/* Update Statistics Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Statistics</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{ date: new Date() }}
          validationSchema={updateStatisticsSchema}
          onSubmit={handleUpdateStatistics}
        >
          {({
            values,
            errors,
            touched,
            handleSubmit,
            setFieldValue
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Select Date to Update</Form.Label>
                  <div className="position-relative">
                    <DatePicker
                      selected={values.date}
                      onChange={(date) => setFieldValue('date', date)}
                      className={`form-control ${touched.date && errors.date ? 'is-invalid' : ''}`}
                      dateFormat="yyyy-MM-dd"
                      wrapperClassName="w-100"
                    />
                    <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                      <FaCalendarAlt className="text-muted" />
                    </div>
                  </div>
                  {touched.date && errors.date && (
                    <div className="invalid-feedback d-block">
                      {errors.date}
                    </div>
                  )}
                  <Form.Text className="text-muted">
                    This will recalculate ticket statistics for the selected date.
                  </Form.Text>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={updating}>
                  {updating ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Statistics'
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
};

export default TicketReportsPage;