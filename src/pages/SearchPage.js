import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert as BsAlert } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, addDays } from 'date-fns';
import { FaTrain, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaExchangeAlt, FaChevronRight } from 'react-icons/fa';

import stationService from '../api/stationService';
import scheduleService from '../api/scheduleService';
import Loader from '../components/common/Loader';
import { useAlert } from '../contexts/AlertContext';

const searchSchema = Yup.object().shape({
  departureStationId: Yup.number().required('Departure station is required'),
  arrivalStationId: Yup.number().required('Arrival station is required'),
  departureDate: Yup.date().required('Departure date is required').min(new Date(), 'Date cannot be in the past')
});

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [stations, setStations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { error } = useAlert();
  const navigate = useNavigate();

  const initialFromId = searchParams.get('from') ? parseInt(searchParams.get('from'), 10) : '';
  const initialToId = searchParams.get('to') ? parseInt(searchParams.get('to'), 10) : '';
  const initialDate = searchParams.get('date') ? parseISO(searchParams.get('date')) : addDays(new Date(), 1);
  const isInitialRender = React.useRef(true);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const data = await stationService.getAllStations();
        setStations(data);
      } catch (err) {
        console.error('Error fetching stations:', err);
        error('Failed to load stations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [error]);

  useEffect(() => {
    if (initialFromId && initialToId && isInitialRender.current) {
      isInitialRender.current = false; 

      const performInitialSearch = async () => {
        const searchData = {
          departureStationId: initialFromId,
          arrivalStationId: initialToId,
          departureDate: format(initialDate, 'yyyy-MM-dd')
        };

        await searchRoutes(searchData);
      };

      performInitialSearch();
    }
  }, [initialFromId, initialToId, initialDate]);

  const searchRoutes = async (values) => {
    if (values.departureStationId === values.arrivalStationId) {
      error('Departure and arrival stations cannot be the same');
      return;
    }

    setIsSearching(true);
    try {
      const dateToFormat = typeof values.departureDate === 'string'
        ? parseISO(values.departureDate)
        : values.departureDate;

      const formattedDate = format(dateToFormat, 'yyyy-MM-dd');
      const searchData = {
        departureStationId: values.departureStationId,
        arrivalStationId: values.arrivalStationId,
        departureDate: formattedDate
      };

      const results = await scheduleService.searchRoutes(searchData);
      setSearchResults(results);

      navigate(`/search?from=${values.departureStationId}&to=${values.arrivalStationId}&date=${formattedDate}`, { replace: true });
    } catch (err) {
      console.error('Search error:', err);
      error(err.response?.data?.message || 'Error searching for routes. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBooking = (scheduleId, departureStationId, arrivalStationId) => {
    navigate(`/booking/${scheduleId}?from=${departureStationId}&to=${arrivalStationId}`);
  };

  const swapStations = (setFieldValue, values) => {
    setFieldValue('departureStationId', values.arrivalStationId);
    setFieldValue('arrivalStationId', values.departureStationId);
  };

  if (loading) {
    return <Loader text="Loading stations..." />;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Search Train Routes</h2>

      <Formik
        initialValues={{
          departureStationId: initialFromId || '',
          arrivalStationId: initialToId || '',
          departureDate: initialDate
        }}
        validationSchema={searchSchema}
        onSubmit={searchRoutes}
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
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>From</Form.Label>
                      <Form.Select
                        name="departureStationId"
                        value={values.departureStationId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.departureStationId && errors.departureStationId}
                      >
                        <option value="">Select departure station</option>
                        {stations.map(station => (
                          <option key={station.id} value={station.id}>
                            {station.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.departureStationId}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={1} className="d-flex align-items-center justify-content-center mb-3">
                    <Button
                      variant="light"
                      className="rounded-circle p-2 border"
                      onClick={() => swapStations(setFieldValue, values)}
                      title="Swap stations"
                    >
                      <FaExchangeAlt />
                    </Button>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>To</Form.Label>
                      <Form.Select
                        name="arrivalStationId"
                        value={values.arrivalStationId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.arrivalStationId && errors.arrivalStationId}
                      >
                        <option value="">Select arrival station</option>
                        {stations.map(station => (
                          <option key={station.id} value={station.id}>
                            {station.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.arrivalStationId}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
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
                  </Col>
                </Row>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button type="submit" variant="primary" disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Form>
        )}
      </Formik>

      {isSearching ? (
        <Loader text="Searching for trains..." />
      ) : (
        <>
          {searchResults.length > 0 ? (
            <div>
              <h3 className="mb-3">Search Results</h3>
              {searchResults.map((result) => (
                <Card key={result.scheduleId} className="mb-3 shadow-sm search-result-card">
                  <Card.Body>
                    <Row>
                      <Col xs={12} md={8}>
                        <div className="d-flex align-items-center mb-3">
                          <FaTrain className="text-primary me-2" size={20} />
                          <h5 className="mb-0">{result.trainName} - {result.routeName}</h5>
                        </div>

                        <Row className="mb-3">
                          <Col xs={5}>
                            <div className="d-flex flex-column">
                              <span className="fs-4 fw-bold">{result.departureTime}</span>
                              <span className="text-muted">{format(parseISO(result.departureDate.toString()), 'dd MMM yyyy')}</span>
                              <span className="fw-bold">{result.departureStation.name}</span>
                            </div>
                          </Col>

                          <Col xs={2} className="text-center">
                            <div className="d-flex flex-column align-items-center">
                              <div className="bg-light px-2 py-1 rounded-pill">
                                <small>{result.durationMinutes < 60
                                  ? `${result.durationMinutes}m`
                                  : `${Math.floor(result.durationMinutes / 60)}h ${result.durationMinutes % 60}m`}
                                </small>
                              </div>
                              <div className="border-top border-2 w-100 my-2"></div>
                              <small className="text-muted">{result.distanceKm} km</small>
                            </div>
                          </Col>

                          <Col xs={5}>
                            <div className="d-flex flex-column">
                              <span className="fs-4 fw-bold">{result.arrivalTime}</span>
                              <span className="text-muted">{format(parseISO(result.departureDate.toString()), 'dd MMM yyyy')}</span>
                              <span className="fw-bold">{result.arrivalStation.name}</span>
                            </div>
                          </Col>
                        </Row>

                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="text-muted me-1" />
                          <small className="text-muted me-3">Distance: {result.distanceKm} km</small>

                          <FaClock className="text-muted me-1" />
                          <small className="text-muted">Duration: {
                            result.durationMinutes < 60
                              ? `${result.durationMinutes} minutes`
                              : `${Math.floor(result.durationMinutes / 60)}h ${result.durationMinutes % 60}m`
                          }</small>
                        </div>
                      </Col>

                      <Col xs={12} md={4} className="d-flex flex-column justify-content-center border-start ps-4 mt-3 mt-md-0">
                        <div className="mb-3">
                          <div className="text-muted mb-1">Available Seats</div>
                          <div className="fs-5 fw-bold">{result.availableSeats}</div>
                        </div>

                        <Button
                          variant="primary"
                          onClick={() => handleBooking(
                            result.scheduleId,
                            result.departureStation.id,
                            result.arrivalStation.id
                          )}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <span>Select Seats</span>
                          <FaChevronRight className="ms-2" />
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            searchParams.toString() && (
              <BsAlert variant="info">
                No routes found for the selected criteria. Please try different stations or dates.
              </BsAlert>
            )
          )}
        </>
      )}
    </Container>
  );
};

export default SearchPage;