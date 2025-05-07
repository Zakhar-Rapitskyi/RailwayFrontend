import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import { FaTrain, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaQrcode, FaTicketAlt, FaTimes } from 'react-icons/fa';
import { format, parseISO, isBefore } from 'date-fns';

import ticketService from '../api/ticketService';
import Loader from '../components/common/Loader';
import { useAlert } from '../contexts/AlertContext';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelingTicketId, setCancelingTicketId] = useState(null);
  const { success, error } = useAlert();

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const data = await ticketService.getCurrentUserTickets();
        setTickets(data);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        error('Failed to load your tickets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [error]);

  const handleShowQrCode = (ticket) => {
    setSelectedTicket(ticket);
    setShowQrModal(true);
  };

  const handleCancelTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to cancel this ticket? This action cannot be undone.')) {
      setCancelingTicketId(ticketId);
      try {
        await ticketService.cancelTicket(ticketId);
        setTickets(tickets.filter(ticket => ticket.id !== ticketId));
        success('Ticket canceled successfully.');
      } catch (err) {
        console.error('Error canceling ticket:', err);
        error(err.response?.data?.message || 'Failed to cancel ticket. Please try again.');
      } finally {
        setCancelingTicketId(null);
      }
    }
  };

  const isUpcoming = (ticket) => {
    return !isBefore(parseISO(ticket.departureDatetime), new Date());
  };

  const upcomingTickets = tickets.filter(isUpcoming);
  const pastTickets = tickets.filter(ticket => !isUpcoming(ticket));

  if (loading) {
    return <Loader text="Loading your tickets..." />;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaTicketAlt className="me-2" />
          My Tickets
        </h2>
      </div>

      {tickets.length === 0 ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <h4 className="mb-3">You don't have any tickets yet</h4>
            <p className="text-muted mb-4">Search for trains and book your tickets to see them here.</p>
            <Button href="/search" variant="primary">Search Trains</Button>
          </Card.Body>
        </Card>
      ) : (
        <Tabs defaultActiveKey="upcoming" className="mb-4">
          <Tab eventKey="upcoming" title={`Upcoming (${upcomingTickets.length})`}>
            {upcomingTickets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">You don't have any upcoming tickets.</p>
                <Button href="/search" variant="primary">Book New Ticket</Button>
              </div>
            ) : (
              <Row>
                {upcomingTickets.map(ticket => (
                  <Col key={ticket.id} md={6} lg={4} className="mb-4">
                    <TicketCard 
                      ticket={ticket} 
                      onShowQrCode={handleShowQrCode} 
                      onCancelTicket={handleCancelTicket}
                      cancelingTicketId={cancelingTicketId}
                      isUpcoming={true}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
          <Tab eventKey="past" title={`Past (${pastTickets.length})`}>
            {pastTickets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">You don't have any past tickets.</p>
              </div>
            ) : (
              <Row>
                {pastTickets.map(ticket => (
                  <Col key={ticket.id} md={6} lg={4} className="mb-4">
                    <TicketCard 
                      ticket={ticket} 
                      onShowQrCode={handleShowQrCode}
                      isUpcoming={false}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Tab>
        </Tabs>
      )}

      {/* QR Code Modal */}
      <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ticket QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedTicket && (
            <>
              <h5 className="mb-3">Ticket #{selectedTicket.ticketNumber}</h5>
              <div className="border p-3 mb-3 rounded ticket-qr">
                {selectedTicket.qrCode ? (
                  <img 
                    src={`data:image/png;base64,${selectedTicket.qrCode}`} 
                    alt="Ticket QR Code" 
                    className="img-fluid"
                  />
                ) : (
                  <div className="text-muted">QR code not available</div>
                )}
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">From:</span>
                <span className="fw-bold">{selectedTicket.departureStation.name}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">To:</span>
                <span className="fw-bold">{selectedTicket.arrivalStation.name}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Date:</span>
                <span className="fw-bold">{format(parseISO(selectedTicket.departureDatetime), 'dd MMMM yyyy')}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Time:</span>
                <span className="fw-bold">{format(parseISO(selectedTicket.departureDatetime), 'HH:mm')}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Car:</span>
                <span className="fw-bold">{selectedTicket.carNumber}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Seat:</span>
                <span className="fw-bold">{selectedTicket.seatNumber}</span>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQrModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const TicketCard = ({ ticket, onShowQrCode, onCancelTicket, cancelingTicketId, isUpcoming }) => {
  const departureTime = format(parseISO(ticket.departureDatetime), 'HH:mm');
  const arrivalTime = format(parseISO(ticket.arrivalDatetime), 'HH:mm');
  const departureDate = format(parseISO(ticket.departureDatetime), 'dd MMM yyyy');
  
  return (
    <Card className="h-100 shadow-sm ticket-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <Badge bg={isUpcoming ? 'success' : 'secondary'} className="mb-2">
              {isUpcoming ? 'Upcoming' : 'Past'}
            </Badge>
            <h5 className="mb-1">{ticket.departureStation.name} - {ticket.arrivalStation.name}</h5>
            <div className="text-muted small">Ticket #{ticket.ticketNumber}</div>
          </div>
          <Button 
            variant="light" 
            size="sm" 
            className="border-0 text-primary" 
            onClick={() => onShowQrCode(ticket)}
          >
            <FaQrcode size={20} />
          </Button>
        </div>
        
        <div className="d-flex justify-content-between mb-3">
          <div>
            <div className="fw-bold fs-4">{departureTime}</div>
            <div className="small text-muted">{ticket.departureStation.name}</div>
          </div>
          <div className="text-center d-flex flex-column justify-content-center">
            <div className="border-top border-2 w-100 my-2"></div>
            <div className="small text-muted">{departureDate}</div>
          </div>
          <div className="text-end">
            <div className="fw-bold fs-4">{arrivalTime}</div>
            <div className="small text-muted">{ticket.arrivalStation.name}</div>
          </div>
        </div>
        
        <div className="border-top pt-3">
          <div className="d-flex justify-content-between mb-1 small">
            <span>Car:</span>
            <span className="fw-bold">{ticket.carNumber}</span>
          </div>
          <div className="d-flex justify-content-between mb-1 small">
            <span>Seat:</span>
            <span className="fw-bold">{ticket.seatNumber}</span>
          </div>
        </div>
        
        {isUpcoming && onCancelTicket && (
          <div className="mt-3">
            <Button
              variant="outline-danger"
              size="sm"
              className="w-100"
              onClick={() => onCancelTicket(ticket.id)}
              disabled={cancelingTicketId === ticket.id}
            >
              {cancelingTicketId === ticket.id ? 'Canceling...' : 'Cancel Ticket'}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MyTicketsPage;