import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
 * @see routes/web.php:24
 * @route '/admin'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:24
 * @route '/admin'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:24
 * @route '/admin'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:24
 * @route '/admin'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:24
 * @route '/admin'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:24
 * @route '/admin'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:24
 * @route '/admin'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
 * @see routes/web.php:29
 * @route '/admin/users'
 */
export const users = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})

users.definition = {
    methods: ["get","head"],
    url: '/admin/users',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:29
 * @route '/admin/users'
 */
users.url = (options?: RouteQueryOptions) => {
    return users.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:29
 * @route '/admin/users'
 */
users.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:29
 * @route '/admin/users'
 */
users.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: users.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:29
 * @route '/admin/users'
 */
    const usersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: users.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:29
 * @route '/admin/users'
 */
        usersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: users.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:29
 * @route '/admin/users'
 */
        usersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: users.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    users.form = usersForm
/**
 * @see routes/web.php:34
 * @route '/admin/groups'
 */
export const groups = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: groups.url(options),
    method: 'get',
})

groups.definition = {
    methods: ["get","head"],
    url: '/admin/groups',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:34
 * @route '/admin/groups'
 */
groups.url = (options?: RouteQueryOptions) => {
    return groups.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:34
 * @route '/admin/groups'
 */
groups.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: groups.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:34
 * @route '/admin/groups'
 */
groups.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: groups.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:34
 * @route '/admin/groups'
 */
    const groupsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: groups.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:34
 * @route '/admin/groups'
 */
        groupsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: groups.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:34
 * @route '/admin/groups'
 */
        groupsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: groups.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    groups.form = groupsForm
/**
 * @see routes/web.php:39
 * @route '/admin/vault-items'
 */
export const vaultItems = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vaultItems.url(options),
    method: 'get',
})

vaultItems.definition = {
    methods: ["get","head"],
    url: '/admin/vault-items',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:39
 * @route '/admin/vault-items'
 */
vaultItems.url = (options?: RouteQueryOptions) => {
    return vaultItems.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:39
 * @route '/admin/vault-items'
 */
vaultItems.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vaultItems.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:39
 * @route '/admin/vault-items'
 */
vaultItems.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vaultItems.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:39
 * @route '/admin/vault-items'
 */
    const vaultItemsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: vaultItems.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:39
 * @route '/admin/vault-items'
 */
        vaultItemsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vaultItems.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:39
 * @route '/admin/vault-items'
 */
        vaultItemsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: vaultItems.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    vaultItems.form = vaultItemsForm
const admin = {
    dashboard: Object.assign(dashboard, dashboard),
users: Object.assign(users, users),
groups: Object.assign(groups, groups),
vaultItems: Object.assign(vaultItems, vaultItems),
}

export default admin