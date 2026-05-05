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

// Cache the client globally so we don't force Salesforce to re-initialize on every click
let globalMcpClient: Client | null = null;

async function getMCPClient(): Promise<Client> {
  if (globalMcpClient) {
    return globalMcpClient;
  }

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

  const client = new Client({ name: 'abc-heavy-equipments', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);

  // Step 3: Initialize session — Salesforce MCP requires listTools before any callTool
  await client.listTools();

  globalMcpClient = client;
  return client;
}

// Unified helper to call MCP tools with automatic retry on "not initialized" errors
async function callMCPToolWithRetry(toolName: string, args: any, attempt = 1): Promise<any> {
  let client;
  try {
    client = await getMCPClient();
    const result = await client.callTool({ name: toolName, arguments: args });

    if (result.isError) {
      const errorText = (result.content as {text:string}[])[0]?.text || '';
      if (errorText.includes("not been initialized") && attempt < 3) {
        console.log(`MCP server initialization lag on ${toolName}. Reconnecting (Attempt ${attempt + 1})...`);
        globalMcpClient = null; // Clear cache to force true reconnect
        await new Promise(resolve => setTimeout(resolve, 2000));
        return callMCPToolWithRetry(toolName, args, attempt + 1);
      }
    }
    return result;
  } catch (err: any) {
    globalMcpClient = null; // Clear cache on transport death
    
    if (err.message?.includes("not been initialized") && attempt < 3) {
      console.log(`MCP transport lag on ${toolName}. Reconnecting (Attempt ${attempt + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callMCPToolWithRetry(toolName, args, attempt + 1);
    }
    throw err;
  }
}

// Search Product2 by keyword
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const soql = `SELECT Id, Name, Description, ProductCode, Family FROM Product2 WHERE (Name LIKE '%${query}%' OR Family LIKE '%${query}%' OR ProductCode LIKE '%${query}%') LIMIT 20`;
    const result = await callMCPToolWithRetry('soqlQuery', { q: soql });

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
    const soql = `SELECT Id, Name, Description, ProductCode, Family FROM Product2 WHERE Id = '${id}' LIMIT 1`;
    const result = await callMCPToolWithRetry('soqlQuery', { q: soql });

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
  const productId = formData.get('productId') as string;

  const leadData: Record<string, any> = {
    FirstName: firstName,
    LastName: lastName || 'Unknown',
    Email: formData.get('email') as string,
    Phone: formData.get('phone') as string,
    Company: (formData.get('company') as string) || 'Not Specified',
    Description: formData.get('message') as string,
    LeadSource: 'Web',
  };

  if (productId) {
    leadData.Interested_Product__c = productId;
  }

  try {
    const result = await callMCPToolWithRetry('createSobjectRecord', { "sobject-name": "Lead", "body": leadData });

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
