import React from 'react';
import styled from 'styled-components';
import useAuthorizationGate from 'hooks/useAuthorizationGate';

export default function DashboardPage() {
  useAuthorizationGate();

  return null;
}
