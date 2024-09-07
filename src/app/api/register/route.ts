import { NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { turso } from '@/utils/db'
import { nanoid } from 'nanoid'


export async function POST(request: Request) {

  try {

    interface RequestBody {
      credential: any
      username: string
      hobby: string
      challengeId: string
    }
    const { credential, username, hobby, challengeId }: RequestBody = await request.json()

    const [res] = (await turso.execute({
      sql: 'SELECT * FROM challenges WHERE id = ?',
      args: [challengeId]
    })).rows
    
    const { verified, registrationInfo: info } = await verifyRegistrationResponse({
      response: credential,
      expectedRPID: 'localhost',
      expectedOrigin: 'http://localhost:3000',
      expectedChallenge: res.challenges as string,
      requireUserVerification: false,
    });


    const userId = nanoid()
    await turso.execute({
      sql: 'INSERT INTO users (id, username,  hobby) VALUES (?, ?, ?)',
      args: [userId, username, hobby]
    })

    await turso.execute({
      sql: 'INSERT INTO passkeys (id, publicKey, userId, webauthnUserId, transport, backedUp, deviceType, counter) VALUES (?,?,?,?,?,?,?,?)',
      args: [
        info?.credentialID,
        info?.credentialPublicKey.join(','),
        userId,
        res.webauthnUserId,
        credential.response.transports.join(','),
        info?.credentialBackedUp,
        info?.credentialDeviceType,
        info?.counter
      ]
    })


    const response = NextResponse.json(
      { verified, info }
    )

    response.cookies.set('token', 'rahasia', { httpOnly: true, maxAge: 999999 })
    response.cookies.set('username', username, { httpOnly: true, maxAge: 999999 })

    return response
    
  } catch(err) {
    console.log('err: ', err)
    return NextResponse.json(
      { data: err },
      { status: 500 }
    )

  }


}


