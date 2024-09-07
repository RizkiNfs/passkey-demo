import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { turso } from '@/utils/db'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {

  try {
   
    const body = await request.json()
    const options =  await generateRegistrationOptions({
      rpID: 'localhost',
      rpName: 'webauthn-demo',
      userName: body.username,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    const res = await turso.execute({
      sql: 'INSERT INTO challenges (id, webauthnUserId, username, challenges) VALUES (?,?,?,?) RETURNING *',
      args: [nanoid(), options.user.id, body.username, options.challenge]
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

