'use client'
import { FormEvent, useState } from 'react'
import { startAuthentication } from '@simplewebauthn/browser';

export default function Login(){

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
   
    setLoading(true)
    e.preventDefault()
    
    try {

      const formData = new FormData(e.target as HTMLFormElement)
      const username = formData.get('username')

      const { data: loginOpts, challengeId } = await (await fetch(
        '/api/pre-login', 
        { 
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ username }) 
        })
      ).json()

      const credential = await startAuthentication(loginOpts)

      await (await fetch(
        '/api/login', 
        { 
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ credential, username, challengeId }) 
        })
      ).json()


      location.href = '/'

    } catch(err) {
      console.log('err: ', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <form autoComplete="off" className="flex flex-col gap-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-y-2">
          <label> username </label>
          <input 
            className="h-10 rounded-md"
            name="username"
            autoComplete="username webauthn"
          />
        </div>
        <button type="submit" disabled={loading}>
        {loading ? '...Loading' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}