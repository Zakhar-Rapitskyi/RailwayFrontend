import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaTrain, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaArrowRight, FaCheck } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

import scheduleService from '../api/scheduleService';
import ticketService from '../api/ticketService';
import stationService from '../api/stationService';
import Loader from '../components/common/Loader';
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';

const BookingPage = () => {
  const { scheduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { error, success } = useAlert();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedCar, setSelectedCar] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [departureStationId, setDepartureStationId] = useState('');
  const [arrivalStationId, setArrivalStationId] = useState('');
  const [availableSeats, setAvailableSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

const urlParamsRef = useRef({ fromId: null, toId: null });

useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  
  if (searchParams.has('from')) {
    const fromId = parseInt(searchParams.get('from'), 10);
    console.log("Parsed fromId:", fromId);
    urlParamsRef.current.fromId = fromId;
    setDepartureStationId(fromId);
  }
  
  if (searchParams.has('to')) {
    const toId = parseInt(searchParams.get('to'), 10);
    console.log("Parsed toId:", toId);
    urlParamsRef.current.toId = toId;
    setArrivalStationId(toId);
  }
}, [location.search]);

useEffect(() => {
  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const scheduleData = await scheduleService.getScheduleById(scheduleId);
      setSchedule(scheduleData);
      
      if (!urlParamsRef.current.fromId && scheduleData.route.stations.length > 0) {
        console.log("Setting default departure station");
        setDepartureStationId(scheduleData.route.stations[0].station.id);
      }
      
      if (!urlParamsRef.current.toId && scheduleData.route.stations.length > 0) {
        console.log("Setting default arrival station");
        setArrivalStationId(scheduleData.route.stations[scheduleData.route.stations.length - 1].station.id);
      }
        
        const routeStations = scheduleData.route.stations.map(station => ({
          id: station.station.id,
          name: station.station.name,
          order: station.stationOrder
        }));
        
        routeStations.sort((a, b) => a.order - b.order);
        setStations(routeStations);
        
      } catch (err) {
        console.error('Error fetching schedule:', err);
        error('Failed to load schedule data. Please try again.');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      fetchScheduleData();
    }
  }, [scheduleId, navigate, error, departureStationId, arrivalStationId]);

  useEffect(() => {
    const fetchAvailableSeats = async () => {
      if (!scheduleId || !selectedCar) return;
      
      try {
        const seatData = await ticketService.getAvailableSeats(scheduleId, selectedCar);
        setAvailableSeats(seatData);
      } catch (err) {
        console.error('Error fetching available seats:', err);
        error('Failed to load seat availability information.');
      }
    };

    fetchAvailableSeats();
  }, [scheduleId, selectedCar, error]);

  const handleCarSelect = (carNumber) => {
    setSelectedCar(carNumber);
    setSelectedSeat(null);
  };

  const handleSeatSelect = (seatNumber) => {
    setSelectedSeat(seatNumber);
  };

  const isSeatBooked = (seatNumber) => {
    return availableSeats?.occupiedSeats?.includes(seatNumber);
  };

  const handleBookTicket = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    if (!selectedSeat) {
      error('Please select a seat to continue.');
      return;
    }

    if (!departureStationId || !arrivalStationId) {
      error('Please select departure and arrival stations.');
      return;
    }

    const departureStation = stations.find(s => s.id === departureStationId);
    const arrivalStation = stations.find(s => s.id === arrivalStationId);
    
    if (!departureStation || !arrivalStation) {
      error('Invalid stations selected.');
      return;
    }
    
    if (departureStation.order >= arrivalStation.order) {
      error('Departure station must come before arrival station on the route.');
      return;
    }

    setIsBooking(true);
    try {
      const bookingData = {
        scheduleId: parseInt(scheduleId, 10),
        departureStationId: departureStationId,
        arrivalStationId: arrivalStationId,
        carNumber: selectedCar,
        seatNumber: selectedSeat
      };
      
      const ticket = await ticketService.bookTicket(bookingData);
      success('Ticket booked successfully!');
      navigate('/my-tickets');
    } catch (err) {
      console.error('Booking error:', err);
      error(err.response?.data?.message || 'Failed to book ticket. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return <Loader text="Loading schedule information..." />;
  }

  if (!schedule) {
    return (
      <Container className="py-5 text-center">
        <h3>Schedule not found</h3>
        <p>The schedule information could not be loaded.</p>
        <Button variant="primary" onClick={() => navigate('/search')}>
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Book Ticket</h2>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <FaTrain className="text-primary me-2" size={24} />
            <h4 className="mb-0">{schedule.train.name} - {schedule.route.name}</h4>
          </div>
          
          <Row className="mb-4">
            <Col md={4}>
              <div className="d-flex align-items-center mb-2">
                <FaCalendarAlt className="text-muted me-2" />
                <span>Departure Date: {format(parseISO(schedule.departureDate.toString()), 'dd MMMM yyyy')}</span>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-center mb-2">
                <FaMapMarkerAlt className="text-muted me-2" />
                <span>Route: {schedule.route.name}</span>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-center mb-2">
                <FaClock className="text-muted me-2" />
                <span>Cars: {schedule.train.totalCars}</span>
              </div>
            </Col>
          </Row>
          
          <hr />
          
          <Row className="mt-4">
            <Col md={6} className="mb-4">
              <h5 className="mb-3">Select Stations</h5>
              <Form.Group className="mb-3">
                <Form.Label>Departure Station</Form.Label>
                <Form.Select
                  value={departureStationId}
                  onChange={(e) => setDepartureStationId(parseInt(e.target.value, 10))}
                >
                  <option value="">Select departure station</option>
                  {stations.map((station, index) => (
                    <option key={station.id} value={station.id} disabled={arrivalStationId && station.order >= stations.find(s => s.id === arrivalStationId)?.order}>
                      {station.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Arrival Station</Form.Label>
                <Form.Select
                  value={arrivalStationId}
                  onChange={(e) => setArrivalStationId(parseInt(e.target.value, 10))}
                >
                  <option value="">Select arrival station</option>
                  {stations.map((station, index) => (
                    <option key={station.id} value={station.id} disabled={departureStationId && station.order <= stations.find(s => s.id === departureStationId)?.order}>
                      {station.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="fs-5 fw-bold">{stations.find(s => s.id === departureStationId)?.name || 'Select departure'}</div>
                  <small className="text-muted">Departure</small>
                </div>
                
                <FaArrowRight className="text-muted mx-3" />
                
                <div>
                  <div className="fs-5 fw-bold">{stations.find(s => s.id === arrivalStationId)?.name || 'Select arrival'}</div>
                  <small className="text-muted">Arrival</small>
                </div>
              </div>
              
              <h5 className="mb-3">Select Car</h5>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {Array.from({ length: schedule.train.totalCars }, (_, i) => i + 1).map(carNumber => (
                  <Button
                    key={carNumber}
                    variant={selectedCar === carNumber ? 'primary' : 'outline-primary'}
                    onClick={() => handleCarSelect(carNumber)}
                    className="px-3 py-2"
                  >
                    Car {carNumber}
                  </Button>
                ))}
              </div>
            </Col>
            
            <Col md={6}>
              <h5 className="mb-3">
                Select Seat
                {selectedCar && <span className="text-muted ms-2">- Car {selectedCar}</span>}
              </h5>
              
              {selectedCar ? (
                <>
                  <div className="train-car mb-3">
                    <div className="w-100 text-center mb-2 fw-bold">
                      Car {selectedCar}
                    </div>
                    
                    <div className="train-car-aisle"></div>
                    
                    <div className="d-flex flex-wrap justify-content-center">
                      {Array.from({ length: 50 }, (_, i) => i + 1).map(seatNumber => (
                        <div
                          key={seatNumber}
                          className={`seat ${
                            isSeatBooked(seatNumber)
                              ? 'seat-booked'
                              : selectedSeat === seatNumber
                              ? 'seat-selected'
                              : 'seat-available'
                          }`}
                          onClick={() => !isSeatBooked(seatNumber) && handleSeatSelect(seatNumber)}
                        >
                          {seatNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-center gap-4 mb-4">
                    <div className="d-flex align-items-center">
                      <div className="seat seat-available me-2" style={{ width: '20px', height: '20px' }}></div>
                      <small>Available</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="seat seat-selected me-2" style={{ width: '20px', height: '20px' }}></div>
                      <small>Selected</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="seat seat-booked me-2" style={{ width: '20px', height: '20px' }}></div>
                      <small>Booked</small>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted p-5">
                  Please select a car to view available seats
                </div>
              )}
              
              <Card className="mt-3">
                <Card.Body>
                  <h5 className="mb-3">Booking Summary</h5>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Train:</span>
                      <strong>{schedule.train.name}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Date:</span>
                      <strong>{format(parseISO(schedule.departureDate.toString()), 'dd MMMM yyyy')}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>From:</span>
                      <strong>{stations.find(s => s.id === departureStationId)?.name || '-'}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>To:</span>
                      <strong>{stations.find(s => s.id === arrivalStationId)?.name || '-'}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Car:</span>
                      <strong>{selectedCar || '-'}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Seat:</span>
                      {selectedSeat ? (
                        <Badge bg="primary" pill>
                          {selectedSeat}
                        </Badge>
                      ) : (
                        <span>-</span>
                      )}
                    </ListGroup.Item>
                  </ListGroup>
                  
                  <div className="d-grid mt-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleBookTicket}
                      disabled={!selectedSeat || !departureStationId || !arrivalStationId || isBooking}
                    >
                      {isBooking ? 'Booking...' : 'Book Ticket'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BookingPage;