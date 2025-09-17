import { ErrorMutation } from '@/components/Errors'
import { Loading2 } from '@/components/Loading'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { q$ } from '@/store'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { NavLink as Link, useNavigate } from 'react-router-dom'
import * as v from 'valibot'

const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your email.'),
    v.email('The email is badly formatted.'),
    v.maxLength(30, 'Your email is too long.'),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your password.'),
    // v.minLength(8, 'Your password is too short.'),
    // v.maxLength(30, 'Your password is too long.'),
    // v.regex(/[a-z]/, 'Your password must contain a lowercase letter.'),
    // v.regex(/[A-Z]/, 'Your password must contain a uppercase letter.'),
    // v.regex(/[0-9]/, 'Your password must contain a number.'),
  ),
})

export function Component() {
  const navigate = useNavigate()
  const companyInfo = q$.General.CompanyInfoQuery.getData()

  const form = useForm({
    defaultValues: { email: '', password: '' },
    // defaultValues: { email: 'scope1@ghgcope.com', password: '12345678' },
    resolver: valibotResolver(LoginSchema),
  })

  const mutation = useMutation(
    q$.General.AuthQuery.login({
      onSuccess: () => {
        const isEmissionAvailable = q$.General.CompanyInfoQuery.isFeatureAvailable('emission')
        const redirectUrl = isEmissionAvailable ? '/emission/dashboard' : '/'
        navigate(redirectUrl, { replace: true })
      },
      onError: () => {
        toast({
          title: 'Something went wrong.',
          description: 'Your sign in request failed. Please try again.',
          variant: 'destructive',
        })
      },
    }),
  )

  return (
    <>
      <div className='container grid relative min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
        <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
          <img
            src='/adrien-olichon-_GH9LwhlSO4-unsplash.jpg'
            className='object-fit-cover h-full w-full rotate-180 absolute inset-0 bg-primary'
          />
          <div className='z-20 absolute inset-0 bg-primary/10'></div>
          {companyInfo.metadata.icon ?
            <div className='relative flex items-center justify-center w-full h-full'>
              <img src={companyInfo.metadata.icon} className=' max-w-md' />
            </div>
          : <div className='relative z-20 flex items-center text-lg font-medium'>Ghgcope @ {`${companyInfo.name}`}</div>
          }
        </div>
        <div className='lg:p-8'>
          <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
            {/*<div className='flex flex-col space-y-2 text-center'>*/}
            {/*  <h1 className='text-2xl font-semibold tracking-tight'>Create an account</h1>*/}
            {/*  <p className='text-sm text-muted-foreground'>Enter your email below to create your account</p>*/}
            {/*</div>*/}
            <div className='flex flex-col space-y-2 text-center'>
              <h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
              <p className='text-sm text-muted-foreground'>Enter your email to sign in to your account</p>
            </div>

            <ErrorMutation mutation={mutation} className='p-0' />

            <Form {...form}>
              <form onSubmit={form.handleSubmit((e) => mutation.mutate(e))}>
                <div className='grid gap-2'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Input</FormLabel>
                        <FormControl>
                          <Input
                            id='email'
                            placeholder='name@example.com'
                            type='email'
                            autoCapitalize='none'
                            autoComplete='email'
                            autoCorrect='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            id='password'
                            type='password'
                            autoCapitalize='none'
                            autoComplete='password'
                            autoCorrect='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button disabled={mutation.isPending} type='submit' className='flex gap-x-2'>
                    {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
                    Sign in
                  </Button>
                </div>
              </form>
            </Form>

            {/*<p className='px-8 text-center text-sm text-muted-foreground'>*/}
            {/*  <Link to='/forgot-password' className='hover:text-brand underline underline-offset-4'>*/}
            {/*    forgot-password?*/}
            {/*  </Link>*/}
            {/*</p>*/}

            <p className='px-8 text-center text-sm text-muted-foreground'>
              By clicking continue, you agree to our{' '}
              <Link to='/terms' className='underline underline-offset-4 hover:text-primary'>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to='/privacy' className='underline underline-offset-4 hover:text-primary'>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

Component.displayName = 'Login'
