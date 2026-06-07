import { SignJWT, jwtVerify } from 'jose';
import Papa from 'papaparse';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'super-secret-admin-analysis-key-12345'
);

// Fallback to the new URL if env variable is somehow not loaded on client
const SHEET_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_CSV_URL || 'https://docs.google.com/spreadsheets/d/1yKGYDJN4Chtk2vow07Kz5hPfirLdYIuqsxtsHXBk588/gviz/tq?tqx=out:csv&sheet=Login';

export async function fetchUsers() {
  const res = await fetch(SHEET_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch users from Google Sheets');
  const csvText = await res.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
}

export async function authenticateUser(email, password) {
  const users = await fetchUsers();
  
  const user = users.find(u => u.Email?.toLowerCase().trim() === email.toLowerCase().trim());
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  // Checking password (plain text as per current sheet structure)
  if (user.PasswordHash !== password) {
    return { success: false, error: 'Invalid password' };
  }

  if (user.Status?.toLowerCase() !== 'active') {
    return { success: false, error: 'Account is not active' };
  }
  
  return { 
    success: true, 
    user: {
      id: user.ID,
      name: user['Full Name'],
      email: user.Email,
      role: user.Role,
      permissions: user.Permissions
    }
  };
}

export async function createSession(user) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
  
  return token;
}

export async function verifySession(token) {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload;
  } catch (err) {
    return null;
  }
}
