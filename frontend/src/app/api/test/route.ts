import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('=== GET /api/test ===')
    
    // Test session
    const session = await getServerSession(authOptions)
    console.log('Session test:', session ? {
      userId: session.user?.id,
      userEmail: session.user?.email,
      userName: session.user?.name
    } : 'No session')
    
    // Test database connection
    const userCount = await db.user.count()
    console.log('Database test - User count:', userCount)
    
    // Test patient count
    const patientCount = await db.patient.count()
    console.log('Database test - Patient count:', patientCount)
    
    return NextResponse.json({
      success: true,
      session: session ? {
        userId: session.user?.id,
        userEmail: session.user?.email,
        userName: session.user?.name
      } : null,
      database: {
        connected: true,
        userCount,
        patientCount
      }
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}