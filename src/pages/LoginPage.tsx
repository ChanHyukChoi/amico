import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { login } from '@/api/auth'
import type { LoginRequest } from '@/types/auth'

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = async (data: LoginRequest) => {
    const result = await login(data)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError('root', { message: result.message ?? t('login.error') })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm p-6 bg-white rounded-lg shadow border flex flex-col gap-4"
      >
        <h1 className="text-xl font-semibold">{t('login.title')}</h1>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('login.username')}
          </label>
          <input
            {...register('username')}
            type="text"
            autoComplete="username"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('login.password')}
          </label>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        {errors.root && (
          <p className="text-sm text-red-600">{errors.root.message}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {t('login.submit')}
        </button>
      </form>
    </div>
  )
}
