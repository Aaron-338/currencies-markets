import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);

  // Only allow super admins (admins without verification responsibilities)
  const isSuperAdmin =
    session?.user?.role === 'admin' &&
    (!session?.user?.verificationResponsibilities || session.user.verificationResponsibilities.length === 0);

  if (!session?.accessToken || !isSuperAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const userId = params.id;
    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/users/${userId}/permissions`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errorMessage = 'Failed to update user permissions';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const text = await res.text();
        errorMessage = text || errorMessage;
      }
      return NextResponse.json({ message: errorMessage }, { status: res.status });
    }

    const updatedUser = await res.json();
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
