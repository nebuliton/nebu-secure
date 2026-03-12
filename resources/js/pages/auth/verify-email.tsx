// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="E-Mail bestätigen"
            description="Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir gerade gesendet haben."
        >
            <Head title="E-Mail-Bestätigung" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Ein neuer Bestätigungslink wurde an die E-Mail-Adresse
                    gesendet, die du bei der Registrierung angegeben hast.
                </div>
            )}

            <Form
                action="/email/verification-notification"
                method="post"
                className="space-y-6 text-center"
            >
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Bestätigungs-E-Mail erneut senden
                        </Button>

                        <TextLink
                            href="/logout"
                            className="mx-auto block text-sm"
                        >
                            Abmelden
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
