import { NextResponse } from 'next/server'

// In a real application, this would connect to a database or backend service
// For now, we'll simulate the backend status
const operationStatus: { [key: string]: { status: string, tx1Hash?: string, txHash?: string } } = {}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const operationId = searchParams.get('operationId')
  const txHash = searchParams.get('txHash')

  if (!operationId && !txHash) {
    return NextResponse.json({ error: 'Operation ID or TX Hash required' }, { status: 400 })
  }

  // Debug logging
  console.log('🔍 API Status Check:', { operationId, txHash })
  console.log('📊 Available operations:', Object.keys(operationStatus))
  console.log('📋 Full status:', operationStatus)

  // Search by operationId first, then by txHash
  let status = { status: 'pending' }
  
  if (operationId) {
    status = operationStatus[operationId] || { status: 'pending' }
    console.log('🎯 Found by operationId:', status)
  } else if (txHash) {
    // Search for status by txHash (look through all operations)
    console.log('🔍 Searching for txHash:', txHash)
    for (const [id, opStatus] of Object.entries(operationStatus)) {
      console.log(`  Checking operation ${id}:`, opStatus)
      if (opStatus.txHash === txHash || id.includes(txHash.slice(-8))) {
        status = opStatus
        console.log('✅ Found match:', status)
        break
      }
    }
    if (status.status === 'pending') {
      console.log('❌ No match found for txHash')
    }
  }
  
  return NextResponse.json(status)
}

export async function POST(request: Request) {
  const { operationId, status, tx1Hash, txHash } = await request.json()

  console.log('📥 Backend notification received:', { operationId, status, tx1Hash, txHash })

  if (!operationId) {
    return NextResponse.json({ error: 'Operation ID required' }, { status: 400 })
  }

  operationStatus[operationId] = { status, tx1Hash, txHash }
  
  console.log('💾 Stored operation status:', operationStatus[operationId])
  console.log('📊 All operations now:', Object.keys(operationStatus))
  
  return NextResponse.json({ success: true })
}
