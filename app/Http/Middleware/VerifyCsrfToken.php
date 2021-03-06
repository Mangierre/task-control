<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;

class VerifyCsrfToken extends BaseVerifier
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'tasks/load',
        'tasks/process',
        '/tasks/save',
        '/hours-control/load',
        'system/users/load',
        'system/profiles/load',
        'system/profiles/save-permission',
    ];
}
