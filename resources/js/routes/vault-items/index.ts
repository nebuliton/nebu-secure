import {
    queryParams,
    type RouteQueryOptions,
    type RouteDefinition,
    type RouteFormDefinition,
    applyUrlDefaults,
} from './../../wayfinder';
/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::index
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:22
 * @route '/api/admin/vault-items'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});

index.definition = {
    methods: ['get', 'head'],
    url: '/api/admin/vault-items',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::index
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:22
 * @route '/api/admin/vault-items'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::index
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:22
 * @route '/api/admin/vault-items'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::index
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:22
 * @route '/api/admin/vault-items'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::index
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:22
 * @route '/api/admin/vault-items'
 */
const indexForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::index
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:22
 * @route '/api/admin/vault-items'
 */
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});
/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::index
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:22
 * @route '/api/admin/vault-items'
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
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::store
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:34
 * @route '/api/admin/vault-items'
 */
export const store = (
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

store.definition = {
    methods: ['post'],
    url: '/api/admin/vault-items',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::store
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:34
 * @route '/api/admin/vault-items'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::store
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:34
 * @route '/api/admin/vault-items'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::store
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:34
 * @route '/api/admin/vault-items'
 */
const storeForm = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::store
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:34
 * @route '/api/admin/vault-items'
 */
storeForm.post = (
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

store.form = storeForm;
/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::show
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:76
 * @route '/api/admin/vault-items/{vaultItem}'
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
    url: '/api/admin/vault-items/{vaultItem}',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::show
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:76
 * @route '/api/admin/vault-items/{vaultItem}'
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
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::show
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:76
 * @route '/api/admin/vault-items/{vaultItem}'
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
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::show
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:76
 * @route '/api/admin/vault-items/{vaultItem}'
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
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::show
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:76
 * @route '/api/admin/vault-items/{vaultItem}'
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
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::show
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:76
 * @route '/api/admin/vault-items/{vaultItem}'
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
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::show
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:76
 * @route '/api/admin/vault-items/{vaultItem}'
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
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::update
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:83
 * @route '/api/admin/vault-items/{vaultItem}'
 */
export const update = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
});

update.definition = {
    methods: ['put', 'patch'],
    url: '/api/admin/vault-items/{vaultItem}',
} satisfies RouteDefinition<['put', 'patch']>;

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::update
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:83
 * @route '/api/admin/vault-items/{vaultItem}'
 */
update.url = (
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
        update.definition.url
            .replace('{vaultItem}', parsedArgs.vaultItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::update
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:83
 * @route '/api/admin/vault-items/{vaultItem}'
 */
update.put = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
});
/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::update
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:83
 * @route '/api/admin/vault-items/{vaultItem}'
 */
update.patch = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
});

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::update
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:83
 * @route '/api/admin/vault-items/{vaultItem}'
 */
const updateForm = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::update
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:83
 * @route '/api/admin/vault-items/{vaultItem}'
 */
updateForm.put = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});
/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::update
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:83
 * @route '/api/admin/vault-items/{vaultItem}'
 */
updateForm.patch = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

update.form = updateForm;
/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::destroy
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:134
 * @route '/api/admin/vault-items/{vaultItem}'
 */
export const destroy = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
});

destroy.definition = {
    methods: ['delete'],
    url: '/api/admin/vault-items/{vaultItem}',
} satisfies RouteDefinition<['delete']>;

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::destroy
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:134
 * @route '/api/admin/vault-items/{vaultItem}'
 */
destroy.url = (
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
        destroy.definition.url
            .replace('{vaultItem}', parsedArgs.vaultItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::destroy
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:134
 * @route '/api/admin/vault-items/{vaultItem}'
 */
destroy.delete = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
});

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::destroy
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:134
 * @route '/api/admin/vault-items/{vaultItem}'
 */
const destroyForm = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\Api\Admin\VaultItemController::destroy
 * @see app/Http/Controllers/Api/Admin/VaultItemController.php:134
 * @route '/api/admin/vault-items/{vaultItem}'
 */
destroyForm.delete = (
    args:
        | { vaultItem: number | { id: number } }
        | [vaultItem: number | { id: number }]
        | number
        | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

destroy.form = destroyForm;
const vaultItems = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
};

export default vaultItems;
