<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse;
use Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse;
use Laravel\Fortify\Fortify;

class PasswordResetLinkController extends Controller
{
    public function store(Request $request): Responsable
    {
        $emailField = Fortify::email();
        $normalizedEmail = Str::lower(trim((string) $request->input($emailField)));

        $request->merge([
            $emailField => $normalizedEmail,
        ]);

        $request->validate([
            $emailField => ['required', 'email'],
        ]);

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedEmail])
            ->first();

        if (! $user) {
            return app(FailedPasswordResetLinkRequestResponse::class, ['status' => Password::INVALID_USER]);
        }

        $status = Password::broker(config('fortify.passwords'))
            ->sendResetLink([$emailField => $user->email]);

        return $status === Password::RESET_LINK_SENT
            ? app(SuccessfulPasswordResetLinkRequestResponse::class, ['status' => $status])
            : app(FailedPasswordResetLinkRequestResponse::class, ['status' => $status]);
    }
}
