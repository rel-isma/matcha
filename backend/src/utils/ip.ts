import { Request } from 'express';

export interface IPLocationData {
  latitude: number;
  longitude: number;
  city: string | null;
  region: string | null;
  country: string | null;
}


export function cleanClientIp(req: Request): string {
  const xf = (req.headers['x-forwarded-for'] as string || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)[0];
  
  const ip = xf || 
    req.socket?.remoteAddress || 
    (req.connection as any)?.remoteAddress || 
    '';
  
  return ip.replace(/^::ffff:/, '').replace(/\s+/, '');
}

export async function ipapiLookup(cleanIp: string): Promise<IPLocationData> {
    
  if (isLocalIP(cleanIp)) {
    return {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris',
      region: 'Île-de-France',
      country: 'France'
    };
  }

  const url = `https://ipapi.co/${encodeURIComponent(cleanIp)}/json/`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Matcha-App/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`ipapi failed with status: ${res.status}`);
    }
    
    const j = await res.json();
    if (!j || !j.latitude || !j.longitude) {
      throw new Error('no-coords in response');
    }
    
    return {
      latitude: +j.latitude,
      longitude: +j.longitude,
      city: j.city || null,
      region: j.region || null,
      country: j.country_name || j.country || null
    };
  } catch (error) {
    console.error('IP location lookup failed:', error);
    return {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris',
      region: 'Île-de-France',
      country: 'France'
    };
  }
}

export function isLocalIP(ip: string): boolean {
  return !ip || 
    ip === '127.0.0.1' || 
    ip === '::1' || 
    ip.startsWith('192.168.') || 
    ip.startsWith('10.') || 
    ip.startsWith('172.');
}