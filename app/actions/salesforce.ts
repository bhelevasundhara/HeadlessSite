'use server'

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export interface Product {
  Id: string;
  Name: string;
  Description: string | null;
  ProductCode: string | null;
  Family: string | null;
}

async function getMCPClient(): Promise<Client> {
  const instanceUrl = process.env.SF_INSTANCE_URL!;
  const clientId = process.env.SF_CLIENT_ID!;
  const clientSecret = process.env.SF_CLIENT_SECRET!;

  // Step 1: Get OAuth token
  const tokenRes = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || tokenData.error) {
    throw new Error(`OAuth failed: ${tokenData.error_description || tokenData.error}`);
  }

  const accessToken = tokenData.access_token;

  // Step 2: Connect to Salesforce hosted MCP server
  const mcpServerUrl = new URL('https://api.salesforce.com/platform/mcp/v1/platform/sobject-all');
  const transport = new StreamableHTTPClientTransport(mcpServerUrl, {
    requestInit: { headers: { 'Authorization': `Bearer ${accessToken}` } }
  });

  const client = new Client({ name: 'bobcat-headless-site', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);

  // Step 3: Initialize session — Salesforce MCP requires listTools before any callTool
  await client.listTools();
  
  // Give the hosted server a moment to finish internal tenant initialization
  await new Promise(resolve => setTimeout(resolve, 1000));

  return client;
}

// Search Product2 by keyword
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const client = await getMCPClient();
    const soql = `SELECT Id, Name, Description, ProductCode, Family FROM Product2 WHERE (Name LIKE '%${query}%' OR Family LIKE '%${query}%' OR ProductCode LIKE '%${query}%') LIMIT 20`;

    const result = await client.callTool({
      name: 'soqlQuery',
      arguments: { q: soql }
    });

    await client.close();

    if (result.isError) {
      console.error('SOQL error:', (result.content as {text:string}[])[0]?.text);
      return [];
    }

    const text = (result.content as { type: string; text: string }[])[0]?.text;
    if (!text) return [];
    
    try {
      const parsed = JSON.parse(text);
      return (parsed.records || []) as Product[];
    } catch (e) {
      console.error('Failed to parse SOQL result:', text);
      return [];
    }
  } catch (err: any) {
    console.error('searchProducts error:', err.message);
    return [];
  }
}

// Get a single Product2 by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const client = await getMCPClient();
    const soql = `SELECT Id, Name, Description, ProductCode, Family FROM Product2 WHERE Id = '${id}' LIMIT 1`;

    const result = await client.callTool({
      name: 'soqlQuery',
      arguments: { q: soql }
    });

    await client.close();

    if (result.isError) return null;

    const text = (result.content as { type: string; text: string }[])[0]?.text;
    if (!text) return null;
    
    try {
      const parsed = JSON.parse(text);
      const records = parsed.records || [];
      return records.length > 0 ? records[0] : null;
    } catch (e) {
      console.error('Failed to parse SOQL result:', text);
      return null;
    }
  } catch (err: any) {
    console.error('getProductById error:', err.message);
    return null;
  }
}

// Create a Salesforce Lead
export async function createLeadAction(formData: FormData): Promise<{ success: boolean; leadId?: string; error?: string }> {
  const fullName = (formData.get('fullName') as string) || '';
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
  const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : fullName;

  const leadData = {
    FirstName: firstName,
    LastName: lastName || 'Unknown',
    Email: formData.get('email') as string,
    Phone: formData.get('phone') as string,
    Company: (formData.get('company') as string) || 'Not Specified',
    Description: formData.get('message') as string,
    LeadSource: 'Web',
  };

  try {
    const client = await getMCPClient();

    const result = await client.callTool({
      name: 'createSobjectRecord',
      arguments: { "sobject-name": "Lead", "body": leadData }
    });

    await client.close();

    if (result.isError) {
      const errorMsg = (result.content as {text: string}[])[0]?.text || 'MCP error';
      return { success: false, error: errorMsg };
    }

    const text = (result.content as { type: string; text: string }[])[0].text;
    const parsed = JSON.parse(text);
    return { success: true, leadId: parsed.id || parsed.Id };
  } catch (err: any) {
    console.error('createLeadAction error:', err.message);
    return { success: false, error: err.message };
  }
}
