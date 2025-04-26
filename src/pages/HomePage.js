import React from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaTicketAlt, FaClock, FaMapMarkerAlt, FaTrain } from 'react-icons/fa';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">Book Your Train Tickets Online</h1>
              <p className="lead mb-4">
                Fast, reliable, and convenient way to book train tickets across Ukraine.
                Search schedules, choose your seats, and manage your journeys all in one place.
              </p>
              <Button as={Link} to="/search" variant="light" size="lg" className="me-3">
                <FaSearch className="me-2" /> Search Trains
              </Button>
              <Button as={Link} to="/register" variant="outline-light" size="lg">
                Sign Up Now
              </Button>
            </Col>
            <Col lg={6}>
              <img
                src="https://www.transportadvancement.com/wp-content/uploads/2019/01/Railway_Management_System.jpg"
                alt="Train illustration"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Why Choose Our Service</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm card-hover">
              <Card.Body className="text-center p-4">
                <div className="icon-wrapper bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <FaSearch size={24} />
                </div>
                <Card.Title>Easy Search</Card.Title>
                <Card.Text>
                  Quickly find trains between any stations with our intuitive search interface.
                  Filter by date, time, and train type.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm card-hover">
              <Card.Body className="text-center p-4">
                <div className="icon-wrapper bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <FaTicketAlt size={24} />
                </div>
                <Card.Title>Convenient Booking</Card.Title>
                <Card.Text>
                  Choose your preferred seats with our visual seat selector and receive digital tickets instantly.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm card-hover">
              <Card.Body className="text-center p-4">
                <div className="icon-wrapper bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <FaClock size={24} />
                </div>
                <Card.Title>Time-Saving</Card.Title>
                <Card.Text>
                  Skip the queue! Book your tickets online anytime, anywhere from your device.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Call to Action */}
      <Container className="mb-5 text-center">
        <Card className="bg-primary text-white p-5 border-0 rounded-3">
          <Card.Body>
            <h2 className="mb-3">Ready to Book Your Journey?</h2>
            <p className="lead mb-4">
              Search for available trains, select your seats, and get your e-tickets in minutes.
            </p>
            <Button
              as={Link}
              to="/search"
              variant="light"
              size="lg"
              className="px-4"
            >
              Search Trains Now
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default HomePage;