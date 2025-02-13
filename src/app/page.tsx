import { turso } from '@/utils/db'
import { cookies } from 'next/headers'

const placeholderData = [
  { username: 'ipsum dolor', hobby: 'sit amet' },
  { username: 'adipiscing elit', hobby: 'sed do' },
  { username: 'tempor incididunt ut', hobby: 'labore et dolore' },
  { username: 'aliqua', hobby: 'Ut enim ad' },
]

export default async function Home() {
  const token = cookies().get('token')

  const renderTable = ({ className = '', data = placeholderData }: { className?: string, data?: typeof placeholderData  } = {}) => (
    <div className="rounded-lg border overflow-x-auto">
      <table className={` ${className} table-auto border-collapse w-full`}>
        <thead>
          <tr>
            <th className="p-4">Username</th>
            <th className="p-4">Hobby</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td className="bg-slate-900 border-b p-4 text-center">{item.username}</td>
              <td className="bg-slate-900 border-b p-4 text-center">{item.hobby}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )


  if(!token?.value) {
    return (
      <main className="max-w-screen-lg mx-auto">
        <h2 className="mb-6">Login to see the data</h2>
        {renderTable({ className: 'blur-sm select-none'})}
      </main>
    )
  }

  const res = (await turso.execute('SELECT * FROM users LIMIT 100')).rows as any[]


  return (
    <main className="max-w-screen-lg mx-auto">
      <h2 className="mb-6">Welcome</h2>
      {renderTable({ data: res })}
    </main>
  )
}
