import React from 'react';
import AIReport from './AIReport';

export default function AIOutput({ data, loading, title }) {
  return <AIReport response={data} loading={loading} title={title} />;
}
