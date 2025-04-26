import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrain, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <Container>
        <Row className="py-3">
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">
              <FaTrain className="me-2" />
              Railway Booking System
            </h5>
            <p className="text-muted">
              A comprehensive system for searching, booking, and managing train tickets.
              Developed for Ukrainian Railways.
            </p>
          </Col>
          
          <Col md={2} className="mb-4 mb-md-0">
            <h5 className="mb-3">Navigation</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-muted">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/search" className="text-decoration-none text-muted">Search</Link>
              </li>
              <li className="mb-2">
                <Link to="/my-tickets" className="text-decoration-none text-muted">My Tickets</Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-decoration-none text-muted">Login</Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-decoration-none text-muted">Register</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4 mb-md-0">
            <h5 className="mb-3">Popular Routes</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">Lviv - Kyiv</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">Kyiv - Kharkiv</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">Lviv - Odesa</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">Dnipro - Kyiv</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-muted">Lviv - Ivano-Frankivsk</a>
              </li>
            </ul>
          </Col>
          
          <Col md={3}>
            <h5 className="mb-3">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                Lviv, Ukraine
              </li>
              <li className="mb-2">
                <FaPhone className="me-2" />
                +380 12 345 6789
              </li>
              <li className="mb-2">
                <FaEnvelope className="me-2" />
                info@railway-booking.com
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <Row>
          <Col className="text-center text-muted">
            <p className="mb-0">
              &copy; {currentYear} Railway Booking System. All rights reserved.
              <br />
              <small>Developed by Захар Рапіцький for Lviv Polytechnic University</small>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;