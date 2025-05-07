import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, addDays } from 'date-fns';
import { FaTrain, FaRoute, FaCalendarAlt, FaClock, FaPlus, FaEdit, FaTrash, FaExchangeAlt } from 'react-icons/fa';

import trainService from '../api/trainService';
import routeService from '../api/routeService';
import scheduleService from '../api/scheduleService';
import stationService from '../api/stationService';
import Loader from '../components/common/Loader';
import { useAlert } from '../contexts/AlertContext';

const scheduleSchema = Yup.object().shape({
  trainId: Yup.number().required('Train is required'),
  routeId: Yup.number().required('Route is required'),
  departureDate: Yup.date().required('Departure date is required').min(new Date(), 'Date cannot be in the past')
});

const stationTimeSchema = Yup.object().shape({
  routeStationId: Yup.number().required('Station is required'),
  arrivalTime: Yup.string().required('Arrival time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time format must be HH:MM')
});

const trainChangeSchema = Yup.object().shape({
  trainId: Yup.number().required('New train is required')
});

const AdminSchedulePage = () => {
  const [trains, setTrains] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [routeStations, setRouteStations] = useState([]);
  const [showStationTimeForm, setShowStationTimeForm] = useState(false);
  const [showTrainChangeModal, setShowTrainChangeModal] = useState(false);
  const [scheduleToChangeTrain, setScheduleToChangeTrain] = useState(null);
  const { success, error } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trainsData, routesData, schedulesData] = await Promise.all([
          trainService.getAllTrains(),
          routeService.getAllRoutes(),
          scheduleService.getAllSchedules()
        ]);
        
        setTrains(trainsData);
        setRoutes(routesData);
        setSchedules(schedulesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        error('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [error]);

  const loadRouteStations = async (routeId) => {
    try {
      const stations = await routeService.getRouteStations(routeId);
      setRouteStations(stations);
    } catch (err) {
      console.error('Error loading route stations:', err);
      error('Failed to load route stations.');
    }
  };

  const handleCreateSchedule = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const formattedDate = format(values.departureDate, 'yyyy-MM-dd');
      await scheduleService.createSchedule(
        values.trainId,
        values.routeId,
        formattedDate
      );
      
      const schedulesData = await scheduleService.getAllSchedules();
      setSchedules(schedulesData);
      
      success('Schedule created successfully');
      resetForm();
    } catch (err) {
      console.error('Error creating schedule:', err);
      error(err.response?.data?.message || 'Failed to create schedule. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetStationTime = async (values) => {
    setSubmitting(true);
    try {
      await scheduleService.setScheduleStationTime(
        selectedSchedule.id,
        values.routeStationId,
        values.arrivalTime
      );
      
      success('Station time set successfully');
      setShowStationTimeForm(false);
      
      const updatedSchedule = await scheduleService.getScheduleById(selectedSchedule.id);
      setSelectedSchedule(updatedSchedule);
    } catch (err) {
      console.error('Error setting station time:', err);
      error(err.response?.data?.message || 'Failed to set station time. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    await loadRouteStations(schedule.route.id);
    setShowStationTimeForm(true);
  };

  const handleOpenTrainChangeModal = (schedule) => {
    setScheduleToChangeTrain(schedule);
    setShowTrainChangeModal(true);
  };

  const handleChangeTrain = async (values) => {
    if (!scheduleToChangeTrain) return;
    
    setSubmitting(true);
    try {
      await scheduleService.updateScheduleTrain(scheduleToChangeTrain.id, values.trainId);
      
      const schedulesData = await scheduleService.getAllSchedules();
      setSchedules(schedulesData);
      
      success('Train updated successfully');
      setShowTrainChangeModal(false);
    } catch (err) {
      console.error('Error updating train:', err);
      error(err.response?.data?.message || 'Failed to update train. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      try {
        await scheduleService.deleteSchedule(scheduleId);
        
        setSchedules(schedules.filter(s => s.id !== scheduleId));
        
        if (selectedSchedule && selectedSchedule.id === scheduleId) {
          setSelectedSchedule(null);
          setShowStationTimeForm(false);
        }
        
        success('Schedule deleted successfully');
      } catch (err) {
        console.error('Error deleting schedule:', err);
        error(err.response?.data?.message || 'Failed to delete schedule. Please try again.');
      }
    }
  };

  if (loading) {
    return <Loader text="Loading data..." />;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Manage Schedules</h2>
      
      <Row>
        {/* Schedule Creation Form */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Create New Schedule</h4>
              
              <Formik
                initialValues={{
                  trainId: '',
                  routeId: '',
                  departureDate: addDays(new Date(), 1)
                }}
                validationSchema={scheduleSchema}
                onSubmit={handleCreateSchedule}
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
                    <Form.Group className="mb-3">
                      <Form.Label>Train</Form.Label>
                      <Form.Select
                        name="trainId"
                        value={values.trainId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.trainId && errors.trainId}
                      >
                        <option value="">Select a train</option>
                        {trains.map(train => (
                          <option key={train.id} value={train.id}>
                            {train.name} - {train.totalCars} cars
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.trainId}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Route</Form.Label>
                      <Form.Select
                        name="routeId"
                        value={values.routeId}
                        onChange={(e) => {
                          const routeId = e.target.value;
                          handleChange(e);
                          if (routeId) {
                            loadRouteStations(routeId);
                          }
                        }}
                        onBlur={handleBlur}
                        isInvalid={touched.routeId && errors.routeId}
                      >
                        <option value="">Select a route</option>
                        {routes.map(route => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.routeId}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Departure Date</Form.Label>
                      <div className="position-relative">
                        <DatePicker
                          selected={values.departureDate}
                          onChange={(date) => setFieldValue('departureDate', date)}
                          minDate={new Date()}
                          dateFormat="yyyy-MM-dd"
                          className={`form-control ${touched.departureDate && errors.departureDate ? 'is-invalid' : ''}`}
                          wrapperClassName="w-100"
                        />
                        <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                          <FaCalendarAlt className="text-muted" />
                        </div>
                      </div>
                      {touched.departureDate && errors.departureDate && (
                        <div className="invalid-feedback d-block">
                          {errors.departureDate}
                        </div>
                      )}
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={submitting}
                      >
                        {submitting ? 'Creating...' : 'Create Schedule'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Station Time Form */}
        <Col lg={6} className="mb-4">
          {showStationTimeForm && selectedSchedule ? (
            <Card className="shadow-sm">
              <Card.Body>
                <h4 className="mb-3">Set Station Times</h4>
                <div className="mb-3">
                  <strong>Schedule:</strong> {selectedSchedule.train.name} - {selectedSchedule.route.name}
                </div>
                <div className="mb-3">
                  <strong>Date:</strong> {format(parseISO(selectedSchedule.departureDate.toString()), 'yyyy-MM-dd')}
                </div>
                
                <Formik
                  initialValues={{
                    routeStationId: '',
                    arrivalTime: ''
                  }}
                  validationSchema={stationTimeSchema}
                  onSubmit={handleSetStationTime}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Station</Form.Label>
                        <Form.Select
                          name="routeStationId"
                          value={values.routeStationId}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.routeStationId && errors.routeStationId}
                        >
                          <option value="">Select a station</option>
                          {routeStations.map(station => (
                            <option key={station.id} value={station.id}>
                              {station.station.name} (Order: {station.stationOrder})
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.routeStationId}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>Arrival Time (HH:MM)</Form.Label>
                        <Form.Control
                          type="text"
                          name="arrivalTime"
                          value={values.arrivalTime}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.arrivalTime && errors.arrivalTime}
                          placeholder="e.g. 14:30"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.arrivalTime}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <div className="d-grid">
                        <Button 
                          type="submit" 
                          variant="primary"
                          disabled={submitting}
                        >
                          {submitting ? 'Setting...' : 'Set Station Time'}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
                
                {/* Current Station Times */}
                <hr className="my-4" />
                <h5>Current Station Times</h5>
                
                {selectedSchedule.scheduleStations && selectedSchedule.scheduleStations.length > 0 ? (
                  <Table responsive bordered hover size="sm" className="mt-3">
                    <thead>
                      <tr>
                        <th>Station</th>
                        <th>Order</th>
                        <th>Arrival Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSchedule.scheduleStations
                        .sort((a, b) => a.routeStation.stationOrder - b.routeStation.stationOrder)
                        .map(ss => (
                          <tr key={ss.id}>
                            <td>{ss.routeStation.station.name}</td>
                            <td>{ss.routeStation.stationOrder}</td>
                            <td>{ss.arrivalTime || 'Not set'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">No station times set yet.</Alert>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <Card.Body className="text-center p-5">
                <FaClock size={40} className="text-muted mb-3" />
                <h4>Set Station Times</h4>
                <p className="text-muted">Select a schedule from the list below to set station arrival times.</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      {/* Schedules List */}
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <h4 className="mb-3">Existing Schedules</h4>
          
          {schedules.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Train</th>
                    <th>Route</th>
                    <th>Departure Date</th>
                    <th>Stations with Times</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(schedule => (
                    <tr key={schedule.id}>
                      <td>{schedule.id}</td>
                      <td>{schedule.train.name}</td>
                      <td>{schedule.route.name}</td>
                      <td>{format(parseISO(schedule.departureDate.toString()), 'yyyy-MM-dd')}</td>
                      <td>
                        {schedule.scheduleStations && schedule.scheduleStations.length > 0 
                          ? `${schedule.scheduleStations.filter(ss => ss.arrivalTime).length} / ${schedule.scheduleStations.length}`
                          : '0'}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleSelectSchedule(schedule)}
                        >
                          <FaClock className="me-1" /> Set Times
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenTrainChangeModal(schedule)}
                        >
                          <FaExchangeAlt className="me-1" /> Change Train
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <FaTrash /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">No schedules found. Create a new schedule using the form above.</Alert>
          )}
        </Card.Body>
      </Card>

      {/* Train Change Modal */}
      <Modal show={showTrainChangeModal} onHide={() => setShowTrainChangeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Train</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {scheduleToChangeTrain && (
            <div className="mb-3">
              <p><strong>Schedule:</strong> {scheduleToChangeTrain.route.name}</p>
              <p><strong>Current Train:</strong> {scheduleToChangeTrain.train.name} ({scheduleToChangeTrain.train.totalCars} cars)</p>
              <p><strong>Date:</strong> {format(parseISO(scheduleToChangeTrain.departureDate.toString()), 'yyyy-MM-dd')}</p>
            </div>
          )}
          
          <Formik
            initialValues={{
              trainId: scheduleToChangeTrain ? scheduleToChangeTrain.train.id : ''
            }}
            validationSchema={trainChangeSchema}
            onSubmit={handleChangeTrain}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit
            }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New Train</Form.Label>
                  <Form.Select
                    name="trainId"
                    value={values.trainId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.trainId && errors.trainId}
                  >
                    <option value="">Select a train</option>
                    {trains.map(train => (
                      <option key={train.id} value={train.id}>
                        {train.name} - {train.totalCars} cars
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.trainId}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" onClick={() => setShowTrainChangeModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Train'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminSchedulePage;