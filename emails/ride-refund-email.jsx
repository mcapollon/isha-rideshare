import { 
  Body, Container, Column, Head, Heading, Hr, Html, Img, Link, Preview, Row, 
  Section, Text, Button
} from '@react-email/components';
import { format } from 'date-fns';

// Base64 encoded SVG icons for use in email
const ICONS = {
  calendar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTkgNEg1QzMuODk1NDMgNCAzIDQuODk1NDMgMyA2VjIwQzMgMjEuMTA0NiAzLjg5NTQzIDIyIDUgMjJIMTlDMjAuMTA0NiAyMiAyMSAyMS4xMDQ2IDIxIDIwVjZDMjEgNC44OTU0MyAyMC4xMDQ2IDQgMTkgNFoiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTYgMlY2IiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTggMlY2IiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTMgMTBIMjEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=",
  mapPin: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjEgMTBDMjEgMTcgMTIgMjMgMTIgMjNDMTIgMjMgMyAxNyAzIDEwQzMgNy42MTMwNSAzLjk0ODIxIDUuMzIzODcgNS42MzYwNCAzLjYzNjA0QzcuMzIzODcgMS45NDgyMSA5LjYxMzA1IDEgMTIgMUMxNC4zODcgMSAxNi42NzYxIDEuOTQ4MjEgMTguMzY0IDMuNjM2MDRDMJALU4yMTggNS4zMjM4NyAyMSA3LjYxMzA1IDIxIDEwWiIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAxM0MxMy42NTY5IDEzIDE1IDExLjY1NjkgMTUgMTBDMTUgOC4zNDMxNSAxMy42NTY5IDcgMTIgN0MxMC4zNDMxIDcgOSA4LjM0MzE1IDkgMTBDOSAxMS42NTY5IDEwLjM0MzEgMTMgMTIgMTNaIiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+",
  creditCard: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMSA0QzEgMy40NDc3MiAxLjQ0NzcyIDMgMiAzSDIyQzIyLjU1MjMgMyAyMyAzLjQ0NzcyIDIzIDRWMjBDMjMgMjAuNTUyMyAyMi41NTIzIDIxIDIyIDIxSDJDMS40NDc3MiAyMSAxIDIwLjU1MjMgMSAyMFY0WiIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xIDEwSDIzIiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+",
};

export const RefundNotificationEmail = ({
  userName,
  rideDate,
  rideTime,
  startingCity,
  destination,
  seatsBooked,
  totalAmount,
  refundId,
  paymentIntent,
}) => {
  const baseUrl = 'https://isharideshare.com';
  const formattedDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <Html>
      <Head />
      <Preview>Your Isha RideShare Refund Confirmation - {formattedDate}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Heading style={heading}>Ride Cancellation & Refund</Heading>
            
            <Text style={paragraphBold}>
              Hello {userName},
            </Text>

            <Text style={paragraph}>
              We're reaching out to inform you that a ride you booked has been cancelled by the driver. 
              We have automatically processed a full refund to your original payment method.
            </Text>

            {/* Refund Summary Card */}
            <Section style={rideCard}>
              <Row>
                <Column>
                  <Text style={rideCardTitle}>Refund Details</Text>
                </Column>
              </Row>
              
              <Row style={rideDetail}>
                <Column style={{ width: '24px', verticalAlign: 'top', paddingTop: '2px' }}>
                  <Text style={{ ...rideDetailText, fontSize: '16px' }}>
                    📅
                  </Text>
                </Column>
                <Column>
                  <Text style={rideDetailText}>Cancelled Ride: {rideDate} at {rideTime}</Text>
                </Column>
              </Row>

              <Row style={rideDetail}>
                <Column style={{ width: '24px', verticalAlign: 'top', paddingTop: '2px' }}>
                  <Text style={{ ...rideDetailText, fontSize: '16px' }}>
                    📍
                  </Text>
                </Column>
                <Column>
                  <Text style={rideDetailText}>
                    From: {startingCity} To: {destination}
                  </Text>
                </Column>
              </Row>

              <Row style={rideDetail}>
                <Column style={{ width: '24px', verticalAlign: 'top', paddingTop: '2px' }}>
                  <Text style={{ ...rideDetailText, fontSize: '16px' }}>
                    💳
                  </Text>
                </Column>
                <Column>
                  <Text style={rideDetailText}>
                    Refund Amount: ${totalAmount}
                  </Text>
                </Column>
              </Row>
              
              <Hr style={dividerLight} />
              
              {/* Payment Summary */}
              <Row style={paymentSummary}>
                <Column>
                  <Text style={paymentSummaryText}>
                    Refund Amount
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={paymentSummaryValue}>
                    ${totalAmount}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={paragraph}>
              Your refund has been processed and should appear in your account within 5-10 business days, 
              depending on your payment provider.
            </Text>

            {/* Refund ID and Support */}
            <Section style={rideInfoSection}>
              <Text style={rideIdText}>Refund ID: {refundId}</Text>
              <Text style={rideIdText}>Original Payment ID: {paymentIntent}</Text>
              <Text style={supportText}>
                Questions about your refund? Visit our <Link href={`${baseUrl}/help`} style={supportLink}>Help Center</Link> or contact our support team.
              </Text>
            </Section>

            {/* CTA Section */}
            <Section style={ctaSection}>
              <Button
                href={`${baseUrl}/find`}
                style={ctaButton}
              >
                Find Another Ride
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
              © {new Date().getFullYear()} Isha RideShare. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles (matching your existing email styles)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const content = {
  padding: '0 24px',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  color: '#111827',
  margin: '16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4B5563',
  margin: '16px 0',
};

const paragraphBold = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  fontWeight: '600',
  margin: '16px 0 8px',
};

const rideCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
};

const rideCardTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px',
};

const rideDetail = {
  margin: '12px 0',
};

const rideDetailText = {
  fontSize: '15px',
  color: '#4B5563',
  margin: '0',
  padding: '0',
};

const iconImage = {
  margin: '0',
  padding: '0',
  verticalAlign: 'middle',
};

const divider = {
  borderTop: '1px solid #E5E7EB',
  margin: '32px 0',
};

const dividerLight = {
  borderTop: '1px solid #F3F4F6',
  margin: '16px 0',
};

const paymentSummary = {
  margin: '8px 0',
};

const paymentSummaryText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0',
  fontWeight: '500',
};

const paymentSummaryValue = {
  fontSize: '14px',
  color: '#111827',
  margin: '0',
  fontWeight: '600',
};

const rideInfoSection = {
  margin: '24px 0',
};

const rideIdText = {
  fontSize: '13px',
  color: '#6B7280',
  margin: '4px 0',
};

const supportText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '16px 0',
};

const supportLink = {
  color: '#ea580c',
  textDecoration: 'none',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center',
};

const ctaButton = {
  backgroundColor: '#ea580c',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 24px',
  display: 'inline-block',
};

const footer = {
  textAlign: 'center',
};

const footerText = {
  fontSize: '13px',
  lineHeight: '24px',
  color: '#6B7280',
  margin: '8px 0',
};

export default RefundNotificationEmail;