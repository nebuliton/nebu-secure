import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Admin\GroupController::index
 * @see app/Http/Controllers/Api/Admin/GroupController.php:19
 * @route '/api/admin/groups'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/admin/groups',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::index
 * @see app/Http/Controllers/Api/Admin/GroupController.php:19
 * @route '/api/admin/groups'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::index
 * @see app/Http/Controllers/Api/Admin/GroupController.php:19
 * @route '/api/admin/groups'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Admin\GroupController::index
 * @see app/Http/Controllers/Api/Admin/GroupController.php:19
 * @route '/api/admin/groups'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\Admin\GroupController::index
 * @see app/Http/Controllers/Api/Admin/GroupController.php:19
 * @route '/api/admin/groups'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\Admin\GroupController::index
 * @see app/Http/Controllers/Api/Admin/GroupController.php:19
 * @route '/api/admin/groups'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\Admin\GroupController::index
 * @see app/Http/Controllers/Api/Admin/GroupController.php:19
 * @route '/api/admin/groups'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Api\Admin\GroupController::store
 * @see app/Http/Controllers/Api/Admin/GroupController.php:28
 * @route '/api/admin/groups'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/admin/groups',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::store
 * @see app/Http/Controllers/Api/Admin/GroupController.php:28
 * @route '/api/admin/groups'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::store
 * @see app/Http/Controllers/Api/Admin/GroupController.php:28
 * @route '/api/admin/groups'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\Admin\GroupController::store
 * @see app/Http/Controllers/Api/Admin/GroupController.php:28
 * @route '/api/admin/groups'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\Admin\GroupController::store
 * @see app/Http/Controllers/Api/Admin/GroupController.php:28
 * @route '/api/admin/groups'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\Admin\GroupController::show
 * @see app/Http/Controllers/Api/Admin/GroupController.php:45
 * @route '/api/admin/groups/{group}'
 */
export const show = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/admin/groups/{group}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::show
 * @see app/Http/Controllers/Api/Admin/GroupController.php:45
 * @route '/api/admin/groups/{group}'
 */
show.url = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { group: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    group: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        group: typeof args.group === 'object'
                ? args.group.id
                : args.group,
                }

    return show.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::show
 * @see app/Http/Controllers/Api/Admin/GroupController.php:45
 * @route '/api/admin/groups/{group}'
 */
show.get = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Admin\GroupController::show
 * @see app/Http/Controllers/Api/Admin/GroupController.php:45
 * @route '/api/admin/groups/{group}'
 */
show.head = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\Admin\GroupController::show
 * @see app/Http/Controllers/Api/Admin/GroupController.php:45
 * @route '/api/admin/groups/{group}'
 */
    const showForm = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\Admin\GroupController::show
 * @see app/Http/Controllers/Api/Admin/GroupController.php:45
 * @route '/api/admin/groups/{group}'
 */
        showForm.get = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\Admin\GroupController::show
 * @see app/Http/Controllers/Api/Admin/GroupController.php:45
 * @route '/api/admin/groups/{group}'
 */
        showForm.head = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Api\Admin\GroupController::update
 * @see app/Http/Controllers/Api/Admin/GroupController.php:52
 * @route '/api/admin/groups/{group}'
 */
export const update = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/admin/groups/{group}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::update
 * @see app/Http/Controllers/Api/Admin/GroupController.php:52
 * @route '/api/admin/groups/{group}'
 */
update.url = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { group: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    group: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        group: typeof args.group === 'object'
                ? args.group.id
                : args.group,
                }

    return update.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::update
 * @see app/Http/Controllers/Api/Admin/GroupController.php:52
 * @route '/api/admin/groups/{group}'
 */
update.put = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\Admin\GroupController::update
 * @see app/Http/Controllers/Api/Admin/GroupController.php:52
 * @route '/api/admin/groups/{group}'
 */
update.patch = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\Admin\GroupController::update
 * @see app/Http/Controllers/Api/Admin/GroupController.php:52
 * @route '/api/admin/groups/{group}'
 */
    const updateForm = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\Admin\GroupController::update
 * @see app/Http/Controllers/Api/Admin/GroupController.php:52
 * @route '/api/admin/groups/{group}'
 */
        updateForm.put = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\Admin\GroupController::update
 * @see app/Http/Controllers/Api/Admin/GroupController.php:52
 * @route '/api/admin/groups/{group}'
 */
        updateForm.patch = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Api\Admin\GroupController::destroy
 * @see app/Http/Controllers/Api/Admin/GroupController.php:69
 * @route '/api/admin/groups/{group}'
 */
export const destroy = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/admin/groups/{group}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::destroy
 * @see app/Http/Controllers/Api/Admin/GroupController.php:69
 * @route '/api/admin/groups/{group}'
 */
destroy.url = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { group: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    group: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        group: typeof args.group === 'object'
                ? args.group.id
                : args.group,
                }

    return destroy.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Admin\GroupController::destroy
 * @see app/Http/Controllers/Api/Admin/GroupController.php:69
 * @route '/api/admin/groups/{group}'
 */
destroy.delete = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\Admin\GroupController::destroy
 * @see app/Http/Controllers/Api/Admin/GroupController.php:69
 * @route '/api/admin/groups/{group}'
 */
    const destroyForm = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\Admin\GroupController::destroy
 * @see app/Http/Controllers/Api/Admin/GroupController.php:69
 * @route '/api/admin/groups/{group}'
 */
        destroyForm.delete = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const GroupController = { index, store, show, update, destroy }

export default GroupController