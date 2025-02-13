'use client'
import { FormEvent, useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser';

export default function Register(){

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    
    setLoading(true)
    e.preventDefault()

    try {

      const formData = new FormData(e.target as HTMLFormElement)
      const username = formData.get('username')
      const name = formData.get('name')
      const hobby = formData.get('hobby')

      const { data: registrationOpts, challengeId } = await (await fetch(
        '/api/pre-register', 
        { 
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ username }) 
        })
      ).json()

      const credential = await startRegistration(registrationOpts)

      await (await fetch(
        '/api/register', 
        { 
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ credential, username, name, hobby, challengeId }) 
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
          <label> Username </label>
          <input 
            className="h-10 rounded-md"
            name="username"
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <label> Hobby </label>
          <input 
            className="h-10 rounded-md" 
            name="hobby"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '...Loading' : 'Register'}
        </button>
      </form>
    </div>
  )
}