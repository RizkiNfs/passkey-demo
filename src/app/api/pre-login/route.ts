import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { nanoid } from 'nanoid'
import { turso } from '@/utils/db'

export async function POST(request: Request) {

  try {


    const body = await request.json()
    const [user] = (await turso.execute({sql: 'SELECT * FROM users WHERE username = ?', args: [body.username]})).rows as any[]
    const passkeys = (await turso.execute({sql: 'SELECT * FROM passkeys WHERE userId = ?', args: [body.username]})).rows as any[]

    if(!user) {
      return NextResponse.json(
        { data: 'not found' },
        { status: 404 }
      )
    }
    
    const options = await generateAuthenticationOptions({
      userVerification: 'required',
      rpID: process.env.NEXT_PUBLIC_RP_ID as string,
      allowCredentials: passkeys.map(passkey => ({
        id: passkey.id,
        type: 'public-key',
      }))
    });

    const res = await turso.execute({
      sql: 'INSERT INTO challenges (id, webauthnUserId, username, challenges) VALUES (?,?,?,?) RETURNING *',
      args: [nanoid(), '-', body.username, options.challenge]
    })

    return NextResponse.json({ data: options, challengeId: res.rows[0].id })
    
  } catch(err) {
    console.log('err: ', err)
    return NextResponse.json(
      { data: err },
      { status: 500 }
    )
  }


}

