import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Button,
  Column,
  Row,
} from '@react-email/components';

// Add these Base64 encoded SVG icons at the top of the file
const ICONS = {
  calendar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTkgNEg1QzMuODk1NDMgNCAzIDQuODk1NDMgMyA2VjIwQzMgMjEuMTA0NiAzLjg5NTQzIDIyIDUgMjJIMTlDMjAuMTA0NiAyMiAyMSAyMS4xMDQ2IDIxIDIwVjZDMjEgNC44OTU0MyAyMC4xMDQ2IDQgMTkgNFoiIHN0cm9rZT0iIzZCN0M5MyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTYgMlY2IiBzdHJva2U9IiM2QjdDOTMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTggMlY2IiBzdHJva2U9IiM2QjdDOTMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTMgMTBIMjEiIHN0cm9rZT0iIzZCN0M5MyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=",
  mapPin: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjEgMTBDMjEgMTcgMTIgMjMgMTIgMjNDMTIgMjMgMyAxNyAzIDEwQzMgNy42MTMwNSAzLjk0ODIxIDUuMzIzODcgNS42MzYwNCAzLjYzNjA0QzcuMzIzODcgMS45NDgyMSA5LjYxMzA1IDEgMTIgMUMxNC4zODcgMSAxNi42NzYxIDEuOTQ4MjEgMTguMzY0IDMuNjM2MDRDMjAuMDUxOCA1LjMyMzg3IDIxIDcuNjEzMDUgMjEgMTBaIiBzdHJva2U9IiM2QjdDOTMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTEyIDEzQzEzLjY1NjkgMTMgMTUgMTEuNjU2OSAxNSAxMEMxNSA4LjM0MzE1IDEzLjY1NjkgNyAxMiA3QzEwLjM0MzEgNyA5IDguMzQzMTUgOSAxMEM5IDExLjY1NjkgMTAuMzQzMSAxMyAxMiAxM1oiIHN0cm9rZT0iIzZCN0M5MyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=",
  user: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjFWMTlDMjAgMTcuOTM5MSAxOS41Nzg2IDE2LjkyMTcgMTguODI4NCAxNi4xNzE2QzE4LjA3ODMgMTUuNDIxNCAxNy4wNjA5IDE1IDE2IDE1SDhDNi45MzkxMyAxNSA1LjkyMTcyIDE1LjQyMTQgNS4xNzE1NyAxNi4xNzE2QzQuNDIxNDMgMTYuOTIxNyA0IDE3LjkzOTEgNCAxOVYyMSIgc3Ryb2tlPSIjNkI3QzkzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAxMUMxNC4yMDkxIDExIDE2IDkuMjA5MTQgMTYgN0MxNiA0Ljc5MDg2IDE0LjIwOTEgMyAxMiAzQzkuNzkwODYgMyA4IDQuNzkwODYgOCA3QzggOS4yMDkxNCA5Ljc5MDg2IDExIDEyIDExWiIgc3Ryb2tlPSIjNkI3QzkzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=="
};

export const RideReceiptEmail = ({
  userName,
  rideDate,
  rideTime,
  startingCity,
  destination,
  driverName,
  driverPhoto = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  pricePerSeat,
  seatsBooked,
  serviceFee = 3.00,
  totalAmount,
  paymentMethod = 'Visa •••• 4242',
  paymentIntent = 'RIDE-12345',
}) => {
  const baseUrl = 'https://isharideshare.com';

  return (
    <Html>
      <Head />
      <Preview>Your Isha RideShare Receipt - {rideDate}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          {/* <Section style={logoContainer}>
            <Img
              src="https://isha.sadhguru.org/yoga/wp-content/uploads/2021/01/isha-logo.png"
              width="120"
              height="60"
              alt="Isha RideShare"
              style={logo}
            />
          </Section> */}

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Your Ride Receipt</Heading>
            
            <Text style={thankYouText}>
              Thank you for riding with Isha RideShare, {userName}!
            </Text>

            {/* Ride Summary Card */}
            <Section style={rideCard}>
              <Row>
                <Column>
                  <Text style={rideCardTitle}>Ride Summary</Text>
                </Column>
              </Row>
              
              <Row style={rideDetail}>
                <Column style={{ width: '24px' }}>
                  <Img
                    src={ICONS.calendar}
                    width="16"
                    height="16"
                    alt="Date"
                    style={iconImage}
                  />
                </Column>
                <Column>
                  <Text style={rideDetailText}>{rideDate} at {rideTime}</Text>
                </Column>
              </Row>
              
              <Row style={rideDetail}>
                <Column style={{ width: '24px' }}>
                  <Img
                    src={ICONS.mapPin}
                    width="16"
                    height="16"
                    alt="Route"
                    style={iconImage}
                  />
                </Column>
                <Column>
                  <Text style={rideDetailText}>
                    <span style={routeText}>{startingCity}</span> to <span style={routeText}>{destination}</span>
                  </Text>
                </Column>
              </Row>
              
              <Row style={rideDetail}>
                <Column style={{ width: '24px' }}>
                  <Img
                    src={ICONS.user}
                    width="16"
                    height="16"
                    alt="Driver"
                    style={iconImage}
                  />
                </Column>
                <Column>
                  <Text style={rideDetailText}>Driver: {driverName}</Text>
                </Column>
              </Row>
            </Section>

            {/* Payment Details */}
            <Section style={paymentSection}>
              <Text style={sectionTitle}>Payment Details</Text>
              
              <Row style={paymentRow}>
                <Column>
                  <Text style={paymentLabel}>Ride fare</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={paymentValue}>${pricePerSeat}</Text>
                </Column>
              </Row>


              <Row style={paymentRow}>
                <Column>
                  <Text style={seatsLabel}>Number of seats</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={paymentValue}>X {seatsBooked}</Text>
                </Column>
              </Row>
              
              <Row style={paymentRow}>
                <Column>
                  <Text style={paymentLabel}>Service fee</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={paymentValue}>${serviceFee}</Text>
                </Column>
              </Row>

              <Hr style={divider} />
              
              <Row style={totalRow}>
                <Column>
                  <Text style={totalLabel}>Total</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={totalValue}>{totalAmount}</Text>
                </Column>
              </Row>
              
              {/* <Row style={paymentMethodRow}>
                <Column>
                  <Text style={paymentMethodText}>
                    Paid with {paymentMethod}
                  </Text>
                </Column>
              </Row> */}
            </Section>

            {/* Ride ID and Support */}
            <Section style={rideInfoSection}>
              <Text style={rideIdText}>Payment ID: {paymentIntent}</Text>
              <Text style={supportText}>
                Need help with your ride? Visit our <Link href={`${baseUrl}/help`} style={supportLink}>Help Center</Link> or contact our support team.
              </Text>
            </Section>

            {/* CTA Section */}
            <Section style={ctaSection}>
              <Button
                href={`${baseUrl}/find`}
                style={ctaButton}
              >
                Book Another Ride
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Isha RideShare - Connect with fellow seekers
            </Text>
            <Text style={footerText}>
              Share rides to Isha Yoga Centers around the world
            </Text>

            <Text style={footerLinks}>
              {/* <Link href={`${baseUrl}/help`} style={link}>Help</Link> •  */}
              <Link href={`${baseUrl}/privacy-policy`} style={link}> Privacy</Link> • 
              <Link href={`${baseUrl}/terms-of-service`} style={link}> Terms</Link>
            </Text>

            <Text style={copyright}>
              © {new Date().getFullYear()} Isha Foundation. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const logoContainer = {
  padding: '20px',
  textAlign: 'center',
};

const logo = {
  margin: '0 auto',
};

const content = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '40px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#333333',
  textAlign: 'center',
  margin: '0 0 24px',
};

const thankYouText = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4B5563',
  margin: '0 0 32px',
  textAlign: 'center',
};

const rideCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '32px',
};

const rideCardTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333333',
  margin: '0 0 16px',
};

const rideDetail = {
  marginBottom: '12px',
};

const iconImage = {
  verticalAlign: 'middle',
};

const rideDetailText = {
  fontSize: '15px',
  color: '#4B5563',
  margin: '0',
};

const routeText = {
  fontWeight: '500',
  color: '#333333',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#333333',
  margin: '0 0 16px',
};

const paymentSection = {
  marginBottom: '32px',
};

const paymentRow = {
  marginBottom: '12px',
};

const paymentLabel = {
  fontSize: '15px',
  color: '#6B7280',
  margin: '0',
};

const seatsLabel = {
    fontSize: '15px',
    fontWeight: '800',
    color: '#6B7280',
    margin: '0',
  };

const paymentValue = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#4B5563',
  margin: '0',
};

const divider = {
  borderColor: '#E5E7EB',
  margin: '16px 0',
};

const totalRow = {
  marginBottom: '16px',
};

const totalLabel = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333333',
  margin: '0',
};

const totalValue = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#D97706',
  margin: '0',
};

const paymentMethodRow = {
  marginTop: '8px',
};

const paymentMethodText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0',
};

const rideInfoSection = {
  marginBottom: '32px',
};

const rideIdText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0 0 8px',
};

const supportText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0',
};

const supportLink = {
  color: '#D97706',
  textDecoration: 'none',
};

const ctaSection = {
  textAlign: 'center',
};

const ctaButton = {
  backgroundColor: '#D97706',
  borderRadius: '6px',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  padding: '12px 24px',
  cursor: 'pointer',
  display: 'inline-block',
  border: '0',
};

const footer = {
  textAlign: 'center',
  padding: '24px',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#6B7280',
  margin: '8px 0',
};

const footerLinks = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#6B7280',
  margin: '24px 0 16px',
};

const link = {
  color: '#4F46E5',
  textDecoration: 'none',
};

const copyright = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#9CA3AF',
  margin: '16px 0',
};

export default RideReceiptEmail;
