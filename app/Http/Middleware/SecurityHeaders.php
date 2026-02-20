<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $csp = app()->isLocal()
            ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https:; script-src-elem 'self' 'unsafe-inline' http: https:; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' data:; font-src 'self' data: https://fonts.bunny.net; connect-src 'self' ws: wss: http: https:; frame-ancestors 'none'; form-action 'self'; base-uri 'self'"
            : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' data:; font-src 'self' data: https://fonts.bunny.net; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'";

        $response->headers->set('Content-Security-Policy', $csp);
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
