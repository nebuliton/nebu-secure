import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::consume
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:44
 * @route '/api/share-links/{token}'
 */
export const consume = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: consume.url(args, options),
    method: 'get',
})

consume.definition = {
    methods: ["get","head"],
    url: '/api/share-links/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::consume
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:44
 * @route '/api/share-links/{token}'
 */
consume.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    token: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        token: args.token,
                }

    return consume.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::consume
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:44
 * @route '/api/share-links/{token}'
 */
consume.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: consume.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::consume
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:44
 * @route '/api/share-links/{token}'
 */
consume.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: consume.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::consume
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:44
 * @route '/api/share-links/{token}'
 */
    const consumeForm = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: consume.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::consume
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:44
 * @route '/api/share-links/{token}'
 */
        consumeForm.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: consume.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::consume
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:44
 * @route '/api/share-links/{token}'
 */
        consumeForm.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: consume.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    consume.form = consumeForm
/**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::store
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:23
 * @route '/api/vault-items/{vaultItem}/share-link'
 */
export const store = (args: { vaultItem: number | { id: number } } | [vaultItem: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/vault-items/{vaultItem}/share-link',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::store
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:23
 * @route '/api/vault-items/{vaultItem}/share-link'
 */
store.url = (args: { vaultItem: number | { id: number } } | [vaultItem: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { vaultItem: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { vaultItem: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    vaultItem: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        vaultItem: typeof args.vaultItem === 'object'
                ? args.vaultItem.id
                : args.vaultItem,
                }

    return store.definition.url
            .replace('{vaultItem}', parsedArgs.vaultItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::store
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:23
 * @route '/api/vault-items/{vaultItem}/share-link'
 */
store.post = (args: { vaultItem: number | { id: number } } | [vaultItem: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::store
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:23
 * @route '/api/vault-items/{vaultItem}/share-link'
 */
    const storeForm = (args: { vaultItem: number | { id: number } } | [vaultItem: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\VaultItemShareLinkController::store
 * @see app/Http/Controllers/Api/VaultItemShareLinkController.php:23
 * @route '/api/vault-items/{vaultItem}/share-link'
 */
        storeForm.post = (args: { vaultItem: number | { id: number } } | [vaultItem: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
const VaultItemShareLinkController = { consume, store }

export default VaultItemShareLinkController