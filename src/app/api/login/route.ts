import { NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { VerifyAuthenticationResponseOpts } from '@simplewebauthn/server'
import { turso } from '@/utils/db'
export async function POST(request: Request) {

  try {

    interface RequestBody {
      credential: VerifyAuthenticationResponseOpts['response']
      username: string
      challengeId: string
    }
    const { credential, username, challengeId }: RequestBody = await request.json()

    const [user] = (await turso.execute({sql: 'SELECT * FROM users WHERE username = ?', args: [username]})).rows as any[]
 
    const [passkeys] = (await turso.execute({sql: 'SELECT * FROM passkeys WHERE userId = ?', args: [user.id]})).rows as any[]

    if(!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    const [challenge] = (await turso.execute({
      sql: 'SELECT * FROM challenges WHERE id = ?',
      args: [challengeId]
    })).rows

    credential.response.authenticatorData

    const { verified, authenticationInfo: info } = await verifyAuthenticationResponse({
      response: credential,
      expectedRPID: process.env.NEXT_PUBLIC_RP_ID as string,
      expectedOrigin: process.env.NEXT_PUBLIC_ORIGIN as string,
      expectedChallenge: challenge.challenges as string,
      authenticator: {
        credentialPublicKey: new Uint8Array(passkeys.publicKey.split(',').map(Number)),
        credentialID: passkeys.id,
        counter: passkeys.counter,
      }
    });


    const response = NextResponse.json(
      { verified, info },
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


