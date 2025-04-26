import React from 'react';
import { Navbar as BsNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaTrain, FaUserCircle, FaTicketAlt, FaSearch, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaQrcode } from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, isAuthenticated, isAdmin, isConductor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BsNavbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          <FaTrain className="me-2" />
          Railway Booking
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/search">
              <FaSearch className="me-1" /> Search Trains
            </Nav.Link>

            {isAuthenticated && (
              <Nav.Link as={NavLink} to="/my-tickets">
                <FaTicketAlt className="me-1" /> My Tickets
              </Nav.Link>
            )}

            {/* Conductor Menu Item */}
            {isConductor && (
              <Nav.Link as={NavLink} to="/conductor/verify-ticket">
                <FaQrcode className="me-1" /> Verify Ticket
              </Nav.Link>
            )}

            {isAdmin && (
              <NavDropdown title="Admin" id="admin-dropdown">
                <NavDropdown.Item as={NavLink} to="/admin/schedules">
                  Manage Schedules
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/reports/tickets">
                  Ticket Reports
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span>
                    <FaUserCircle className="me-1" />
                    {currentUser?.firstName} {currentUser?.lastName}
                    {isConductor && <span className="ms-1 badge bg-info">Conductor</span>}
                    {isAdmin && <span className="ms-1 badge bg-danger">Admin</span>}
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={NavLink} to="/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/my-tickets">
                  My Tickets
                </NavDropdown.Item>
                {isConductor && (
                  <NavDropdown.Item as={NavLink} to="/conductor/verify-ticket">
                    Verify Ticket
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-1" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-light"
                  className="me-2"
                >
                  <FaSignInAlt className="me-1" /> Login
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="light"
                >
                  <FaUserPlus className="me-1" /> Register
                </Button>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;