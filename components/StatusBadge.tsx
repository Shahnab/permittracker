

import React from 'react';
import { PermitStatus, RenewalStatus } from '../types';

interface StatusBadgeProps {
  status: PermitStatus | RenewalStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: { [key in PermitStatus | RenewalStatus]: string } = {
    [PermitStatus.Active]: 'bg-green-100 text-status-green',
    [PermitStatus.ExpiresSoon]: 'bg-yellow-100 text-status-yellow',
    [PermitStatus.Expired]: 'bg-red-100 text-status-red',
    [PermitStatus.InProcess]: 'bg-blue-100 text-status-blue',
    [RenewalStatus.Approved]: 'bg-green-100 text-status-green',
    [RenewalStatus.Rejected]: 'bg-red-100 text-status-red',
    [RenewalStatus.Pending]: 'bg-yellow-100 text-status-yellow',
  };

  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;