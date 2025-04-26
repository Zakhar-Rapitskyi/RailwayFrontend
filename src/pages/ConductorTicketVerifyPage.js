import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FaTicketAlt, FaQrcode, FaCheck, FaTimes, FaSearch, FaUser } from 'react-icons/fa';
import { format, parseISO, isPast } from 'date-fns';

import conductorService from '../api/conductorService';
import Loader from '../components/common/Loader';
import { useAlert } from '../contexts/AlertContext';

// Validation schema
const ticketVerifySchema = Yup.object().shape({
  ticketNumber: Yup.string().required('Ticket number is required')
});

const ConductorTicketVerifyPage = () => {
  const [verifying, setVerifying] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const { error: alertError, success } = useAlert();

  const handleVerifyTicket = async (values, { resetForm }) => {
    setVerifying(true);
    setError(null);
    setTicket(null);
    
    try {
      const ticketData = await conductorService.verifyTicket(values.ticketNumber);
      setTicket(ticketData);
      
      // Check if ticket is valid
      const isValid = !isPast(parseISO(ticketData.departureDatetime));
      
      if (isValid) {
        success('Ticket is valid!');
      } else {
        alertError('Ticket has expired!');
      }
    } catch (err) {
      console.error('Error verifying ticket:', err);
      setError(err.response?.data?.message || 'Ticket not found or invalid.');
      alertError('Ticket verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <FaTicketAlt className="me-2" />
        Verify Ticket
      </h2>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Ticket Verification</h4>
              
              <Formik
                initialValues={{ ticketNumber: '' }}
                validationSchema={ticketVerifySchema}
                onSubmit={handleVerifyTicket}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  resetForm
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Ticket Number</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          name="ticketNumber"
                          value={values.ticketNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.ticketNumber && errors.ticketNumber}
                          placeholder="Enter ticket number"
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => {
                            alert('QR scanner would open here');
                          }}
                        >
                          <FaQrcode />
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {errors.ticketNumber}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={verifying}
                      >
                        {verifying ? (
                          <>Verifying... <Loader /></>
                        ) : (
                          <>
                            <FaSearch className="me-2" />
                            Verify Ticket
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline-secondary"
                        onClick={() => {
                          resetForm();
                          setTicket(null);
                          setError(null);
                        }}
                        disabled={verifying}
                      >
                        Clear
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
              
              {error && (
                <Alert variant="danger" className="mt-4">
                  <FaTimes className="me-2" />
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          {ticket ? (
            <Card className="shadow-sm mb-4">
              <Card.Header className={`bg-${isPast(parseISO(ticket.departureDatetime)) ? 'danger' : 'success'} text-white`}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    {isPast(parseISO(ticket.departureDatetime)) ? (
                      <>
                        <FaTimes className="me-2" />
                        Expired Ticket
                      </>
                    ) : (
                      <>
                        <FaCheck className="me-2" />
                        Valid Ticket
                      </>
                    )}
                  </h5>
                  <span>#{ticket.ticketNumber}</span>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="mb-4 text-center">
                  {ticket.qrCode ? (
                    <img 
                      src={`data:image/png;base64,${ticket.qrCode}`}
                      alt="Ticket QR Code"
                      style={{ maxWidth: '200px' }}
                      className="img-fluid border p-2 rounded"
                    />
                  ) : (
                    <div className="p-4 bg-light text-muted">QR code not available</div>
                  )}
                </div>
                
                <Row className="mb-3">
                  <Col xs={6}>
                    <div className="fw-bold mb-1">From:</div>
                    <div>{ticket.departureStation.name}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="fw-bold mb-1">To:</div>
                    <div>{ticket.arrivalStation.name}</div>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col xs={6}>
                    <div className="fw-bold mb-1">Departure Date:</div>
                    <div>{format(parseISO(ticket.departureDatetime), 'dd MMM yyyy')}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="fw-bold mb-1">Departure Time:</div>
                    <div>{format(parseISO(ticket.departureDatetime), 'HH:mm')}</div>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col xs={6}>
                    <div className="fw-bold mb-1">Car Number:</div>
                    <div>{ticket.carNumber}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="fw-bold mb-1">Seat Number:</div>
                    <div>{ticket.seatNumber}</div>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col xs={12}>
                    <div className="fw-bold mb-1">
                      <FaUser className="me-1" /> Passenger:
                    </div>
                    {/* Updated: Display passenger name instead of ID */}
                    {ticket.user ? (
                      <div>{`${ticket.user.firstName} ${ticket.user.lastName}`}</div>
                    ) : (
                      <div>{`Passenger information not available`}</div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm text-center p-5">
              <Card.Body>
                <FaTicketAlt size={50} className="text-muted mb-3" />
                <h4>No Ticket Found</h4>
                <p className="text-muted">Enter a ticket number and click "Verify Ticket" to see ticket details.</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ConductorTicketVerifyPage;