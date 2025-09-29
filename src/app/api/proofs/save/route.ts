import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const proofData = await request.json()
    
    // Create proofs directory if it doesn't exist
    const proofsDir = join(process.cwd(), 'generated-proofs')
    try {
      await mkdir(proofsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `ceaser-zk-proof-${timestamp}.json`
    const filepath = join(proofsDir, filename)
    
    // Save proof to file
    await writeFile(filepath, JSON.stringify(proofData, null, 2), 'utf8')
    
    console.log(`✅ Proof saved to backend: ${filename}`)
    console.log(`📊 Proof metadata:`, proofData.metadata)
    
    return NextResponse.json({ 
      success: true, 
      filename,
      filepath: `/generated-proofs/${filename}`,
      size: JSON.stringify(proofData).length,
      message: 'Proof saved successfully to backend'
    })
    
  } catch (error) {
    console.error('❌ Error saving proof to backend:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save proof to backend' 
    }, { status: 500 })
  }
}
