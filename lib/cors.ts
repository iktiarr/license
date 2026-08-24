import { NextResponse } from 'next/server';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, api-key',
  'Access-Control-Max-Age': '86400',
};

export function jsonWithCors(data: unknown, init?: { status?: number; statusText?: string }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    statusText: init?.statusText,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
