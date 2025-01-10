import { Description, Field, FieldGroup, Fieldset, Label, Legend } from '@/components/catalyste/fieldset'
import { Input } from '@/components/catalyste/input'
import { Select } from '@/components/catalyste/select'
import { Text } from '@/components/catalyste/text'
import { Textarea } from '@/components/catalyste/textarea'
import { Button } from '@/components/catalyste/button'
import { login, signup } from './actions'

export default function Page() {
    return (
        <div className='bg-white max-w-2xl mx-auto'>
            <form className='flex flex-col pt-12'>
                <Field className=''>
                    <Text className='text-black text-xl'>Email</Text>
                    <Input className='border-2 border-black' id="email" name="email" type="email" required />
                </Field>
                <Field>
                    <Text className='text-black' htmlFor="password">Password:</Text>
                    <Input className='border-2 border-black' id="password" name="password" type="password" required />
                </Field>

                <Button formAction={login} type='submit'>Log in</Button>
                <Button>Sign up</Button>
            </form>
        </div>
    )
}