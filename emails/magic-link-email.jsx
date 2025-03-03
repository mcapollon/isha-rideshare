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

export const MagicLinkEmail = ({
  magicLink,
  userName = 'Seeker',
}) => {
  const baseUrl = process.env.BASE_URL;

  return (
    <Html>
      <Head />
      <Preview>Your Isha RideShare Magic Link</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          {/* <Section style={logoContainer}>
            <Img
              src="../public/logo.png"
              width="120"
              height="60"
              alt="Isha RideShare"
              style={logo}
            />
          </Section> */}

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Sign in to Isha RideShare</Heading>
            
            <Text style={paragraph}>
              Hello {userName},
            </Text>
            
            <Text style={paragraph}>
              Thank you for using Isha RideShare. Use the button below to securely sign in to your account. This magic link will expire in 10 minutes.
            </Text>

            <Section style={buttonContainer}>
              <Link style={button} href={magicLink}>
                Sign In
              </Link>
            </Section>

            <Text style={paragraph}>
              If you didn't request this link, please ignore this email.
            </Text>

            <Text style={paragraph}>
              If you're having trouble with the button above, copy and paste the URL below into your web browser:
            </Text>
            
            <Link href={magicLink} style={linkText}>
              {magicLink}
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Row>
              <Column>
                <Text style={footerText}>
                  Isha RideShare - Connect with fellow seekers
                </Text>
                <Text style={footerText}>
                  Share rides to Isha Yoga Centers around the world
                </Text>
              </Column>
            </Row>

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

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4B5563',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center',
  margin: '32px 0',
};

const button = {
  backgroundColor: '#D97706', // amber-600
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
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
};

const linkText = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#6B7280',
  wordBreak: 'break-all',
  margin: '16px 0',
};

const divider = {
  borderColor: '#E5E7EB',
  margin: '32px 0 24px',
};

const footer = {
  textAlign: 'center',
  padding: '0 24px',
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
  color: '#D97706', // amber-600
  textDecoration: 'none',
};

const copyright = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#9CA3AF',
  margin: '16px 0',
};

export default MagicLinkEmail;