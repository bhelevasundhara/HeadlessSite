'use server'
// One-time script to seed Product2 records in Salesforce for the demo
// Run by visiting /api/seed in the browser once

import { NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const DEMO_PRODUCTS = [
  { Name: 'Bobcat S76 Skid-Steer Loader', ProductCode: 'S76-001', Family: 'Skid-Steer Loaders', Description: 'High-performance skid-steer loader with powerful lift capacity and exceptional maneuverability for tight spaces.' },
  { Name: 'Bobcat T76 Compact Track Loader', ProductCode: 'T76-001', Family: 'Compact Track Loaders', Description: 'Durable compact track loader designed for rough terrain with superior traction and ground pressure distribution.' },
  { Name: 'Bobcat E88 Compact Excavator', ProductCode: 'E88-001', Family: 'Compact Excavators', Description: 'Powerful compact excavator with zero tail swing and deep digging capabilities for construction and landscaping.' },
  { Name: 'Bobcat E35 Mini Excavator', ProductCode: 'E35-001', Family: 'Compact Excavators', Description: 'Versatile mini excavator ideal for urban jobsites with restricted access and precision excavation needs.' },
  { Name: 'Bobcat L28 Small Articulated Loader', ProductCode: 'L28-001', Family: 'Articulated Loaders', Description: 'Compact articulated loader with excellent visibility and tight turning radius for residential and landscaping work.' },
  { Name: 'Bobcat TL30.70 Telehandler', ProductCode: 'TL30-001', Family: 'Telehandlers', Description: 'Heavy-duty telescopic handler with 3,000 kg lift capacity and 7.0 m lift height for construction sites.' },
  { Name: 'Bobcat TL38.10 Telehandler', ProductCode: 'TL38-001', Family: 'Telehandlers', Description: 'High-reach telehandler with 3,800 kg capacity and 10 m lift height, perfect for large-scale construction projects.' },
  { Name: 'Bobcat WL14 Wheel Loader', ProductCode: 'WL14-001', Family: 'Wheel Loaders', Description: 'Efficient wheel loader with smooth hydrostatic transmission and high breakout force for material handling.' },
  { Name: 'Bobcat WL18 Compact Wheel Loader', ProductCode: 'WL18-001', Family: 'Wheel Loaders', Description: 'Compact wheel loader delivering high productivity in a small package, ideal for agriculture and municipalities.' },
  { Name: 'Bobcat VR518 Versahandler', ProductCode: 'VR518-001', Family: 'Telehandlers', Description: 'Rotating telescopic handler with 360° swing for maximum versatility on busy construction sites.' },
];

async function getClient() {
  const instanceUrl = process.env.SF_INSTANCE_URL!;
  const tokenRes = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SF_CLIENT_ID!,
      client_secret: process.env.SF_CLIENT_SECRET!,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || tokenData.error) throw new Error(tokenData.error_description);

  const url = new URL('https://api.salesforce.com/platform/mcp/v1/platform/sobject-all');
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: { headers: { 'Authorization': `Bearer ${tokenData.access_token}` } }
  });
  const client = new Client({ name: 'seed-script', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  await client.listTools();
  return client;
}

export async function GET() {
  try {
    const client = await getClient();
    const results = [];

    for (const product of DEMO_PRODUCTS) {
      const result = await client.callTool({
        name: 'createSobjectRecord',
        arguments: { 'sobject-name': 'Product2', 'body': { ...product, IsActive: true } }
      });
      const text = (result.content as { text: string }[])[0].text;
      const parsed = JSON.parse(text);
      results.push({ name: product.Name, id: parsed.id });
    }

    await client.close();
    return NextResponse.json({ success: true, created: results.length, products: results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
