import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h1 className="display-1 fw-bold text-danger">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-5">
            The page you are looking for does not exist or has been moved to another location.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/" variant="primary">
              Go to Home
            </Button>
            <Button as={Link} to="/search" variant="outline-primary">
              Search Trains
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;