import {
    queryParams,
    type RouteQueryOptions,
    type RouteDefinition,
    type RouteFormDefinition,
    applyUrlDefaults,
} from './../../../../../wayfinder';
/**
 * @see \App\Http\Controllers\Api\VaultItemController::index
 * @see app/Http/Controllers/Api/VaultItemController.php:21
 * @route '/api/vault-items'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});

index.definition = {
    methods: ['get', 'head'],
    url: '/api/vault-items',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Api\VaultItemController::index
 * @see app/Http/Controllers/Api/VaultItemController.php:21
 * @route '/api/vault-items'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Api\VaultItemController::index
 * @see app/Http/Controllers/Api/VaultItemController.php:21
 * @route '/api/vault-items'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Api\VaultItemController::index
 * @see app/Http/Controllers/Api/VaultItemController.php:21
 * @route '/api/vault-items'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Api\VaultItemController::index
 * @see app/Http/Controllers/Api/VaultItemController.php:21
 * @route '/api/vault-items'
 */
const indexForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Api\VaultItemController::index
 * @see app/Http/Controllers/Api/VaultItemController.php:21
 * @route '/api/vault-items'
 */
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Api\VaultItemController::index
 * @see app/Http/Controllers/Api/VaultItemController.php:21
 * @route '/api/vault-items'
 */
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

index.form = indexForm;
/**
 * @see \App\Http\Controllers\Api\VaultItemController::show
 * @see app/Http/Controllers/Api/VaultItemController.php:71
 * @route '/api/vault-items/{vaultItem}'
 */
export const show = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
});

show.definition = {
    methods: ['get', 'head'],
    url: '/api/vault-items/{vaultItem}',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Api\VaultItemController::show
 * @see app/Http/Controllers/Api/VaultItemController.php:71
 * @route '/api/vault-items/{vaultItem}'
 */
show.url = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { vaultItem: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { vaultItem: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            vaultItem: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        vaultItem:
            typeof args.vaultItem === 'object'
                ? args.vaultItem.id
                : args.vaultItem,
    };

    return (
        show.definition.url
            .replace('{vaultItem}', parsedArgs.vaultItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Api\VaultItemController::show
 * @see app/Http/Controllers/Api/VaultItemController.php:71
 * @route '/api/vault-items/{vaultItem}'
 */
show.get = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Api\VaultItemController::show
 * @see app/Http/Controllers/Api/VaultItemController.php:71
 * @route '/api/vault-items/{vaultItem}'
 */
show.head = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Api\VaultItemController::show
 * @see app/Http/Controllers/Api/VaultItemController.php:71
 * @route '/api/vault-items/{vaultItem}'
 */
const showForm = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Api\VaultItemController::show
 * @see app/Http/Controllers/Api/VaultItemController.php:71
 * @route '/api/vault-items/{vaultItem}'
 */
showForm.get = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Api\VaultItemController::show
 * @see app/Http/Controllers/Api/VaultItemController.php:71
 * @route '/api/vault-items/{vaultItem}'
 */
showForm.head = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

show.form = showForm;
/**
 * @see \App\Http\Controllers\Api\VaultItemController::reveal
 * @see app/Http/Controllers/Api/VaultItemController.php:78
 * @route '/api/vault-items/{vaultItem}/reveal'
 */
export const reveal = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: reveal.url(args, options),
    method: 'post',
});

reveal.definition = {
    methods: ['post'],
    url: '/api/vault-items/{vaultItem}/reveal',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Api\VaultItemController::reveal
 * @see app/Http/Controllers/Api/VaultItemController.php:78
 * @route '/api/vault-items/{vaultItem}/reveal'
 */
reveal.url = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { vaultItem: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { vaultItem: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            vaultItem: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        vaultItem:
            typeof args.vaultItem === 'object'
                ? args.vaultItem.id
                : args.vaultItem,
    };

    return (
        reveal.definition.url
            .replace('{vaultItem}', parsedArgs.vaultItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Api\VaultItemController::reveal
 * @see app/Http/Controllers/Api/VaultItemController.php:78
 * @route '/api/vault-items/{vaultItem}/reveal'
 */
reveal.post = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: reveal.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Api\VaultItemController::reveal
 * @see app/Http/Controllers/Api/VaultItemController.php:78
 * @route '/api/vault-items/{vaultItem}/reveal'
 */
const revealForm = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: reveal.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Api\VaultItemController::reveal
 * @see app/Http/Controllers/Api/VaultItemController.php:78
 * @route '/api/vault-items/{vaultItem}/reveal'
 */
revealForm.post = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: reveal.url(args, options),
    method: 'post',
});

reveal.form = revealForm;
const VaultItemController = { index, show, reveal };

export default VaultItemController;
