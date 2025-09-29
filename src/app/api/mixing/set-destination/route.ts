import { NextRequest, NextResponse } from 'next/server'

interface MixingRequest {
  operationId: number
  destinationAddress: string
  txHash: string
  userAddress: string
  amount: string
}

// Simple in-memory storage (in production, use a proper database)
const pendingOperations = new Map<string, MixingRequest>()

export async function POST(request: NextRequest) {
  try {
    const body: MixingRequest = await request.json()
    
    console.log('📡 Received mixing request:', body)
    
    // Validate the request
    if (!body.destinationAddress || !body.txHash || !body.userAddress || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Store the request (keyed by txHash for now)
    pendingOperations.set(body.txHash, body)
    
    console.log('✅ Stored mixing request:', body.txHash)
    console.log('📊 Total pending operations:', pendingOperations.size)
    
    // TODO: Trigger TX1 execution here
    // For now, just acknowledge receipt
    
    return NextResponse.json({ 
      success: true, 
      message: 'Mixing request received',
      operationId: body.operationId 
    })
    
  } catch (error) {
    console.error('❌ Error processing mixing request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// GET endpoint to check pending operations (for debugging)
export async function GET() {
  return NextResponse.json({
    pendingOperations: Array.from(pendingOperations.entries()),
    count: pendingOperations.size
  })
}
