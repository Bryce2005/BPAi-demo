export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'bg-green-500';
    case 'rejected': return 'bg-red-500';
    case 'pending': return 'bg-blue-500';
    case 'for review': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

export const getRiskScoreColor = (score: number) => {
  if (score >= 80) return 'text-red-600 bg-red-50';
  if (score >= 60) return 'text-orange-600 bg-orange-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
};

export const getStatusBadge = (status: string) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  switch (status.toLowerCase()) {
    case 'approved':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'rejected':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'pending':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'for review':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export const getRiskScoreTableColor = (score: number) => {
  if (score >= 80) return 'text-red-600 font-bold';
  if (score >= 60) return 'text-orange-600 font-semibold';
  if (score >= 40) return 'text-yellow-600 font-semibold';
  return 'text-green-600 font-semibold';
};