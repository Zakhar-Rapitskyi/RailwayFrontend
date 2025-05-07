import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaTrain, FaRoute, FaCalendarAlt, FaTicketAlt, FaChartLine } from 'react-icons/fa';

import stationService from '../api/stationService';
import trainService from '../api/trainService';
import routeService from '../api/routeService';
import scheduleService from '../api/scheduleService';
import ticketService from '../api/ticketService';
import Loader from '../components/common/Loader';
import { useAlert } from '../contexts/AlertContext';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    stations: 0,
    trains: 0,
    routes: 0,
    schedules: 0,
    tickets: 0
  });
  const [latestEntities, setLatestEntities] = useState({
    stations: [],
    trains: [],
    routes: [],
    schedules: []
  });
  const { error } = useAlert();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [stations, trains, routes, schedules] = await Promise.all([
          stationService.getAllStations(),
          trainService.getAllTrains(),
          routeService.getAllRoutes(),
          scheduleService.getAllSchedules()
        ]);

        setStats({
          stations: stations.length,
          trains: trains.length,
          routes: routes.length,
          schedules: schedules.length,
          tickets: 0 
        });

        setLatestEntities({
          stations: stations.slice(-5).reverse(),
          trains: trains.slice(-5).reverse(),
          routes: routes.slice(-5).reverse(),
          schedules: schedules.slice(-5).reverse()
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        error('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [error]);

  if (loading) {
    return <Loader text="Loading dashboard data..." />;
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4} lg={2} className="mb-3">
          <StatsCard 
            title="Stations" 
            count={stats.stations} 
            icon={<FaRoute />} 
            color="primary"
            link="/admin/stations"
          />
        </Col>
        <Col md={4} lg={2} className="mb-3">
          <StatsCard 
            title="Trains" 
            count={stats.trains} 
            icon={<FaTrain />} 
            color="success"
            link="/admin/trains"
          />
        </Col>
        <Col md={4} lg={2} className="mb-3">
          <StatsCard 
            title="Routes" 
            count={stats.routes} 
            icon={<FaRoute />} 
            color="info"
            link="/admin/routes"
          />
        </Col>
        <Col md={4} lg={2} className="mb-3">
          <StatsCard 
            title="Schedules" 
            count={stats.schedules} 
            icon={<FaCalendarAlt />} 
            color="warning"
            link="/admin/schedules"
          />
        </Col>
        <Col md={4} lg={2} className="mb-3">
          <StatsCard 
            title="Tickets" 
            count={stats.tickets} 
            icon={<FaTicketAlt />} 
            color="danger"
            link="/admin/tickets"
          />
        </Col>
        <Col md={4} lg={2} className="mb-3">
          <StatsCard 
            title="Users" 
            count={0} 
            icon={<FaUsers />} 
            color="secondary"
            link="/admin/users"
          />
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Quick Actions</h5>
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/admin/stations/create" variant="outline-primary" size="sm">
              Add Station
            </Button>
            <Button as={Link} to="/admin/trains/create" variant="outline-primary" size="sm">
              Add Train
            </Button>
            <Button as={Link} to="/admin/routes/create" variant="outline-primary" size="sm">
              Create Route
            </Button>
            <Button as={Link} to="/admin/schedules/create" variant="outline-primary" size="sm">
              Add Schedule
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Latest Entities Tabs */}
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Recent Entries</h5>
          <Tabs defaultActiveKey="stations" className="mb-3">
            <Tab eventKey="stations" title="Stations">
              <LatestEntitiesTable
                entities={latestEntities.stations}
                headers={['ID', 'Name', 'Actions']}
                renderRow={(station) => (
                  <tr key={station.id}>
                    <td>{station.id}</td>
                    <td>{station.name}</td>
                    <td>
                      <Button as={Link} to={`/admin/stations/${station.id}`} variant="outline-primary" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                )}
                emptyMessage="No stations found"
              />
            </Tab>
            <Tab eventKey="trains" title="Trains">
              <LatestEntitiesTable
                entities={latestEntities.trains}
                headers={['ID', 'Name', 'Cars', 'Actions']}
                renderRow={(train) => (
                  <tr key={train.id}>
                    <td>{train.id}</td>
                    <td>{train.name}</td>
                    <td>{train.totalCars}</td>
                    <td>
                      <Button as={Link} to={`/admin/trains/${train.id}`} variant="outline-primary" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                )}
                emptyMessage="No trains found"
              />
            </Tab>
            <Tab eventKey="routes" title="Routes">
              <LatestEntitiesTable
                entities={latestEntities.routes}
                headers={['ID', 'Name', 'Stations', 'Actions']}
                renderRow={(route) => (
                  <tr key={route.id}>
                    <td>{route.id}</td>
                    <td>{route.name}</td>
                    <td>{route.stations?.length || 0}</td>
                    <td>
                      <Button as={Link} to={`/admin/routes/${route.id}`} variant="outline-primary" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                )}
                emptyMessage="No routes found"
              />
            </Tab>
            <Tab eventKey="schedules" title="Schedules">
              <LatestEntitiesTable
                entities={latestEntities.schedules}
                headers={['ID', 'Route', 'Train', 'Date', 'Actions']}
                renderRow={(schedule) => (
                  <tr key={schedule.id}>
                    <td>{schedule.id}</td>
                    <td>{schedule.route?.name || 'N/A'}</td>
                    <td>{schedule.train?.name || 'N/A'}</td>
                    <td>{schedule.departureDate}</td>
                    <td>
                      <Button as={Link} to={`/admin/schedules/${schedule.id}`} variant="outline-primary" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                )}
                emptyMessage="No schedules found"
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

const StatsCard = ({ title, count, icon, color, link }) => (
  <Card className="h-100 shadow-sm">
    <Card.Body className="text-center">
      <div className={`text-${color} mb-3`}>
        {icon}
      </div>
      <h3 className="fw-bold">{count}</h3>
      <div className="text-muted">{title}</div>
    </Card.Body>
    <Card.Footer className="bg-white border-0 py-2">
      <Button as={Link} to={link} variant={`outline-${color}`} size="sm" className="w-100">
        Manage
      </Button>
    </Card.Footer>
  </Card>
);

const LatestEntitiesTable = ({ entities, headers, renderRow, emptyMessage }) => (
  <div className="table-responsive">
    {entities.length > 0 ? (
      <Table hover className="align-middle">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entities.map(renderRow)}
        </tbody>
      </Table>
    ) : (
      <div className="text-center py-4 text-muted">
        {emptyMessage}
      </div>
    )}
  </div>
);

export default AdminDashboardPage;